const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const AppError = require('../utils/AppError');
const { User } = require('../models');

/**
 * Authentication middleware - verifies JWT access token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError('Access token is required', 401);
    }
    
    // Verify token
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    
    // Check if user exists
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      throw new AppError('User not found', 401);
    }
    
    // Attach user info to request
    req.userId = decoded.userId;
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token', 401));
    }
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    const user = await User.findByPk(decoded.userId);
    
    if (user) {
      req.userId = decoded.userId;
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Silently continue without auth
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
