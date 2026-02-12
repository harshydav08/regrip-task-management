const { Task } = require('../models');
const { Op } = require('sequelize');
const { getPagination } = require('../utils/helpers');
const AppError = require('../utils/AppError');
const logService = require('./logService');

/**
 * Create a new task
 * @param {string} userId - User ID
 * @param {Object} taskData - Task data
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Created task
 */
const createTask = async (userId, taskData, req) => {
  const task = await Task.create({
    user_id: userId,
    ...taskData
  });
  
  // Log activity
  await logService.logTaskCreate(userId, task, req);
  
  return task;
};

/**
 * Get all tasks for user with filtering and pagination
 * @param {string} userId - User ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>} Tasks with pagination
 */
const getTasks = async (userId, query) => {
  const { page, limit, status, priority, sortBy, order } = query;
  
  // Build where clause
  const where = { user_id: userId };
  
  if (status) {
    where.status = status;
  }
  
  if (priority) {
    where.priority = priority;
  }
  
  // Count total matching tasks
  const total = await Task.count({ where });
  
  // Calculate pagination
  const pagination = getPagination(page, limit, total);
  
  // Fetch tasks
  const tasks = await Task.findAll({
    where,
    order: [[sortBy || 'created_at', (order || 'DESC').toUpperCase()]],
    limit: pagination.itemsPerPage,
    offset: pagination.offset,
    attributes: { exclude: ['user_id'] }
  });
  
  return {
    tasks,
    pagination: {
      currentPage: pagination.currentPage,
      itemsPerPage: pagination.itemsPerPage,
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage
    }
  };
};

/**
 * Get a single task by ID
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task
 */
const getTaskById = async (userId, taskId) => {
  const task = await Task.findOne({
    where: { id: taskId, user_id: userId },
    attributes: { exclude: ['user_id'] }
  });
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  
  return task;
};

/**
 * Update a task
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {Object} updateData - Update data
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Updated task
 */
const updateTask = async (userId, taskId, updateData, req) => {
  const task = await Task.findOne({
    where: { id: taskId, user_id: userId }
  });
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  
  // Store old values for logging
  const oldValues = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date
  };
  
  // Update task
  await task.update(updateData);
  
  // Log activity with changes
  await logService.logTaskUpdate(userId, taskId, oldValues, updateData, req);
  
  return task;
};

/**
 * Delete a task
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {Object} req - Express request object
 */
const deleteTask = async (userId, taskId, req) => {
  const task = await Task.findOne({
    where: { id: taskId, user_id: userId }
  });
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  
  // Log before deletion
  await logService.logTaskDelete(userId, task, req);
  
  // Delete task
  await task.destroy();
  
  return { message: 'Task deleted successfully' };
};

/**
 * Get task statistics for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics
 */
const getTaskStats = async (userId) => {
  const [total, pending, inProgress, completed] = await Promise.all([
    Task.count({ where: { user_id: userId } }),
    Task.count({ where: { user_id: userId, status: 'pending' } }),
    Task.count({ where: { user_id: userId, status: 'in_progress' } }),
    Task.count({ where: { user_id: userId, status: 'completed' } })
  ]);
  
  const overdue = await Task.count({
    where: {
      user_id: userId,
      status: { [Op.ne]: 'completed' },
      due_date: { [Op.lt]: new Date() }
    }
  });
  
  return {
    total,
    pending,
    inProgress,
    completed,
    overdue
  };
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
};
