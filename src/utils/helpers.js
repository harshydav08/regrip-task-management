const crypto = require('crypto');

/**
 * Generate a cryptographically secure 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash a token using SHA-256
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a random token
 * @param {number} bytes - Number of bytes (default: 64)
 * @returns {string} Random hex token
 */
const generateToken = (bytes = 64) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Calculate pagination values
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
const getPagination = (page, limit, total) => {
  const currentPage = parseInt(page, 10) || 1;
  const itemsPerPage = parseInt(limit, 10) || 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: total,
    offset,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

/**
 * Sanitize user object for response (remove sensitive fields)
 * @param {Object} user - User object
 * @returns {Object} Sanitized user
 */
const sanitizeUser = (user) => {
  const { id, email, is_verified, created_at, updated_at } = user;
  return { id, email, is_verified, created_at, updated_at };
};

module.exports = {
  generateOtp,
  hashToken,
  generateToken,
  getPagination,
  sanitizeUser
};
