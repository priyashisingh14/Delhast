const authService = require('../services/auth/auth.service');
const env = require('../config/env');
const User = require('../models/user.model');

// Cookie options for secure 30-day refresh session
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/'
});

const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/'
});

/**
 * Direct All-in-One Registration for Delhast
 */
const directRegister = async (req, res, next) => {
  try {
    const { fullName, phone, registrationNumber, email, password } = req.body;
    const meta = {
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown'
    };

    const imageBuffer = req.file?.buffer || null;

    const result = await authService.directRegister({
      fullName,
      phone,
      registrationNumber,
      email,
      password,
      imageBuffer,
      meta
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    return res.status(201).json({
      success: true,
      message: result.message,
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save Student Details (Step 2 of Signup)
 */
const saveStudentDetails = async (req, res, next) => {
  try {
    const { signupToken, fullName, phone, registrationNumber } = req.validatedBody;
    const result = await authService.saveStudentDetails(signupToken, {
      fullName,
      phone,
      registrationNumber
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Complete Registration and Set Password (Step 4 of Signup)
 */
const completeSignup = async (req, res, next) => {
  try {
    const { signupToken, password } = req.validatedBody;
    const meta = {
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown'
    };

    const result = await authService.completeSignup(signupToken, password, meta);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    return res.status(201).json({
      success: true,
      message: result.message,
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign In with Gmail & Password
 */
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const meta = {
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown'
    };

    const result = await authService.signIn(email, password, meta);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token using HttpOnly Refresh Cookie
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'NO_REFRESH_TOKEN',
        message: 'No refresh token session provided.'
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    if (!result.success) {
      res.clearCookie('refreshToken', getClearCookieOptions());
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Sign Out / Logout
 */
const signOut = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      await authService.signOut(refreshToken);
    }

    // Clear authentication cookie
    res.clearCookie('refreshToken', getClearCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Authenticated User Profile
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User account not found or inactive.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        registrationNumber: user.registrationNumber,
        fullName: user.fullName,
        role: user.role,
        collegeDetails: user.collegeDetails,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password for logged in student
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Clear refresh cookie
    res.clearCookie('refreshToken', getClearCookieOptions());
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get active sessions for logged in student
 */
const getSessions = async (req, res, next) => {
  try {
    const sessions = await authService.getUserSessions(req.user.userId);
    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke a specific session
 */
const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const result = await authService.revokeUserSession(req.user.userId, sessionId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  directRegister,
  saveStudentDetails,
  completeSignup,
  signIn,
  refreshAccessToken,
  signOut,
  getMe,
  changePassword,
  getSessions,
  revokeSession
};
