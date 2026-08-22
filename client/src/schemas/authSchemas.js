import { z } from 'zod';

const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i;
const indianPhoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
const regNoRegex = /^[0-9]{2}[A-Z]{2,4}[0-9]{3,4}$/i;

export const emailStepSchema = z.object({
  email: z
    .string()
    .min(1, 'Gmail address is required')
    .email('Please enter a valid email address')
    .refine((val) => gmailRegex.test(val.trim()), {
      message: 'Only legitimate Gmail addresses (@gmail.com / @googlemail.com) are accepted.'
    })
});

export const emailOtpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers')
});

export const studentDetailsSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Full name is too long')
    .regex(/^[a-zA-Z\s\.\-]+$/, 'Name should only contain letters and spaces'),
  phone: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .refine((val) => indianPhoneRegex.test(val.trim().replace(/[\s\-]/g, '')), {
      message: 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
    }),
  registrationNumber: z
    .string()
    .min(1, 'Registration number is required')
    .max(30, 'Registration number is too long')
});

export const passwordSetupSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const passwordStepSchema = passwordSetupSchema;

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Gmail address is required')
    .email('Please enter a valid email address')
    .refine((val) => gmailRegex.test(val.trim()), {
      message: 'Only Gmail addresses are accepted.'
    }),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'Gmail address is required')
    .email('Please enter a valid email')
    .refine((val) => gmailRegex.test(val.trim()), {
      message: 'Only Gmail addresses are accepted.'
    })
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });
