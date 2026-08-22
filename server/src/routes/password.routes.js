const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password.controller');
const validateRequest = require('../middleware/validate.middleware');
const { otpSendLimiter, otpVerifyLimiter } = require('../middleware/rateLimiter.middleware');
const {
  forgotPasswordSchema,
  verifyPasswordResetOtpSchema,
  resetPasswordSchema
} = require('../validators/auth.validator');

// Request Password Reset OTP
router.post(
  '/forgot',
  otpSendLimiter,
  validateRequest(forgotPasswordSchema),
  passwordController.forgotPassword
);

// Verify Password Reset OTP
router.post(
  '/verify-otp',
  otpVerifyLimiter,
  validateRequest(verifyPasswordResetOtpSchema),
  passwordController.verifyOtp
);

// Reset Password with authorization token
router.post(
  '/reset',
  validateRequest(resetPasswordSchema),
  passwordController.resetPassword
);

module.exports = router;
