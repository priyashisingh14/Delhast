const { z } = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from root or server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default('development').transform(val => val.toLowerCase()),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().optional().default('').transform(val => (val ? val.trim() : '')),
  
  // JWT
  JWT_ACCESS_SECRET: z.string().default('super_secret_access_jwt_key_college_portal_2026_change_in_prod'),
  JWT_REFRESH_SECRET: z.string().default('super_secret_refresh_jwt_key_college_portal_2026_change_in_prod'),
  JWT_RESET_SECRET: z.string().default('super_secret_reset_jwt_key_college_portal_2026_change_in_prod'),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('30d'),
  RESET_TOKEN_EXPIRY: z.string().default('15m'),

  // Email
  EMAIL_PROVIDER: z.string().default('mock').transform(val => val.toLowerCase()),
  EMAIL_FROM_NAME: z.string().default('Delhast Identity'),
  EMAIL_FROM_ADDRESS: z.string().default('delhastt@gmail.com'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),

  // OTP Settings
  OTP_LENGTH: z.coerce.number().default(6),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(5),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().default(60),

  // Student Validation
  REGISTRATION_NUMBER_REGEX: z.string().default('^[0-9]{2}[A-Z]{3}[0-9]{3,4}$'),
  ENFORCE_MASTER_STUDENT_DB: z.coerce.boolean().default(false),

  // OCR & Upload
  OCR_ENGINE: z.string().default('tesseract').transform(val => val.toLowerCase()),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(5),
  TEMP_UPLOAD_DIR: z.string().default('./uploads/temp')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

module.exports = parsedEnv.data;
