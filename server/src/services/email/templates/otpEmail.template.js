/**
 * Generates an elegant, modern HTML email for Delhast OTP verification.
 * @param {string} otp 
 * @param {number} expiryMinutes 
 * @returns {string} HTML string
 */
const getOtpEmailHtml = (otp, expiryMinutes = 5) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delhast - Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F1F5F9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0F19; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" style="max-width: 520px; background-color: #111827; border-radius: 16px; border: 1px solid #1E293B; overflow: hidden;" border="0" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Delhast</h1>
              <p style="margin: 6px 0 0 0; color: #E0E7FF; font-size: 13px; font-weight: 500;">Secure Identity & Verification</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #FFFFFF; font-size: 18px; font-weight: 700;">Verify Your Gmail Address</h2>
              <p style="margin: 0 0 24px 0; color: #94A3B8; font-size: 14px; line-height: 1.6;">
                Please use the single-use verification code below to verify your Gmail address and continue creating your Delhast account:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #818CF8; font-family: monospace; display: inline-block; padding-left: 10px;">
                  ${otp}
                </span>
              </div>
              
              <p style="margin: 0 0 16px 0; color: #94A3B8; font-size: 13px; line-height: 1.5; text-align: center;">
                ⏱️ This verification code will expire in <strong>${expiryMinutes} minutes</strong>.<br>
                For security reasons, never share this code with anyone.
              </p>
              
              <div style="height: 1px; background-color: #1E293B; margin: 24px 0 20px 0;"></div>
              
              <p style="margin: 0; color: #64748B; font-size: 12px; line-height: 1.5;">
                If you did not request this verification code, please ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; padding: 18px 30px; text-align: center; border-top: 1px solid #1E293B;">
              <p style="margin: 0; color: #64748B; font-size: 11px;">
                © ${new Date().getFullYear()} Delhast. All rights reserved.
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

module.exports = { getOtpEmailHtml };
