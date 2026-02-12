const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for OTP requests
 * Strict: 5 requests per 15 minutes per IP
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP + email combination for more precise limiting
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  }
});

/**
 * Rate limiter for authentication attempts
 * Prevents brute force: 10 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * General API rate limiter
 * 100 requests per minute
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict rate limiter for sensitive operations
 * 20 requests per minute
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: 'Rate limit exceeded for this operation.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  otpLimiter,
  authLimiter,
  apiLimiter,
  strictLimiter
};
