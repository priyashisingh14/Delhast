const EmailProviderInterface = require('./email.provider.interface');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const https = require('https');

class ResendProvider extends EmailProviderInterface {
  constructor() {
    super();
    this.apiKey = (process.env.RESEND_API_KEY || '').trim();
  }

  async sendMail({ to, subject, html, text, metadata = {} }) {
    if (!this.apiKey) {
      throw new Error('Resend API key not configured. Please set RESEND_API_KEY in environment variables.');
    }

    const fromAddress = env.EMAIL_FROM_ADDRESS && !env.EMAIL_FROM_ADDRESS.endsWith('@gmail.com')
      ? `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`
      : 'Delhast Portal <onboarding@resend.dev>';

    const payload = JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, '')
    });

    return new Promise((resolve, reject) => {
      const req = https.request('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
              logger.success(`Email dispatched via Resend HTTP API to: ${to} (MessageId: ${parsed.id})`);
              resolve({
                success: true,
                messageId: parsed.id,
                provider: this.getProviderName()
              });
            } else {
              logger.error('Resend API response:', parsed.message || data);
              
              if (metadata.otp) {
                logger.info(`🔑 [OTP VERIFICATION CODE FOR ${to}]: ${metadata.otp}`);
              }

              // If Resend sandbox restricts to account owner, log OTP and allow user to enter the code
              if (parsed.message && parsed.message.includes('only send testing emails')) {
                logger.warn(`[RESEND SANDBOX] Resend test domain only delivers to account owner. Generated OTP for ${to} is: ${metadata.otp}`);
                resolve({
                  success: true,
                  messageId: `sandbox_log_${Date.now()}`,
                  provider: 'Resend Sandbox (Console Recovery)',
                  fallback: true
                });
                return;
              }

              reject(new Error(parsed.message || `Resend error: HTTP ${res.statusCode}`));
            }
          } catch (err) {
            reject(new Error(`Resend response parse error: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  getProviderName() {
    return 'ResendProvider (HTTPS REST API)';
  }
}

module.exports = ResendProvider;
