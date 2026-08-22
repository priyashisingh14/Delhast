const nodemailer = require('nodemailer');
const EmailProviderInterface = require('./email.provider.interface');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class GmailProvider extends EmailProviderInterface {
  constructor() {
    super();
    this.transporter = null;
    this.isInitialized = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    const user = (env.SMTP_USER || process.env.GMAIL_USER || '').trim();
    const pass = (env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

    if (!user || !pass) {
      logger.warn('Gmail SMTP credentials not provided. Gmail provider will run in dormant mode.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000
    });

    this.isInitialized = true;
    logger.info(`Gmail SMTP Provider initialized for sender: ${user}`);
  }

  async verifyConnection() {
    if (!this.transporter) {
      return false;
    }
    try {
      await this.transporter.verify();
      logger.success('Gmail SMTP connection verified successfully');
      return true;
    } catch (error) {
      logger.error('Gmail SMTP connection verification failed:', error.message);
      return false;
    }
  }

  async sendMail({ to, subject, html, text, metadata = {} }) {
    if (!this.transporter) {
      throw new Error('Gmail SMTP transporter is not configured. Please set SMTP_USER and SMTP_PASSWORD in .env or switch EMAIL_PROVIDER=mock.');
    }

    try {
      const fromAddress = `"${env.EMAIL_FROM_NAME}" <${env.SMTP_USER || env.EMAIL_FROM_ADDRESS}>`;

      const info = await this.transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, '')
      });

      logger.info(`Email dispatched via Gmail SMTP to: ${to} (MessageId: ${info.messageId})`);

      return {
        success: true,
        messageId: info.messageId,
        provider: this.getProviderName()
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to} via Gmail SMTP:`, error.message);
      
      // In development, do not completely crash/block the user if Google returns BadCredentials.
      // Log the warning and allow the flow to proceed with the dev OTP.
      if (env.NODE_ENV !== 'production') {
        logger.warn(`[DEV FALLBACK] Google SMTP authentication error. Generated OTP for ${to}: ${metadata.otp || 'N/A'}`);
        return {
          success: true,
          messageId: `dev_fallback_${Date.now()}`,
          provider: 'GmailProvider (Dev Fallback)',
          fallback: true
        };
      }

      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  getProviderName() {
    return 'GmailProvider';
  }
}

module.exports = GmailProvider;
