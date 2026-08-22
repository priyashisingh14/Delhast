const EmailProviderInterface = require('./email.provider.interface');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const https = require('https');

class BrevoProvider extends EmailProviderInterface {
  constructor() {
    super();
    this.apiKey = (process.env.BREVO_API_KEY || '').trim();
  }

  async sendMail({ to, subject, html, text }) {
    if (!this.apiKey) {
      throw new Error('Brevo API key not configured. Please set BREVO_API_KEY in environment variables.');
    }

    const payload = JSON.stringify({
      sender: {
        name: env.EMAIL_FROM_NAME || 'Delhast Identity',
        email: env.EMAIL_FROM_ADDRESS || 'delhastt@gmail.com'
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text || html.replace(/<[^>]*>?/gm, '')
    });

    return new Promise((resolve, reject) => {
      const req = https.request('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              logger.success(`Email dispatched via Brevo HTTP API to: ${to} (MessageId: ${parsed.messageId})`);
              resolve({
                success: true,
                messageId: parsed.messageId,
                provider: this.getProviderName()
              });
            } else {
              logger.error('Brevo API error response:', parsed.message || data);
              reject(new Error(parsed.message || `Brevo error: HTTP ${res.statusCode}`));
            }
          } catch (err) {
            reject(new Error(`Brevo response parse error: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  getProviderName() {
    return 'BrevoProvider (HTTPS REST API)';
  }
}

module.exports = BrevoProvider;
