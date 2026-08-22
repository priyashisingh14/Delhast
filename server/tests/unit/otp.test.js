const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { connectDB, disconnectDB } = require('../../src/config/db');
const otpService = require('../../src/services/otp/otp.service');
const OTP_PURPOSES = require('../../src/constants/otpPurposes');

describe('OTP Service Unit Tests', () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  it('should generate a 6-digit OTP and successfully verify it', async () => {
    const email = 'test.student@gmail.com';
    const purpose = OTP_PURPOSES.EMAIL_VERIFICATION;

    const otpRes = await otpService.createOtp(email, purpose);
    assert.strictEqual(otpRes.success, true);
    assert.strictEqual(typeof otpRes.otp, 'string');
    assert.strictEqual(otpRes.otp.length, 6);

    // Verify with correct OTP
    const verifyRes = await otpService.verifyOtp(email, otpRes.otp, purpose);
    assert.strictEqual(verifyRes.success, true);
  });

  it('should enforce cooldown if OTP requested again immediately', async () => {
    const email = 'cooldown.student@gmail.com';
    const purpose = OTP_PURPOSES.EMAIL_VERIFICATION;

    const first = await otpService.createOtp(email, purpose);
    assert.strictEqual(first.success, true);

    const second = await otpService.createOtp(email, purpose);
    assert.strictEqual(second.success, false);
    assert.strictEqual(second.error, 'RESEND_COOLDOWN');
    assert.ok(second.cooldownRemaining > 0);
  });

  it('should reject wrong OTP and decrement remaining attempts', async () => {
    const email = 'wrong.student@gmail.com';
    const purpose = OTP_PURPOSES.EMAIL_VERIFICATION;

    await otpService.createOtp(email, purpose);

    const verifyRes = await otpService.verifyOtp(email, '000000', purpose);
    assert.strictEqual(verifyRes.success, false);
    assert.strictEqual(verifyRes.error, 'INVALID_OTP');
    assert.strictEqual(verifyRes.remainingAttempts, 4);
  });

  it('should prevent cross-purpose OTP verification', async () => {
    const email = 'crosspurpose@gmail.com';
    
    // Create EMAIL_VERIFICATION OTP
    const res = await otpService.createOtp(email, OTP_PURPOSES.EMAIL_VERIFICATION);
    assert.strictEqual(res.success, true);

    // Attempt to verify as PASSWORD_RESET
    const crossVerify = await otpService.verifyOtp(email, res.otp, OTP_PURPOSES.PASSWORD_RESET);
    assert.strictEqual(crossVerify.success, false);
    assert.strictEqual(crossVerify.error, 'OTP_NOT_FOUND');
  });
});
