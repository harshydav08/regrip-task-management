const logger = require('../config/logger');

/**
 * Send OTP email using Brevo REST API (HTTPS - works on Render)
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>}
 */
const sendOtpEmail = async (email, otp) => {
  try {
    const apiKey = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';
    const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@taskmanager.com';

    if (!apiKey) {
      throw new Error('SMTP_PASS (Brevo API key) is not configured');
    }

    const emailContent = {
      sender: {
        name: 'Task Manager',
        email: senderEmail
      },
      to: [
        {
          email: email,
          name: email.split('@')[0]
        }
      ],
      subject: 'Your Login OTP - Task Management System',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .otp-box { background: white; border: 2px dashed #4F46E5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
            .warning { color: #dc2626; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Task Management System</h1>
            </div>
            <div class="content">
              <h2>Your One-Time Password</h2>
              <p>Use the following OTP to complete your login:</p>
              <div class="otp-box">
                <span class="otp-code">${otp}</span>
              </div>
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              <p class="warning">⚠️ Do not share this OTP with anyone. Our team will never ask for your OTP.</p>
            </div>
            <div class="footer">
              <p>If you didn't request this OTP, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} Task Management System</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `Your OTP for Task Management System is: ${otp}. This OTP will expire in 10 minutes. Do not share this with anyone.`
    };

    // Use Brevo REST API instead of SMTP (HTTPS works on Render, SMTP ports are blocked)
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailContent)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Brevo API error (${response.status}): ${errorData}`);
    }

    const result = await response.json();
    logger.info(`OTP email sent to ${email} - Message ID: ${result.messageId}`, { 
      messageId: result.messageId,
      response: JSON.stringify(result)
    });
    return true;
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}:`, {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  sendOtpEmail
};
