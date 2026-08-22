const env = require('../../config/env');
const User = require('../../models/user.model');
const SignupSession = require('../../models/signupSession.model');
const otpService = require('../otp/otp.service');
const emailService = require('../email/email.service');
const tokenService = require('../token.service');
const { generateRandomToken, hashPassword, comparePassword } = require('../../utils/crypto');
const { normalizeEmail, normalizeIndianPhone, normalizeRegistrationNumber, normalizeName } = require('../../utils/normalizers');
const OTP_PURPOSES = require('../../constants/otpPurposes');
const logger = require('../../utils/logger');
const ocrService = require('../ocr/ocr.service');
const identityService = require('../identity/identity.service');

class AuthService {
  /**
   * Direct All-in-One Account Registration
   */
  async directRegister({ fullName, phone, registrationNumber, email: rawEmail, password, imageBuffer, meta = {} }) {
    const email = normalizeEmail(rawEmail);
    if (!email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com')) {
      return {
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Only official @gmail.com addresses are accepted.'
      };
    }

    const normPhone = normalizeIndianPhone(phone);
    if (!normPhone.isValid) {
      return {
        success: false,
        error: 'INVALID_PHONE',
        message: normPhone.error
      };
    }

    const normRegNo = normalizeRegistrationNumber(registrationNumber);
    const normName = normalizeName(fullName);

    // Uniqueness checks
    const [emailExists, phoneExists, regExists] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ phone: normPhone.normalized }),
      User.findOne({ registrationNumber: normRegNo })
    ]);

    if (emailExists) {
      return {
        success: false,
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'This Gmail address is already registered. Please sign in.'
      };
    }

    if (phoneExists) {
      return {
        success: false,
        error: 'PHONE_ALREADY_EXISTS',
        message: 'This mobile number is already registered with an existing account.'
      };
    }

    if (regExists) {
      return {
        success: false,
        error: 'REGISTRATION_ALREADY_EXISTS',
        message: 'This registration number is already registered with an existing account.'
      };
    }

    let collegeDetails = {
      course: 'Computer Science',
      department: 'Technology',
      year: 2,
      status: 'active'
    };

    // If ID card imageBuffer is provided, run OCR verification
    if (imageBuffer) {
      const ocrResult = await ocrService.processIdCard(imageBuffer);
      if (ocrResult.success && ocrResult.extracted.name && ocrResult.extracted.registrationNumber) {
        const verification = await identityService.verifyIdentity({
          enteredName: normName,
          enteredRegNo: normRegNo,
          ocrName: ocrResult.extracted.name,
          ocrRegNo: ocrResult.extracted.registrationNumber
        });

        if (!verification.verified) {
          return {
            success: false,
            error: verification.errorType || 'ID_VERIFICATION_FAILED',
            message: verification.message || 'ID Card verification failed.'
          };
        }

        if (verification.collegeDetails) {
          collegeDetails = verification.collegeDetails;
        }
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      email,
      phone: normPhone.normalized,
      registrationNumber: normRegNo,
      fullName: normName,
      passwordHash,
      collegeDetails,
      isVerified: true,
      lastLoginAt: new Date()
    });

    logger.success(`Delhast Account created: ${newUser.email} (${newUser.registrationNumber})`);

    const accessToken = tokenService.generateAccessToken(newUser);
    const { refreshToken, expiresAt: refreshExpiresAt } = await tokenService.createSession({
      userId: newUser._id,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress
    });

    return {
      success: true,
      user: {
        id: newUser._id,
        email: newUser.email,
        phone: newUser.phone,
        registrationNumber: newUser.registrationNumber,
        fullName: newUser.fullName,
        role: newUser.role,
        collegeDetails: newUser.collegeDetails
      },
      accessToken,
      refreshToken,
      refreshExpiresAt,
      message: 'Account created successfully!'
    };
  }
  /**
   * Step 1A: Send Email Verification OTP
   */
  async sendEmailOtp(rawEmail) {
    const email = normalizeEmail(rawEmail);

    // Check if user is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'This Gmail address is already registered. Please sign in.'
      };
    }

    // Generate & store OTP
    const otpResult = await otpService.createOtp(email, OTP_PURPOSES.EMAIL_VERIFICATION);
    if (!otpResult.success) {
      return otpResult;
    }

    try {
      // Dispatch OTP via decoupled EmailService
      await emailService.sendEmailVerificationOtp(email, otpResult.otp);
    } catch (emailErr) {
      logger.error(`Failed to dispatch OTP email to ${email}:`, emailErr.message);
      return {
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: 'Could not send verification email. Please check your Gmail address or try again in a few moments.'
      };
    }

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
      devOtp: env.NODE_ENV !== 'production' ? otpResult.otp : undefined,
      provider: env.EMAIL_PROVIDER
    };
  }

  /**
   * Step 1B: Verify Email OTP & Initialize Temporary Signup Session
   */
  async verifyEmailOtp(rawEmail, otp) {
    const email = normalizeEmail(rawEmail);

    // Verify OTP code
    const verifyResult = await otpService.verifyOtp(email, otp, OTP_PURPOSES.EMAIL_VERIFICATION);
    if (!verifyResult.success) {
      return verifyResult;
    }

    // Create high-entropy temporary signup session token
    const signupToken = generateRandomToken(32);

    // Clean up any stale signup sessions for this email
    await SignupSession.deleteMany({ email });

    await SignupSession.create({
      signupToken,
      email,
      emailVerified: true,
      step: 1
    });

    logger.info(`Temporary signup session initialized for: ${email}`);

    return {
      success: true,
      signupToken,
      message: 'Email successfully verified.'
    };
  }

  /**
   * Step 2: Validate and Store Student Details in Signup Session
   */
  async saveStudentDetails(signupToken, { fullName, phone, registrationNumber }) {
    const session = await SignupSession.findOne({ signupToken });
    if (!session || !session.emailVerified) {
      return {
        success: false,
        error: 'INVALID_SESSION',
        message: 'Signup session expired or invalid. Please start over from email verification.'
      };
    }

    const normPhone = normalizeIndianPhone(phone);
    if (!normPhone.isValid) {
      return {
        success: false,
        error: 'INVALID_PHONE',
        message: normPhone.error
      };
    }

    const normRegNo = normalizeRegistrationNumber(registrationNumber);
    const normName = normalizeName(fullName);

    // Uniqueness pre-checks
    const [phoneExists, regExists] = await Promise.all([
      User.findOne({ phone: normPhone.normalized }),
      User.findOne({ registrationNumber: normRegNo })
    ]);

    if (phoneExists) {
      return {
        success: false,
        error: 'PHONE_ALREADY_EXISTS',
        message: 'This mobile number is already registered with an existing account.'
      };
    }

    if (regExists) {
      return {
        success: false,
        error: 'REGISTRATION_ALREADY_EXISTS',
        message: 'This registration number is already registered with an existing account.'
      };
    }

    // Update signup session
    session.fullName = normName;
    session.phone = normPhone.normalized;
    session.registrationNumber = normRegNo;
    session.studentDetailsVerified = true;
    session.step = 2;
    await session.save();

    logger.info(`Student details saved for session: ${session.email} (${normRegNo})`);

    return {
      success: true,
      message: 'Student details saved successfully.'
    };
  }

  /**
   * Step 4: Set Password & Finalize Permanent Account Creation
   */
  async completeSignup(signupToken, password, meta = {}) {
    const session = await SignupSession.findOne({ signupToken });

    if (!session) {
      return {
        success: false,
        error: 'INVALID_SESSION',
        message: 'Signup session not found or expired. Please start registration again.'
      };
    }

    // Verify all prerequisites
    if (!session.emailVerified) {
      return { success: false, error: 'EMAIL_NOT_VERIFIED', message: 'Email address has not been verified.' };
    }
    if (!session.studentDetailsVerified) {
      return { success: false, error: 'DETAILS_MISSING', message: 'Student details have not been submitted.' };
    }
    // Check if email, phone, or regNo were registered previously
    const existing = await User.findOne({
      $or: [
        { email: session.email },
        { phone: session.phone },
        { registrationNumber: session.registrationNumber }
      ]
    });

    if (existing) {
      if (existing.email === session.email) {
        return { success: false, error: 'EMAIL_ALREADY_EXISTS', message: 'An account with this Gmail address is already registered. Please sign in.' };
      }
      if (existing.phone === session.phone) {
        return { success: false, error: 'PHONE_ALREADY_EXISTS', message: 'An account with this mobile number is already registered.' };
      }
      if (existing.registrationNumber === session.registrationNumber) {
        return { success: false, error: 'REGISTRATION_ALREADY_EXISTS', message: 'An account with this registration / roll number is already registered.' };
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create permanent user in DB
    // MongoDB unique indexes on (email, phone, registrationNumber) strictly guarantee uniqueness
    let newUser;
    try {
      newUser = await User.create({
        email: session.email,
        phone: session.phone,
        registrationNumber: session.registrationNumber,
        fullName: session.fullName,
        passwordHash,
        collegeDetails: session.collegeDetails || {
          course: 'B.Tech',
          department: 'Computer Science and Engineering',
          year: 2,
          status: 'active'
        },
        isVerified: true,
        lastLoginAt: new Date()
      });
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        const field = Object.keys(dbErr.keyPattern || {})[0] || 'details';
        const fieldLabel = field === 'registrationNumber' ? 'registration number' : field;
        return {
          success: false,
          error: 'DUPLICATE_CREDENTIALS',
          message: `An account with this ${fieldLabel} already exists. Please sign in.`
        };
      }
      throw dbErr;
    }

    logger.success(`Permanent Student Account created in MongoDB: ${newUser.email} (${newUser.registrationNumber})`);

    // Clean up temporary session
    await SignupSession.deleteOne({ _id: session._id });

    // Create 30-day persistent session
    const accessToken = tokenService.generateAccessToken(newUser);
    const { refreshToken, expiresAt: refreshExpiresAt } = await tokenService.createSession({
      userId: newUser._id,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress
    });

    return {
      success: true,
      user: {
        id: newUser._id,
        email: newUser.email,
        phone: newUser.phone,
        registrationNumber: newUser.registrationNumber,
        fullName: newUser.fullName,
        role: newUser.role,
        collegeDetails: newUser.collegeDetails
      },
      accessToken,
      refreshToken,
      refreshExpiresAt,
      message: 'Account created successfully!'
    };
  }

  /**
   * Sign In with Gmail and Password
   */
  async signIn(rawEmail, password, meta = {}) {
    const email = normalizeEmail(rawEmail);

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return {
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid Gmail address or password.'
      };
    }

    if (user.status !== 'active') {
      return {
        success: false,
        error: 'ACCOUNT_SUSPENDED',
        message: 'This account has been deactivated. Please contact the campus administrator.'
      };
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return {
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid Gmail address or password.'
      };
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Create access token + 30-day refresh session
    const accessToken = tokenService.generateAccessToken(user);
    const { refreshToken, expiresAt: refreshExpiresAt } = await tokenService.createSession({
      userId: user._id,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress
    });

    logger.info(`User signed in successfully: ${email}`);

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        registrationNumber: user.registrationNumber,
        fullName: user.fullName,
        role: user.role,
        collegeDetails: user.collegeDetails
      },
      accessToken,
      refreshToken,
      refreshExpiresAt
    };
  }

  /**
   * Refresh access token using persistent refresh session
   */
  async refreshAccessToken(rawRefreshToken) {
    const validation = await tokenService.validateRefreshToken(rawRefreshToken);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        message: 'Session has expired or is invalid. Please sign in again.'
      };
    }

    const newAccessToken = tokenService.generateAccessToken(validation.user);

    return {
      success: true,
      accessToken: newAccessToken,
      user: {
        id: validation.user._id,
        email: validation.user.email,
        phone: validation.user.phone,
        registrationNumber: validation.user.registrationNumber,
        fullName: validation.user.fullName,
        role: validation.user.role,
        collegeDetails: validation.user.collegeDetails
      }
    };
  }

  /**
   * Log out and revoke active refresh session
   */
  async signOut(rawRefreshToken) {
    if (rawRefreshToken) {
      await tokenService.revokeSession(rawRefreshToken);
    }
    return { success: true, message: 'Logged out successfully.' };
  }

  /**
   * Forgot Password - Step 1: Request OTP
   * Checks database first and only sends OTP if account exists.
   */
  async requestPasswordReset(rawEmail) {
    const email = normalizeEmail(rawEmail);
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Password reset requested for non-existent Gmail: ${email}`);
      return {
        success: false,
        error: 'ACCOUNT_NOT_FOUND',
        message: 'No account registered with this Gmail address. Please check your email or sign up.'
      };
    }

    if (user.status !== 'active') {
      return {
        success: false,
        error: 'ACCOUNT_INACTIVE',
        message: 'This account is currently suspended or inactive. Please contact support.'
      };
    }

    const otpResult = await otpService.createOtp(email, OTP_PURPOSES.PASSWORD_RESET);
    if (!otpResult.success) {
      return otpResult;
    }

    await emailService.sendPasswordResetOtp(email, otpResult.otp);

    return {
      success: true,
      message: `A password reset verification code has been sent to ${email}.`,
      devOtp: env.NODE_ENV !== 'production' ? otpResult.otp : undefined
    };
  }

  /**
   * Forgot Password - Step 2: Verify OTP and Issue Short-Lived Reset Authorization Token
   */
  async verifyPasswordResetOtp(rawEmail, otp) {
    const email = normalizeEmail(rawEmail);

    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Invalid request.'
      };
    }

    const verifyResult = await otpService.verifyOtp(email, otp, OTP_PURPOSES.PASSWORD_RESET);
    if (!verifyResult.success) {
      return verifyResult;
    }

    // Generate single-use reset authorization token
    const resetToken = await tokenService.createPasswordResetToken(user._id, email);

    logger.info(`Password reset authorization issued for user: ${email}`);

    return {
      success: true,
      resetToken,
      message: 'OTP verified. You may now set a new password.'
    };
  }

  /**
   * Forgot Password - Step 3: Set New Password & Invalidate All Existing Sessions
   */
  async resetPassword(resetToken, newPassword) {
    const consumption = await tokenService.consumePasswordResetToken(resetToken);
    if (!consumption.valid) {
      return {
        success: false,
        error: 'INVALID_RESET_TOKEN',
        message: consumption.error
      };
    }

    const user = await User.findById(consumption.userId);
    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User account not found.'
      };
    }

    // Update password
    user.passwordHash = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    // Revoke all active sessions to force re-login across all devices
    await tokenService.revokeAllUserSessions(user._id);

    logger.success(`Password reset successfully for user: ${user.email}. All existing sessions revoked.`);

    return {
      success: true,
      message: 'Password has been reset successfully. Please sign in with your new password.'
    };
  }

  /**
   * Change Password while logged in
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User account not found.'
      };
    }

    const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return {
        success: false,
        error: 'INVALID_CURRENT_PASSWORD',
        message: 'Current password is incorrect.'
      };
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    // Revoke all active sessions
    await tokenService.revokeAllUserSessions(user._id);

    logger.success(`Password changed successfully for user ${user.email}. All sessions revoked.`);

    return {
      success: true,
      message: 'Password changed successfully. Please sign in again with your new password.'
    };
  }

  /**
   * List active sessions for user
   */
  async getUserSessions(userId) {
    return await tokenService.listUserSessions(userId);
  }

  /**
   * Revoke a specific session
   */
  async revokeUserSession(userId, sessionId) {
    await tokenService.revokeSessionById(userId, sessionId);
    return { success: true, message: 'Session revoked successfully.' };
  }
}

module.exports = new AuthService();
