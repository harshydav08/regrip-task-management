const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const logger = require('../config/logger');

// Create transporter
const createTransporter = () => {
  // Brevo SMTP configuration
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';
  
  // Brevo uses port 587 with TLS
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const secure = port === 465; // false for port 587 (TLS), true for port 465 (SSL)
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });
};

const sendWithSendGrid = async (mailOptions) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return false;
  }

  sgMail.setApiKey(apiKey);

  await sgMail.send({
    to: mailOptions.to,
    from: mailOptions.from,
    subject: mailOptions.subject,
    text: mailOptions.text,
    html: mailOptions.html
  });

  return true;
};

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>}
 */
const sendOtpEmail = async (email, otp) => {
  try {
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

    if (process.env.SENDGRID_API_KEY) {
      await sendWithSendGrid(mailOptions);
    } else {
      const transporter = createTransporter();
      await transporter.sendMail(mailOptions);
    }
    logger.info(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}:`, {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    throw error; // Throw original error for better debugging
  }
};

module.exports = {
  sendOtpEmail
};
