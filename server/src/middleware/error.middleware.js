const logger = require('../utils/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  // 1. MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    let userMessage = 'Duplicate record conflict.';

    if (field === 'email') {
      userMessage = 'This Gmail address is already registered. Please sign in or use another email.';
    } else if (field === 'phone') {
      userMessage = 'This phone number is already registered with another student account.';
    } else if (field === 'registrationNumber') {
      userMessage = 'This registration number is already registered with an existing account.';
    }

    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_FIELD',
      field,
      message: userMessage
    });
  }

  // 2. Multer File Upload Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'FILE_TOO_LARGE',
      message: `File size exceeds the maximum limit of ${env.MAX_UPLOAD_SIZE_MB}MB.`
    });
  }

  if (err.message && err.message.includes('Invalid file format')) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_FILE_TYPE',
      message: err.message
    });
  }

  // 3. General / Internal Server Error
  const statusCode = err.statusCode || 500;
  const responseMessage =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: err.errorType || 'SERVER_ERROR',
    message: responseMessage,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;
