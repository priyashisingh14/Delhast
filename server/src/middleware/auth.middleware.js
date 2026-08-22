const tokenService = require('../services/token.service');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication token is missing. Please sign in.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Your access session has expired. Please refresh your token or sign in again.'
      });
    }

    logger.warn('Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid or malformed authentication token.'
    });
  }
};

module.exports = { authenticateToken };
