const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Request OTP for login
 * @route   POST /api/auth/request-otp
 * @access  Public
 */
const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const result = await authService.requestOtp(email, req);
  
  res.status(200).json({
    success: true,
    message: result.message,
    data: { email: result.email }
  });
});

/**
 * @desc    Verify OTP and login
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  
  const result = await authService.verifyOtpAndLogin(email, otp, req);
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  const result = await authService.refreshAccessToken(refreshToken, req);
  
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  const result = await authService.logout(refreshToken, req.userId, req);
  
  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const { sanitizeUser } = require('../utils/helpers');
  
  res.status(200).json({
    success: true,
    data: { user: sanitizeUser(req.user) }
  });
});

module.exports = {
  requestOtp,
  verifyOtp,
  refreshToken,
  logout,
  getMe
};
