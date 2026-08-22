const Otp = require('../../models/otp.model');
const { generateSecureOtp, hashOtp, verifyOtpHash } = require('../../utils/crypto');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const OTP_PURPOSES = require('../../constants/otpPurposes');
const { normalizeEmail } = require('../../utils/normalizers');

class OtpService {
  /**
   * Generates and stores a hashed OTP for an email and purpose.
   * Enforces cooldown between sends.
   * @param {string} rawEmail 
   * @param {string} purpose 
   * @returns {Promise<{ success: boolean, otp?: string, cooldownRemaining?: number, error?: string }>}
   */
  async createOtp(rawEmail, purpose) {
    const email = normalizeEmail(rawEmail);

    if (!Object.values(OTP_PURPOSES).includes(purpose)) {
      throw new Error(`Invalid OTP purpose: ${purpose}`);
    }

    // Check existing active OTP for cooldown
    const existingOtp = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });

    if (existingOtp) {
      const timeSinceLastSent = (Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000;
      const cooldownSeconds = env.OTP_RESEND_COOLDOWN_SECONDS;

      if (timeSinceLastSent < cooldownSeconds) {
        const remaining = Math.ceil(cooldownSeconds - timeSinceLastSent);
        logger.warn(`OTP resend cooldown active for ${email}. Remaining: ${remaining}s`);
        return {
          success: false,
          error: 'RESEND_COOLDOWN',
          cooldownRemaining: remaining,
          message: `Please wait ${remaining} seconds before requesting a new OTP.`
        };
      }
    }

    // Generate cryptographic OTP
    const plainOtp = generateSecureOtp(env.OTP_LENGTH);
    const otpHash = hashOtp(email, plainOtp);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert or replace OTP record
    await Otp.findOneAndUpdate(
      { email, purpose },
      {
        otpHash,
        purpose,
        attemptCount: 0,
        maxAttempts: env.OTP_MAX_ATTEMPTS,
        lastSentAt: new Date(),
        expiresAt,
        verifiedAt: null
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info(`Generated and stored hashed OTP for ${email} (Purpose: ${purpose}, Expires: ${env.OTP_EXPIRY_MINUTES}m)`);

    return {
      success: true,
      otp: plainOtp, // To be passed to EmailService; NEVER exposed to client API
      expiresAt
    };
  }

  /**
   * Verifies an OTP submitted by the user
   * @param {string} rawEmail 
   * @param {string} plainOtp 
   * @param {string} purpose 
   * @returns {Promise<{ success: boolean, error?: string, message?: string, remainingAttempts?: number }>}
   */
  async verifyOtp(rawEmail, plainOtp, purpose) {
    const email = normalizeEmail(rawEmail);

    if (!plainOtp || typeof plainOtp !== 'string') {
      return {
        success: false,
        error: 'INVALID_INPUT',
        message: 'OTP code is required.'
      };
    }

    const otpRecord = await Otp.findOne({ email, purpose });

    if (!otpRecord) {
      return {
        success: false,
        error: 'OTP_NOT_FOUND',
        message: 'No active OTP found. Please request a new code.'
      };
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return {
        success: false,
        error: 'OTP_EXPIRED',
        message: 'The OTP code has expired. Please request a new one.'
      };
    }

    // Check max attempts
    if (otpRecord.attemptCount >= otpRecord.maxAttempts) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return {
        success: false,
        error: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Too many incorrect attempts. This OTP has been invalidated for security. Please request a new code.'
      };
    }

    // Verify hash
    const isValid = verifyOtpHash(email, plainOtp.trim(), otpRecord.otpHash);

    if (!isValid) {
      otpRecord.attemptCount += 1;
      await otpRecord.save();

      const remaining = otpRecord.maxAttempts - otpRecord.attemptCount;

      if (remaining <= 0) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return {
          success: false,
          error: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Maximum attempts exceeded. Please request a new OTP.'
        };
      }

      return {
        success: false,
        error: 'INVALID_OTP',
        remainingAttempts: remaining,
        message: `Invalid OTP code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
      };
    }

    // Valid OTP: delete or mark verified
    await Otp.deleteOne({ _id: otpRecord._id });
    logger.success(`OTP verified successfully for ${email} (${purpose})`);

    return {
      success: true,
      message: 'OTP verified successfully.'
    };
  }
}

// Singleton export
const otpService = new OtpService();

module.exports = otpService;
