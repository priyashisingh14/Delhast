/**
 * Enum for OTP verification purposes.
 * Strictly prevents cross-purpose token or OTP reuse.
 */
const OTP_PURPOSES = Object.freeze({
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET'
});

module.exports = OTP_PURPOSES;
