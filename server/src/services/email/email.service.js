const env = require('../../config/env');
const logger = require('../../utils/logger');
const GmailProvider = require('./gmail.provider');
const ResendProvider = require('./resend.provider');
const BrevoProvider = require('./brevo.provider');
const MockEmailProvider = require('./mock.provider');
const { getOtpEmailHtml } = require('./templates/otpEmail.template');
const { getPasswordResetEmailHtml } = require('./templates/passwordResetEmail.template');
const OTP_PURPOSES = require('../../constants/otpPurposes');

class EmailService {
  constructor() {
    this.provider = null;
    this.mockProviderInstance = null;
    this.initProvider();
  }

  initProvider() {
    if (process.env.RESEND_API_KEY) {
      this.provider = new ResendProvider();
    } else if (process.env.BREVO_API_KEY) {
      this.provider = new BrevoProvider();
    } else if (env.EMAIL_PROVIDER === 'gmail') {
      this.provider = new GmailProvider();
    } else {
      this.mockProviderInstance = new MockEmailProvider();
      this.provider = this.mockProviderInstance;
    }
    logger.info(`EmailService initialized with active provider: ${this.provider.getProviderName()}`);
  }

  /**
   * Set provider dynamically (e.g. for testing)
   * @param {import('./email.provider.interface')} provider 
   */
  setProvider(provider) {
    this.provider = provider;
    logger.info(`EmailService active provider changed to: ${provider.getProviderName()}`);
  }

  getProvider() {
    return this.provider;
  }

  getMockProvider() {
    if (this.provider instanceof MockEmailProvider) {
      return this.provider;
    }
    if (this.mockProviderInstance) {
      return this.mockProviderInstance;
    }
    this.mockProviderInstance = new MockEmailProvider();
    return this.mockProviderInstance;
  }

  /**
   * Send Email Verification OTP
   * @param {string} email 
   * @param {string} otp 
   * @returns {Promise<{ success: boolean, messageId?: string }>}
   */
  async sendEmailVerificationOtp(email, otp) {
    const subject = `${otp} is your Delhast Verification Code`;
    const html = getOtpEmailHtml(otp, env.OTP_EXPIRY_MINUTES);
    const text = `Your Delhast verification code is: ${otp}\n\nThis code expires in ${env.OTP_EXPIRY_MINUTES} minutes. For security, never share this code.`;

    return await this.provider.sendMail({
      to: email,
      subject,
      html,
      text,
      metadata: {
        purpose: OTP_PURPOSES.EMAIL_VERIFICATION,
        otp
      }
    });
  }

  /**
   * Send Password Reset OTP
   * @param {string} email 
   * @param {string} otp 
   * @returns {Promise<{ success: boolean, messageId?: string }>}
   */
  async sendPasswordResetOtp(email, otp) {
    const subject = `${otp} is your Delhast Password Reset Code`;
    const html = getPasswordResetEmailHtml(otp, env.OTP_EXPIRY_MINUTES);
    const text = `Your Delhast password reset code is: ${otp}\n\nThis code expires in ${env.OTP_EXPIRY_MINUTES} minutes.`;

    return await this.provider.sendMail({
      to: email,
      subject,
      html,
      text,
      metadata: {
        purpose: OTP_PURPOSES.PASSWORD_RESET,
        otp
      }
    });
  }
}

// Singleton export
const emailService = new EmailService();

module.exports = emailService;
