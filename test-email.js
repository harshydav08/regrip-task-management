// Test Email Configuration
require('dotenv').config();

async function testEmail() {
  try {
    const nodemailer = require('nodemailer');
    
    console.log('🔍 Testing Email Configuration...\n');
  
  console.log('📧 SMTP Settings:');
  console.log('   Host:', process.env.SMTP_HOST);
  console.log('   Port:', process.env.SMTP_PORT);
  console.log('   Secure:', process.env.SMTP_SECURE);
  console.log('   User:', process.env.SMTP_USER);
  console.log('   Pass:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
  console.log('   Pass Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);
  console.log('   Has Spaces:', process.env.SMTP_PASS ? process.env.SMTP_PASS.includes(' ') : false);
  console.log('\n');

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/\s+/g, '')
    },
    debug: true,
    logger: true
  });

  try {
    // Verify connection
    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self
      subject: 'Test Email - Task Management System',
      html: `
        <h2>Test Email Successful! 🎉</h2>
        <p>Your SMTP configuration is working correctly.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
      text: 'Test email successful!'
    });

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('\n🎉 All tests passed! Email configuration is working.\n');
    
  } catch (error) {
    console.error('\n❌ Email test failed!');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    if (error.response) {
      console.error('   Response:', error.response);
    }
    console.error('\n📝 Troubleshooting tips:');
    console.error('   1. Verify Gmail App Password is correct (no spaces)');
    console.error('   2. Enable "Less secure app access" in Gmail');
    console.error('   3. Enable "2-Step Verification" and create App Password');
    console.error('   4. Check if Gmail is blocking the sign-in attempt');
    console.error('   5. Try using a different email service\n');
    process.exit(1);
  }
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

testEmail();
