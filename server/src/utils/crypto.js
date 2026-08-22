const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Generate cryptographically secure numeric OTP
 * @param {number} length 
 * @returns {string} 6-digit OTP
 */
const generateSecureOtp = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otpNumber = crypto.randomInt(min, max + 1);
  return otpNumber.toString();
};

/**
 * Hash an OTP using HMAC-SHA256 with server secret
 * @param {string} email 
 * @param {string} otp 
 * @returns {string} Hex hash
 */
const hashOtp = (email, otp) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  return crypto
    .createHmac('sha256', env.JWT_ACCESS_SECRET)
    .update(`${normalizedEmail}:${otp}`)
    .digest('hex');
};

/**
 * Verify an OTP against the stored hash using constant-time comparison
 * @param {string} email 
 * @param {string} otp 
 * @param {string} storedHash 
 * @returns {boolean}
 */
const verifyOtpHash = (email, otp, storedHash) => {
  if (!storedHash || !otp || !email) return false;
  const computedHash = hashOtp(email, otp);
  
  try {
    const hashBufferA = Buffer.from(computedHash, 'hex');
    const hashBufferB = Buffer.from(storedHash, 'hex');
    if (hashBufferA.length !== hashBufferB.length) return false;
    return crypto.timingSafeEqual(hashBufferA, hashBufferB);
  } catch {
    return false;
  }
};

/**
 * Hash password using bcrypt
 * @param {string} password 
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

/**
 * Compare password with bcrypt hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
};

/**
 * Generate random high-entropy token (for sessions, reset tokens, verification tokens)
 * @param {number} bytes 
 * @returns {string}
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a high entropy token for DB storage (e.g. Refresh Token hash)
 * @param {string} token 
 * @returns {string}
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateSecureOtp,
  hashOtp,
  verifyOtpHash,
  hashPassword,
  comparePassword,
  generateRandomToken,
  hashToken
};
