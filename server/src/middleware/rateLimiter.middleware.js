const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const isTest = env.NODE_ENV === 'test';

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP. Please try again later.'
  }
});

// Stricter limiter for sending OTP
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'OTP_REQUEST_LIMIT',
    message: 'Too many OTP requests from this address. Please try again after 15 minutes.'
  }
});

// Limiter for OTP verification attempts
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'OTP_VERIFY_LIMIT',
    message: 'Too many verification attempts. Please wait before trying again.'
  }
});

// Limiter for Login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'LOGIN_ATTEMPTS_EXCEEDED',
    message: 'Too many login attempts. Please try again in 15 minutes.'
  }
});

// Limiter for ID card OCR uploads
const ocrUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'UPLOAD_LIMIT_EXCEEDED',
    message: 'Too many ID card uploads. Please wait before trying again.'
  }
});

module.exports = {
  generalLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  loginLimiter,
  ocrUploadLimiter
};
