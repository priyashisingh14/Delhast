const { z } = require('zod');
const { isValidGmail, normalizeIndianPhone, isValidRegistrationNumber } = require('../utils/normalizers');

const gmailValidation = z
  .string({ required_error: 'Gmail address is required' })
  .trim()
  .min(5, 'Email is too short')
  .max(100, 'Email is too long')
  .refine(val => isValidGmail(val), {
    message: 'Only legitimate Gmail addresses (@gmail.com / @googlemail.com) are accepted.'
  });

const indianPhoneValidation = z
  .string({ required_error: 'Indian mobile number is required' })
  .trim()
  .refine(val => normalizeIndianPhone(val).isValid, {
    message: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +919876543210).'
  });

const registrationNumberValidation = z
  .string({ required_error: 'Registration number is required' })
  .trim()
  .min(1, 'Registration number is required')
  .max(30, 'Registration number is too long');

const passwordValidation = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Schemas
const sendEmailOtpSchema = z.object({
  email: gmailValidation
});

const verifyEmailOtpSchema = z.object({
  email: gmailValidation,
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be exactly 6 digits')
});

const submitStudentDetailsSchema = z.object({
  signupToken: z.string().min(10, 'Signup session token is required'),
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(60, 'Name cannot exceed 60 characters')
    .regex(/^[a-zA-Z\s\.\-]+$/, 'Name should only contain alphabetic characters'),
  phone: indianPhoneValidation,
  registrationNumber: registrationNumberValidation
});

const completeSignupSchema = z.object({
  signupToken: z.string().min(10, 'Signup session token is required'),
  password: passwordValidation
});

const signInSchema = z.object({
  email: gmailValidation,
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: gmailValidation
});

const verifyPasswordResetOtpSchema = z.object({
  email: gmailValidation,
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be exactly 6 digits')
});

const resetPasswordSchema = z
  .object({
    resetToken: z.string().min(10, 'Reset authorization token is required'),
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, 'Please confirm your new password')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

module.exports = {
  sendEmailOtpSchema,
  verifyEmailOtpSchema,
  submitStudentDetailsSchema,
  completeSignupSchema,
  signInSchema,
  forgotPasswordSchema,
  verifyPasswordResetOtpSchema,
  resetPasswordSchema
};
