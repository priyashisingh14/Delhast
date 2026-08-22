const EmailProviderInterface = require('./email.provider.interface');
const logger = require('../../utils/logger');
const env = require('../../config/env');

/**
 * Mock Email Provider for automated tests and development.
 * Captures sent emails in memory without requiring real SMTP credentials.
 */
class MockEmailProvider extends EmailProviderInterface {
  constructor() {
    super();
    this.sentEmails = [];
    logger.info('MockEmailProvider initialized [DEVELOPMENT / TEST ONLY]');
  }

  async verifyConnection() {
    return true;
  }

  async sendMail({ to, subject, html, text, metadata = {} }) {
    const emailRecord = {
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      metadata,
      sentAt: new Date(),
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    this.sentEmails.push(emailRecord);

    logger.info(`[MOCK EMAIL DISPATCHED] To: ${to} | Subject: "${subject}" | Purpose: ${metadata.purpose || 'N/A'}`);
    
    // In local development, print a friendly notice so developer can see the OTP in dev console
    if (env.NODE_ENV !== 'production' && metadata.otp) {
      logger.debug(`[DEV NOTICE] Generated OTP for ${to}: ${metadata.otp}`);
    }

    return {
      success: true,
      messageId: emailRecord.messageId,
      provider: this.getProviderName()
    };
  }

  getProviderName() {
    return 'MockEmailProvider';
  }

  /**
   * Helper for automated tests to retrieve the latest email sent to a recipient
   */
  getLastEmail(to) {
    const matching = this.sentEmails.filter(e => e.to.toLowerCase() === to.toLowerCase());
    return matching[matching.length - 1] || null;
  }

  /**
   * Helper for automated tests to retrieve the latest OTP sent to a recipient
   */
  getLastOtp(to, purpose) {
    const matching = this.sentEmails.filter(e => 
      e.to.toLowerCase() === to.toLowerCase() && 
      (!purpose || e.metadata?.purpose === purpose)
    );
    const last = matching[matching.length - 1];
    return last?.metadata?.otp || null;
  }

  getSentEmails() {
    return [...this.sentEmails];
  }

  clearEmails() {
    this.sentEmails = [];
  }
}

module.exports = MockEmailProvider;
