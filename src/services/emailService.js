const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>}
 */
const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Task Manager" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Login OTP - Task Management System',
      html: `
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
      text: `Your OTP for Task Management System is: ${otp}. This OTP will expire in 10 minutes. Do not share this with anyone.`
    };

    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}:`, error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendOtpEmail
};
