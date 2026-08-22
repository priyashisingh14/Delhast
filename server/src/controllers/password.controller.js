const authService = require('../services/auth/auth.service');

/**
 * Request Password Reset OTP
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.validatedBody;
    const result = await authService.requestPasswordReset(email);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Password Reset OTP
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.validatedBody;
    const result = await authService.verifyPasswordResetOtp(email, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password with Authorization Token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.validatedBody;
    const result = await authService.resetPassword(resetToken, newPassword);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  forgotPassword,
  verifyOtp,
  resetPassword
};
