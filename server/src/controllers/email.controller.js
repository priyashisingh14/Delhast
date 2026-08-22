const authService = require('../services/auth/auth.service');

/**
 * Send OTP to Gmail
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.validatedBody;
    const result = await authService.sendEmailOtp(email);

    if (!result.success) {
      const statusCode = result.error === 'EMAIL_ALREADY_EXISTS' ? 409 : 400;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP from Gmail and initialize temporary signup session
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.validatedBody;
    const result = await authService.verifyEmailOtp(email, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtp,
  verifyOtp
};
