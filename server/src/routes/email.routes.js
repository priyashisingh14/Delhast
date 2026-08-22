const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const validateRequest = require('../middleware/validate.middleware');
const { otpSendLimiter, otpVerifyLimiter } = require('../middleware/rateLimiter.middleware');
const { sendEmailOtpSchema, verifyEmailOtpSchema } = require('../validators/auth.validator');

// Send Email OTP
router.post(
  '/send-otp',
  otpSendLimiter,
  validateRequest(sendEmailOtpSchema),
  emailController.sendOtp
);

// Verify Email OTP
router.post(
  '/verify-otp',
  otpVerifyLimiter,
  validateRequest(verifyEmailOtpSchema),
  emailController.verifyOtp
);

module.exports = router;
