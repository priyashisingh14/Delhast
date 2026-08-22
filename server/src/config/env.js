const { z } = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from root or server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(val => parseInt(val, 10)),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().optional().default(''),
  
  // JWT
  JWT_ACCESS_SECRET: z.string().default('super_secret_access_jwt_key_college_portal_2026_change_in_prod'),
  JWT_REFRESH_SECRET: z.string().default('super_secret_refresh_jwt_key_college_portal_2026_change_in_prod'),
  JWT_RESET_SECRET: z.string().default('super_secret_reset_jwt_key_college_portal_2026_change_in_prod'),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('30d'),
  RESET_TOKEN_EXPIRY: z.string().default('15m'),

  // Email
  EMAIL_PROVIDER: z.enum(['gmail', 'mock']).default('mock'),
  EMAIL_FROM_NAME: z.string().default('Apex Institute Student Portal'),
  EMAIL_FROM_ADDRESS: z.string().default('college.portal.auth@gmail.com'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587').transform(val => parseInt(val, 10)),
  SMTP_SECURE: z.string().default('false').transform(val => val === 'true'),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),

  // OTP Settings
  OTP_LENGTH: z.string().default('6').transform(val => parseInt(val, 10)),
  OTP_EXPIRY_MINUTES: z.string().default('5').transform(val => parseInt(val, 10)),
  OTP_MAX_ATTEMPTS: z.string().default('5').transform(val => parseInt(val, 10)),
  OTP_RESEND_COOLDOWN_SECONDS: z.string().default('60').transform(val => parseInt(val, 10)),

  // Student Validation
  REGISTRATION_NUMBER_REGEX: z.string().default('^[0-9]{2}[A-Z]{3}[0-9]{3,4}$'),
  ENFORCE_MASTER_STUDENT_DB: z.string().default('true').transform(val => val === 'true'),

  // OCR & Upload
  OCR_ENGINE: z.enum(['tesseract', 'mock']).default('tesseract'),
  MAX_UPLOAD_SIZE_MB: z.string().default('5').transform(val => parseInt(val, 10)),
  TEMP_UPLOAD_DIR: z.string().default('./uploads/temp')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

module.exports = parsedEnv.data;
