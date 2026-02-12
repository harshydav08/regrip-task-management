const bcrypt = require('bcrypt');
const { Otp } = require('../models');
const { generateOtp } = require('../utils/helpers');
const jwtConfig = require('../config/jwt');
const AppError = require('../utils/AppError');

/**
 * Create and store a new OTP for user
 * @param {string} userId - User ID
 * @returns {Promise<string>} Plain OTP to send via email
 */
const createOtp = async (userId) => {
  // Generate 6-digit OTP
  const otp = generateOtp();
  
  // Hash OTP before storing
  const otpHash = await bcrypt.hash(otp, 10);
  
  // Calculate expiry time
  const expiresAt = new Date(Date.now() + jwtConfig.otp.expiresInMs);
  
  // Invalidate all previous unused OTPs for this user
  await Otp.update(
    { is_used: true },
    { where: { user_id: userId, is_used: false } }
  );
  
  // Create new OTP record
  await Otp.create({
    user_id: userId,
    otp_hash: otpHash,
    expires_at: expiresAt
  });
  
  return otp;
};

/**
 * Verify OTP for user
 * @param {string} userId - User ID
 * @param {string} otp - OTP to verify
 * @returns {Promise<boolean>}
 */
const verifyOtp = async (userId, otp) => {
  // Find the latest unused OTP for user
  const otpRecord = await Otp.findOne({
    where: {
      user_id: userId,
      is_used: false
    },
    order: [['created_at', 'DESC']]
  });
  
  if (!otpRecord) {
    throw new AppError('No valid OTP found. Please request a new one.', 400);
  }
  
  // Check if expired
  if (otpRecord.isExpired()) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }
  
  // Verify OTP hash
  const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);
  
  if (!isValid) {
    throw new AppError('Invalid OTP. Please try again.', 400);
  }
  
  // Mark OTP as used
  await otpRecord.update({ is_used: true });
  
  return true;
};

/**
 * Clean up expired OTPs (can be run as a cron job)
 */
const cleanupExpiredOtps = async () => {
  const deleted = await Otp.destroy({
    where: {
      expires_at: {
        [require('sequelize').Op.lt]: new Date()
      }
    }
  });
  
  return deleted;
};

module.exports = {
  createOtp,
  verifyOtp,
  cleanupExpiredOtps
};
