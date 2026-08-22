/**
 * Generates an elegant, academic-themed HTML email for password recovery.
 * @param {string} otp 
 * @param {number} expiryMinutes 
 * @returns {string} HTML string
 */
const getPasswordResetEmailHtml = (otp, expiryMinutes = 5) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Institute - Password Reset OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2e2638;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f9; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(110, 86, 142, 0.08); border: 1px solid #eee7f5; overflow: hidden;" border="0" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c5cb7 0%, #b8627d 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Apex Institute Portal</h1>
              <p style="margin: 6px 0 0 0; color: #fdf2f4; font-size: 14px;">Account Security & Password Recovery</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h2 style="margin: 0 0 14px 0; color: #3c2f4c; font-size: 18px; font-weight: 600;">Password Reset Request</h2>
              <p style="margin: 0 0 24px 0; color: #6b5e7a; font-size: 15px; line-height: 1.6;">
                We received a request to reset the password for your student portal account. Please use the one-time code below to authorize your password change:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #faf2f5; border: 1px dashed #d8a8b8; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #9b4363; font-family: monospace; display: inline-block; padding-left: 8px;">
                  ${otp}
                </span>
              </div>
              
              <p style="margin: 0 0 16px 0; color: #827294; font-size: 13px; line-height: 1.5; text-align: center;">
                ⏱️ This code will expire in <strong>${expiryMinutes} minutes</strong>.<br>
                For security reasons, never share this OTP with anyone.
              </p>
              
              <div style="height: 1px; background-color: #f0e9f7; margin: 28px 0 20px 0;"></div>
              
              <p style="margin: 0; color: #9c8dae; font-size: 12px; line-height: 1.5;">
                If you did not request this password reset, please contact the campus security immediately. Your current password remains safe and unchanged until authorized.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf8fc; padding: 18px 30px; text-align: center; border-top: 1px solid #f0e9f7;">
              <p style="margin: 0; color: #9f91b0; font-size: 12px;">
                © ${new Date().getFullYear()} Apex Institute of Technology. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports = { getPasswordResetEmailHtml };
