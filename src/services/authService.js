const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');
const { generateToken, hashToken, sanitizeUser } = require('../utils/helpers');
const jwtConfig = require('../config/jwt');
const AppError = require('../utils/AppError');
const otpService = require('./otpService');
const emailService = require('./emailService');
const logService = require('./logService');

/**
 * Find or create user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User object
 */
const findOrCreateUser = async (email) => {
  const [user] = await User.findOrCreate({
    where: { email: email.toLowerCase() },
    defaults: { email: email.toLowerCase() }
  });
  
  return user;
};

/**
 * Request OTP for login
 * @param {string} email - User email
 * @param {Object} req - Express request object
 * @returns {Promise<Object>}
 */
const requestOtp = async (email, req) => {
  // Find or create user
  const user = await findOrCreateUser(email);
  
  // Generate and store OTP
  const otp = await otpService.createOtp(user.id);
  
  // Send OTP via email
  await emailService.sendOtpEmail(email, otp);
  
  // Log the event
  await logService.logAuthEvent(user.id, logService.ACTIONS.OTP_REQUEST, req);
  
  return {
    message: 'OTP sent successfully to your email',
    email: email
  };
};

/**
 * Verify OTP and generate tokens
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Tokens and user info
 */
const verifyOtpAndLogin = async (email, otp, req) => {
  // Find user
  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Verify OTP
  await otpService.verifyOtp(user.id, otp);
  
  // Mark user as verified if first login
  if (!user.is_verified) {
    await user.update({ is_verified: true });
  }
  
  // Generate tokens
  const tokens = await generateTokens(user.id);
  
  // Log the event
  await logService.logAuthEvent(user.id, logService.ACTIONS.LOGIN, req);
  
  return {
    user: sanitizeUser(user),
    ...tokens
  };
};

/**
 * Generate access and refresh tokens
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Access and refresh tokens
 */
const generateTokens = async (userId) => {
  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    { userId },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );
  
  // Generate refresh token (long-lived)
  const refreshToken = generateToken(64);
  const refreshTokenHash = hashToken(refreshToken);
  
  // Store refresh token
  await RefreshToken.create({
    user_id: userId,
    token_hash: refreshTokenHash,
    expires_at: new Date(Date.now() + jwtConfig.refreshToken.expiresInMs)
  });
  
  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: jwtConfig.accessToken.expiresIn
  };
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} New access token
 */
const refreshAccessToken = async (refreshToken, req) => {
  const tokenHash = hashToken(refreshToken);
  
  // Find refresh token
  const storedToken = await RefreshToken.findOne({
    where: { token_hash: tokenHash }
  });
  
  if (!storedToken) {
    throw new AppError('Invalid refresh token', 401);
  }
  
  if (!storedToken.isValid()) {
    throw new AppError('Refresh token expired or revoked', 401);
  }
  
  // Generate new access token
  const accessToken = jwt.sign(
    { userId: storedToken.user_id },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );
  
  // Log the event
  await logService.logAuthEvent(storedToken.user_id, logService.ACTIONS.TOKEN_REFRESH, req);
  
  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: jwtConfig.accessToken.expiresIn
  };
};

/**
 * Logout user by revoking refresh token
 * @param {string} refreshToken - Refresh token
 * @param {string} userId - User ID
 * @param {Object} req - Express request object
 */
const logout = async (refreshToken, userId, req) => {
  const tokenHash = hashToken(refreshToken);
  
  // Revoke refresh token
  await RefreshToken.update(
    { is_revoked: true },
    { where: { token_hash: tokenHash, user_id: userId } }
  );
  
  // Log the event
  await logService.logAuthEvent(userId, logService.ACTIONS.LOGOUT, req);
  
  return { message: 'Logged out successfully' };
};

/**
 * Revoke all refresh tokens for user (logout from all devices)
 * @param {string} userId - User ID
 */
const revokeAllTokens = async (userId) => {
  await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: userId, is_revoked: false } }
  );
};

module.exports = {
  findOrCreateUser,
  requestOtp,
  verifyOtpAndLogin,
  generateTokens,
  refreshAccessToken,
  logout,
  revokeAllTokens
};
