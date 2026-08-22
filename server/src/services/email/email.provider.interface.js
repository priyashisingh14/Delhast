/**
 * Abstract Email Provider Interface
 * All email providers (Gmail, Mock, SendGrid, Resend, College SMTP) must adhere to this interface.
 */
class EmailProviderInterface {
  /**
   * Send an email message
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} [options.text] - Fallback plain text content
   * @param {Object} [options.metadata] - Extra context (purpose, user ID, etc.)
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendMail(options) {
    throw new Error('Method sendMail() must be implemented by provider');
  }

  /**
   * Verify provider connection / credentials
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    throw new Error('Method verifyConnection() must be implemented by provider');
  }

  /**
   * Provider identifier name
   * @returns {string}
   */
  getProviderName() {
    throw new Error('Method getProviderName() must be implemented by provider');
  }
}

module.exports = EmailProviderInterface;
