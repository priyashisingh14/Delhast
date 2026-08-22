const jwt = require('jsonwebtoken');
const Session = require('../models/session.model');
const PasswordResetToken = require('../models/passwordResetToken.model');
const { generateRandomToken, hashToken } = require('../utils/crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

class TokenService {
  /**
   * Generates a short-lived access token (JWT)
   * @param {Object} user 
   * @returns {string} Access JWT
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || 'student',
        fullName: user.fullName
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRY }
    );
  }

  /**
   * Creates a new persistent 30-day session and returns the raw refresh token
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} [params.userAgent]
   * @param {string} [params.ipAddress]
   * @returns {Promise<{ refreshToken: string, expiresAt: Date }>}
   */
  async createSession({ userId, userAgent = 'Unknown', ipAddress = 'Unknown' }) {
    const rawRefreshToken = generateRandomToken(40);
    const tokenHash = hashToken(rawRefreshToken);

    // 30 days expiry
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Session.create({
      userId,
      tokenHash,
      userAgent,
      ipAddress,
      expiresAt,
      isRevoked: false
    });

    logger.debug(`Created 30-day session for user ${userId}`);

    return {
      refreshToken: rawRefreshToken,
      expiresAt
    };
  }

  /**
   * Validates a raw refresh token and returns the corresponding session & user
   * @param {string} rawRefreshToken 
   * @returns {Promise<{ valid: boolean, session?: Object, error?: string }>}
   */
  async validateRefreshToken(rawRefreshToken) {
    if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
      return { valid: false, error: 'NO_TOKEN' };
    }

    const tokenHash = hashToken(rawRefreshToken);
    const session = await Session.findOne({ tokenHash, isRevoked: false }).populate('userId');

    if (!session) {
      return { valid: false, error: 'INVALID_OR_REVOKED_SESSION' };
    }

    if (new Date() > new Date(session.expiresAt)) {
      await Session.deleteOne({ _id: session._id });
      return { valid: false, error: 'SESSION_EXPIRED' };
    }

    if (!session.userId || session.userId.status !== 'active') {
      return { valid: false, error: 'USER_INACTIVE_OR_DELETED' };
    }

    // Update lastUsedAt
    session.lastUsedAt = new Date();
    await session.save();

    return {
      valid: true,
      session,
      user: session.userId
    };
  }

  /**
   * Revokes a specific session (used during logout)
   * @param {string} rawRefreshToken 
   */
  async revokeSession(rawRefreshToken) {
    if (!rawRefreshToken) return;
    const tokenHash = hashToken(rawRefreshToken);
    await Session.findOneAndUpdate(
      { tokenHash },
      { isRevoked: true, revokedAt: new Date() }
    );
    logger.info('Session revoked successfully on logout');
  }

  /**
   * Revokes all active sessions for a user (used during password reset / password change)
   * @param {string} userId 
   */
  async revokeAllUserSessions(userId) {
    await Session.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
    logger.info(`All active sessions revoked for user: ${userId}`);
  }

  /**
   * List all active sessions for a user
   * @param {string} userId 
   * @returns {Promise<Array>}
   */
  async listUserSessions(userId) {
    const sessions = await Session.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    }).sort({ lastUsedAt: -1 });

    return sessions.map(s => ({
      id: s._id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      expiresAt: s.expiresAt
    }));
  }

  /**
   * Revoke a specific session by its Mongo ID
   * @param {string} userId 
   * @param {string} sessionId 
   */
  async revokeSessionById(userId, sessionId) {
    await Session.findOneAndUpdate(
      { _id: sessionId, userId },
      { isRevoked: true, revokedAt: new Date() }
    );
    logger.info(`Session ${sessionId} revoked by user ${userId}`);
  }

  /**
   * Create single-use password reset authorization token
   * @param {string} userId 
   * @param {string} email 
   * @returns {Promise<string>} Raw reset token
   */
  async createPasswordResetToken(userId, email) {
    const rawResetToken = generateRandomToken(32);
    const tokenHash = hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Invalidate any previous reset tokens for this user
    await PasswordResetToken.deleteMany({ userId });

    await PasswordResetToken.create({
      tokenHash,
      userId,
      email,
      isUsed: false,
      expiresAt
    });

    return rawResetToken;
  }

  /**
   * Verify and consume a password reset token
   * @param {string} rawResetToken 
   * @returns {Promise<{ valid: boolean, userId?: string, email?: string, error?: string }>}
   */
  async consumePasswordResetToken(rawResetToken) {
    if (!rawResetToken) {
      return { valid: false, error: 'Reset token is required' };
    }

    const tokenHash = hashToken(rawResetToken);
    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      isUsed: false
    });

    if (!resetRecord) {
      return { valid: false, error: 'Invalid or expired password reset token' };
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      await PasswordResetToken.deleteOne({ _id: resetRecord._id });
      return { valid: false, error: 'Password reset authorization has expired. Please request a new OTP.' };
    }

    // Mark as used immediately to enforce single-use authorization
    resetRecord.isUsed = true;
    await resetRecord.save();

    return {
      valid: true,
      userId: resetRecord.userId,
      email: resetRecord.email
    };
  }

  /**
   * Verify JWT access token
   * @param {string} token 
   * @returns {Object} Decoded payload
   */
  verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  }
}

module.exports = new TokenService();
