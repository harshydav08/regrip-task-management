const Joi = require('joi');

/**
 * Validation schema for creating a task
 */
const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(255)
    .required()
    .trim()
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .max(2000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  status: Joi.string()
    .valid('pending', 'in_progress', 'completed')
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),
  due_date: Joi.date()
    .iso()
    .allow(null)
    .optional()
    .messages({
      'date.format': 'Due date must be in ISO format'
    })
});

/**
 * Validation schema for updating a task
 */
const updateTaskSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(255)
    .trim()
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 255 characters'
    }),
  description: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  status: Joi.string()
    .valid('pending', 'in_progress', 'completed')
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),
  due_date: Joi.date()
    .iso()
    .allow(null)
    .messages({
      'date.format': 'Due date must be in ISO format'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Validation schema for task query parameters
 */
const taskQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  status: Joi.string()
    .valid('pending', 'in_progress', 'completed'),
  priority: Joi.string()
    .valid('low', 'medium', 'high'),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'due_date', 'priority', 'status')
    .default('created_at'),
  order: Joi.string()
    .valid('ASC', 'DESC', 'asc', 'desc')
    .default('DESC')
});

/**
 * Validation schema for task ID parameter
 */
const taskIdSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid task ID format',
      'any.required': 'Task ID is required'
    })
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskIdSchema
};
