/**
 * Simple, structured logger with color indicators and production safety.
 * CRITICAL RULE: Never log sensitive data such as plain passwords, actual OTPs, or API secrets.
 */
const env = require('../config/env');

const formatTime = () => new Date().toISOString().substring(11, 19);

const logger = {
  info: (msg, meta = '') => {
    console.log(`\x1b[36m[INFO ${formatTime()}]\x1b[0m ${msg}`, meta ? meta : '');
  },
  success: (msg, meta = '') => {
    console.log(`\x1b[32m[SUCCESS ${formatTime()}]\x1b[0m ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta = '') => {
    console.warn(`\x1b[33m[WARN ${formatTime()}]\x1b[0m ${msg}`, meta ? meta : '');
  },
  error: (msg, error = '') => {
    console.error(`\x1b[31m[ERROR ${formatTime()}]\x1b[0m ${msg}`, error ? error : '');
  },
  debug: (msg, meta = '') => {
    if (env.NODE_ENV !== 'production') {
      console.log(`\x1b[35m[DEBUG ${formatTime()}]\x1b[0m ${msg}`, meta ? meta : '');
    }
  }
};

module.exports = logger;
