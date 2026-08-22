const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const path = require('path');
const app = require('../../src/app');
const { connectDB, disconnectDB } = require('../../src/config/db');
const { seedMasterStudents } = require('../../src/seeds/masterStudents.seed');
const emailService = require('../../src/services/email/email.service');
const OTP_PURPOSES = require('../../src/constants/otpPurposes');
const User = require('../../src/models/user.model');
const SignupSession = require('../../src/models/signupSession.model');
const Otp = require('../../src/models/otp.model');
const Session = require('../../src/models/session.model');
const PasswordResetToken = require('../../src/models/passwordResetToken.model');
const MockEmailProvider = require('../../src/services/email/mock.provider');

const sampleCardsDir = path.resolve(__dirname, '../../../sample-id-cards');

describe('E2E Authentication System Tests', { concurrency: false }, () => {
  let mockEmailProvider;

  before(async () => {
    await connectDB();
    await User.deleteMany({});
    await SignupSession.deleteMany({});
    await Otp.deleteMany({});
    await Session.deleteMany({});
    await PasswordResetToken.deleteMany({});
    await seedMasterStudents();
    mockEmailProvider = new MockEmailProvider();
    emailService.setProvider(mockEmailProvider);
  });

  after(async () => {
    await disconnectDB();
    process.exit(0);
  });

  describe('1. Complete Happy Path: Multi-Step Registration -> Login -> Refresh -> Logout', () => {
    const studentData = {
      email: 'priyashi.singh@gmail.com',
      fullName: 'Priyashi Singh',
      phone: '+919876543210',
      registrationNumber: '23CSE101',
      password: 'SecurePassword123@#'
    };

    let signupToken = '';
    let accessToken = '';
    let refreshCookie = '';

    it('Step 1: Request Email OTP for Gmail address', async () => {
      const res = await request(app)
        .post('/api/auth/email/send-otp')
        .send({ email: studentData.email });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);

      // Verify email was sent via mock email provider
      const sentOtp = mockEmailProvider.getLastOtp(studentData.email, OTP_PURPOSES.EMAIL_VERIFICATION);
      assert.ok(sentOtp, 'OTP should be dispatched by EmailService');
      assert.strictEqual(sentOtp.length, 6);
    });

    it('Step 1B: Verify Email OTP and obtain signup session token', async () => {
      const sentOtp = mockEmailProvider.getLastOtp(studentData.email, OTP_PURPOSES.EMAIL_VERIFICATION);
      
      const res = await request(app)
        .post('/api/auth/email/verify-otp')
        .send({ email: studentData.email, otp: sentOtp });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.signupToken);
      signupToken = res.body.signupToken;
    });

    it('Step 2: Submit and validate Student Details (Indian Phone & Reg No)', async () => {
      const res = await request(app)
        .post('/api/auth/signup/details')
        .send({
          signupToken,
          fullName: studentData.fullName,
          phone: studentData.phone,
          registrationNumber: studentData.registrationNumber
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Step 3: Upload College ID Card and verify OCR + Master DB', async () => {
      const idCardPath = path.join(sampleCardsDir, 'valid_id_priyashi.png');

      const res = await request(app)
        .post('/api/auth/identity/verify')
        .field('signupToken', signupToken)
        .attach('idCardImage', idCardPath);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.verified, true);
    });

    it('Step 4: Set Password and finalize permanent User account', async () => {
      const res = await request(app)
        .post('/api/auth/signup/complete')
        .send({
          signupToken,
          password: studentData.password
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.email, studentData.email);
      assert.ok(res.body.accessToken);

      accessToken = res.body.accessToken;
      const cookies = res.headers['set-cookie'];
      assert.ok(cookies && cookies.some(c => c.includes('refreshToken')));
      refreshCookie = cookies.find(c => c.includes('refreshToken'));
    });

    it('Step 5: Sign In with verified Gmail & Password', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: studentData.email,
          password: studentData.password
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.accessToken);
      const cookies = res.headers['set-cookie'];
      if (cookies && cookies.some(c => c.includes('refreshToken'))) {
        refreshCookie = cookies.find(c => c.includes('refreshToken'));
      }
    });

    it('Step 6: Authenticated Profile Fetch (/api/auth/me)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.fullName, studentData.fullName);
    });

    it('Step 7: Refresh Access Token using 30-Day HttpOnly Refresh Session', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.accessToken);
    });

    it('Step 8: Sign Out and verify session revocation', async () => {
      const res = await request(app)
        .post('/api/auth/signout')
        .set('Cookie', refreshCookie);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);

      // Attempting to refresh again with revoked token must fail
      const failedRefresh = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie);

      assert.strictEqual(failedRefresh.status, 401);
    });
  });

  describe('2. Failure Scenarios: Name & Registration Number Mismatches', () => {
    let rahulSignupToken = '';

    it('should initialize signup session for Rahul Kumar', async () => {
      await request(app)
        .post('/api/auth/email/send-otp')
        .send({ email: 'rahul.kumar@gmail.com' });

      const otp = mockEmailProvider.getLastOtp('rahul.kumar@gmail.com', OTP_PURPOSES.EMAIL_VERIFICATION);

      const res = await request(app)
        .post('/api/auth/email/verify-otp')
        .send({ email: 'rahul.kumar@gmail.com', otp });

      rahulSignupToken = res.body.signupToken;

      const detailsRes = await request(app)
        .post('/api/auth/signup/details')
        .send({
          signupToken: rahulSignupToken,
          fullName: 'Rahul Kumar',
          phone: '9811223344',
          registrationNumber: '23CSE102'
        });

      assert.strictEqual(detailsRes.status, 200);
    });

    it('Case 1: Name Mismatch (User: Rahul Kumar, Card: Rahul Sharma) -> MUST REJECT', async () => {
      const mismatchCardPath = path.join(sampleCardsDir, 'mismatch_name_id.png');

      const res = await request(app)
        .post('/api/auth/identity/verify')
        .field('signupToken', rahulSignupToken)
        .attach('idCardImage', mismatchCardPath);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.errorType, 'NAME_MISMATCH');
      assert.ok(res.body.message.includes('name'));
    });

    it('Case 2: Registration Mismatch (User: 23CSE102, Card: 23CSE999) -> MUST REJECT', async () => {
      const mismatchRegCardPath = path.join(sampleCardsDir, 'mismatch_reg_id.png');

      const res = await request(app)
        .post('/api/auth/identity/verify')
        .field('signupToken', rahulSignupToken)
        .attach('idCardImage', mismatchRegCardPath);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.errorType, 'REGISTRATION_MISMATCH');
    });
  });

  describe('3. Uniqueness Constraints (Duplicate Prevention)', () => {
    it('Case 3: Duplicate Gmail -> MUST REJECT', async () => {
      // priyashi.singh@gmail.com was already registered in the first suite
      const res = await request(app)
        .post('/api/auth/email/send-otp')
        .send({ email: 'priyashi.singh@gmail.com' });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.error, 'EMAIL_ALREADY_EXISTS');
    });

    it('Case 4: Duplicate Phone Number -> MUST REJECT', async () => {
      // Try to use priyashi's phone (+919876543210) for a new user
      await request(app)
        .post('/api/auth/email/send-otp')
        .send({ email: 'ananya.sharma@gmail.com' });

      const otp = mockEmailProvider.getLastOtp('ananya.sharma@gmail.com', OTP_PURPOSES.EMAIL_VERIFICATION);

      const verifyRes = await request(app)
        .post('/api/auth/email/verify-otp')
        .send({ email: 'ananya.sharma@gmail.com', otp });

      const res = await request(app)
        .post('/api/auth/signup/details')
        .send({
          signupToken: verifyRes.body.signupToken,
          fullName: 'Ananya Sharma',
          phone: '9876543210', // duplicate phone
          registrationNumber: '22ECE045'
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'PHONE_ALREADY_EXISTS');
    });

    it('Case 5: Duplicate Registration Number -> MUST REJECT', async () => {
      // Try to use 23CSE101 for a new user
      await request(app)
        .post('/api/auth/email/send-otp')
        .send({ email: 'rohan.verma@gmail.com' });

      const otp = mockEmailProvider.getLastOtp('rohan.verma@gmail.com', OTP_PURPOSES.EMAIL_VERIFICATION);

      const verifyRes = await request(app)
        .post('/api/auth/email/verify-otp')
        .send({ email: 'rohan.verma@gmail.com', otp });

      const res = await request(app)
        .post('/api/auth/signup/details')
        .send({
          signupToken: verifyRes.body.signupToken,
          fullName: 'Rohan Verma',
          phone: '9822334455',
          registrationNumber: '23CSE101' // duplicate reg
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'REGISTRATION_ALREADY_EXISTS');
    });
  });

  describe('4. Forgot Password Flow & Session Invalidation', () => {
    let resetToken = '';

    it('Step 1: Request Password Reset OTP (with enumeration protection)', async () => {
      const res = await request(app)
        .post('/api/auth/password/forgot')
        .send({ email: 'priyashi.singh@gmail.com' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);

      // Verify password reset OTP was dispatched
      const otp = mockEmailProvider.getLastOtp('priyashi.singh@gmail.com', OTP_PURPOSES.PASSWORD_RESET);
      assert.ok(otp, 'Password reset OTP should be dispatched');
      assert.strictEqual(otp.length, 6);
    });

    it('Step 2: Verify Password Reset OTP and get single-use Reset Token', async () => {
      const otp = mockEmailProvider.getLastOtp('priyashi.singh@gmail.com', OTP_PURPOSES.PASSWORD_RESET);

      const res = await request(app)
        .post('/api/auth/password/verify-otp')
        .send({ email: 'priyashi.singh@gmail.com', otp });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.resetToken);
      resetToken = res.body.resetToken;
    });

    it('Step 3: Reset Password with new credentials', async () => {
      const res = await request(app)
        .post('/api/auth/password/reset')
        .send({
          resetToken,
          newPassword: 'BrandNewPassword2026!#',
          confirmPassword: 'BrandNewPassword2026!#'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Step 4: Verify Old Password is rejected and New Password succeeds', async () => {
      // Old password must fail
      const failRes = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'priyashi.singh@gmail.com',
          password: 'SecurePassword123@#'
        });
      assert.strictEqual(failRes.status, 401);

      // New password must succeed
      const successRes = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'priyashi.singh@gmail.com',
          password: 'BrandNewPassword2026!#'
        });
      assert.strictEqual(successRes.status, 200);
      assert.strictEqual(successRes.body.success, true);
    });
  });
});
