const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  normalizeEmail,
  isValidGmail,
  normalizeIndianPhone,
  normalizeName,
  normalizeRegistrationNumber,
  isValidRegistrationNumber,
  matchNames,
  matchRegistrationNumbers
} = require('../../src/utils/normalizers');

describe('Normalizers & Validators Unit Tests', () => {
  describe('Gmail Normalization and Validation', () => {
    it('should accept and lowercase valid Gmail addresses', () => {
      assert.strictEqual(normalizeEmail('Student@Gmail.com'), 'student@gmail.com');
      assert.strictEqual(isValidGmail('Student@Gmail.com'), true);
      assert.strictEqual(isValidGmail('priyashi.singh@gmail.com'), true);
    });

    it('should canonicalize googlemail.com to gmail.com', () => {
      assert.strictEqual(normalizeEmail('user@googlemail.com'), 'user@gmail.com');
      assert.strictEqual(isValidGmail('user@googlemail.com'), true);
    });

    it('should reject non-Gmail addresses', () => {
      assert.strictEqual(isValidGmail('student@yahoo.com'), false);
      assert.strictEqual(isValidGmail('student@outlook.com'), false);
      assert.strictEqual(isValidGmail('student@college.edu'), false);
      assert.strictEqual(isValidGmail('invalid-email'), false);
    });
  });

  describe('Indian Phone Number Validation & Normalization', () => {
    it('should accept valid 10-digit Indian numbers starting with 6,7,8,9', () => {
      const res1 = normalizeIndianPhone('9876543210');
      assert.strictEqual(res1.isValid, true);
      assert.strictEqual(res1.normalized, '+919876543210');
      assert.strictEqual(res1.raw10, '9876543210');

      const res2 = normalizeIndianPhone('+919876543210');
      assert.strictEqual(res2.isValid, true);
      assert.strictEqual(res2.normalized, '+919876543210');

      const res3 = normalizeIndianPhone('+91 98765 43210');
      assert.strictEqual(res3.isValid, true);
      assert.strictEqual(res3.normalized, '+919876543210');

      const res4 = normalizeIndianPhone('09876543210');
      assert.strictEqual(res4.isValid, true);
      assert.strictEqual(res4.normalized, '+919876543210');
    });

    it('should reject invalid phone numbers', () => {
      assert.strictEqual(normalizeIndianPhone('1234567890').isValid, false); // starts with 1
      assert.strictEqual(normalizeIndianPhone('12345').isValid, false); // too short
      assert.strictEqual(normalizeIndianPhone('987654321').isValid, false); // 9 digits
      assert.strictEqual(normalizeIndianPhone('abcdefghij').isValid, false); // non-digits
      assert.strictEqual(normalizeIndianPhone('0000000000').isValid, false);
    });
  });

  describe('Name & Registration Number Matching', () => {
    it('should match names regardless of casing or multiple whitespace', () => {
      const match1 = matchNames('Priyashi Singh', 'PRIYASHI   SINGH');
      assert.strictEqual(match1.isMatch, true);

      const match2 = matchNames('Rahul Kumar', 'RAHUL KUMAR');
      assert.strictEqual(match2.isMatch, true);
    });

    it('should match reversed name tokens if valid', () => {
      const match = matchNames('Rahul Kumar', 'Kumar Rahul');
      assert.strictEqual(match.isMatch, true);
    });

    it('should strictly reject mismatched names', () => {
      const match = matchNames('Rahul Kumar', 'Rahul Sharma');
      assert.strictEqual(match.isMatch, false);
      assert.ok(match.reason.includes('mismatch'));
    });

    it('should match registration numbers ignoring case and hyphens', () => {
      const match = matchRegistrationNumbers('23cse101', '23CSE-101');
      assert.strictEqual(match.isMatch, true);
    });

    it('should strictly reject mismatched registration numbers', () => {
      const match = matchRegistrationNumbers('23CSE101', '23CSE102');
      assert.strictEqual(match.isMatch, false);
    });
  });
});
