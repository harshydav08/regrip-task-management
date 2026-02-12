/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[property];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,      // Return all errors, not just the first
      stripUnknown: true,     // Remove unknown fields
      convert: true           // Convert types where possible
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Replace request data with validated & sanitized data
    req[property] = value;
    
    // Also store in validatedBody/validatedQuery/validatedParams for clarity
    if (property === 'body') {
      req.validatedBody = value;
    } else if (property === 'query') {
      req.validatedQuery = value;
    } else if (property === 'params') {
      req.validatedParams = value;
    }
    
    next();
  };
};

/**
 * Validate request body
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate query parameters
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate URL parameters
 */
const validateParams = (schema) => validate(schema, 'params');

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams
};
