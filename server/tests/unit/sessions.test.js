const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { connectDB, disconnectDB } = require('../../src/config/db');
const tokenService = require('../../src/services/token.service');
const authService = require('../../src/services/auth/auth.service');
const User = require('../../src/models/user.model');
const { hashPassword } = require('../../src/utils/crypto');

describe('Session Management & Password Change Tests', () => {
  let testUser;

  before(async () => {
    await connectDB();
    await User.deleteMany({ email: 'session.test@gmail.com' });

    const passwordHash = await hashPassword('InitialPass123@#');
    testUser = await User.create({
      email: 'session.test@gmail.com',
      fullName: 'Session Tester',
      phone: '+919811122233',
      registrationNumber: '23CSE888',
      passwordHash,
      isVerified: true,
      status: 'active'
    });
  });

  after(async () => {
    await disconnectDB();
  });

  it('should create multiple 30-day sessions and list them', async () => {
    const s1 = await tokenService.createSession({
      userId: testUser._id,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Chrome/120.0)',
      ipAddress: '192.168.1.10'
    });

    const s2 = await tokenService.createSession({
      userId: testUser._id,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
      ipAddress: '192.168.1.20'
    });

    const list = await tokenService.listUserSessions(testUser._id);
    assert.strictEqual(list.length >= 2, true);
    assert.ok(list.some(s => s.ipAddress === '192.168.1.10'));
    assert.ok(list.some(s => s.ipAddress === '192.168.1.20'));

    // Revoke one session by ID
    const targetSession = list.find(s => s.ipAddress === '192.168.1.20');
    await tokenService.revokeSessionById(testUser._id, targetSession.id);

    const updatedList = await tokenService.listUserSessions(testUser._id);
    assert.strictEqual(updatedList.some(s => s.id.toString() === targetSession.id.toString()), false);
  });

  it('should change password and invalidate all active sessions', async () => {
    // Create an active session
    await tokenService.createSession({
      userId: testUser._id,
      userAgent: 'Laptop',
      ipAddress: '10.0.0.1'
    });

    const activeBefore = await tokenService.listUserSessions(testUser._id);
    assert.ok(activeBefore.length > 0);

    // Change password
    const result = await authService.changePassword(
      testUser._id,
      'InitialPass123@#',
      'NewSecurePass456$%'
    );
    assert.strictEqual(result.success, true);

    // Active sessions should be revoked
    const activeAfter = await tokenService.listUserSessions(testUser._id);
    assert.strictEqual(activeAfter.length, 0);

    // Old password fails, new password succeeds
    const loginOld = await authService.signIn('session.test@gmail.com', 'InitialPass123@#');
    assert.strictEqual(loginOld.success, false);

    const loginNew = await authService.signIn('session.test@gmail.com', 'NewSecurePass456$%');
    assert.strictEqual(loginNew.success, true);
  });
});
