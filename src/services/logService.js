const { ActivityLog } = require('../models');
const logger = require('../config/logger');

/**
 * Log actions enum
 */
const ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  OTP_REQUEST: 'OTP_REQUEST',
  OTP_VERIFY: 'OTP_VERIFY',
  TOKEN_REFRESH: 'TOKEN_REFRESH'
};

/**
 * Entity types enum
 */
const ENTITY_TYPES = {
  TASK: 'TASK',
  USER: 'USER',
  AUTH: 'AUTH'
};

/**
 * Create an activity log entry
 * @param {Object} params - Log parameters
 * @param {string} params.userId - User ID
 * @param {string} params.action - Action performed
 * @param {string} params.entityType - Type of entity
 * @param {string} params.entityId - Entity ID (optional)
 * @param {Object} params.oldValues - Previous values (optional)
 * @param {Object} params.newValues - New values (optional)
 * @param {Object} params.req - Express request object (optional)
 */
const logActivity = async ({
  userId,
  action,
  entityType,
  entityId = null,
  oldValues = null,
  newValues = null,
  req = null
}) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null,
      user_agent: req ? req.get('User-Agent') : null
    });
  } catch (error) {
    // Log error but don't throw - activity logging shouldn't break main flow
    logger.error('Failed to create activity log:', error);
  }
};

/**
 * Log task creation
 */
const logTaskCreate = async (userId, task, req) => {
  await logActivity({
    userId,
    action: ACTIONS.CREATE,
    entityType: ENTITY_TYPES.TASK,
    entityId: task.id,
    newValues: {
      title: task.title,
      status: task.status,
      priority: task.priority
    },
    req
  });
};

/**
 * Log task update
 */
const logTaskUpdate = async (userId, taskId, oldValues, newValues, req) => {
  await logActivity({
    userId,
    action: ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.TASK,
    entityId: taskId,
    oldValues,
    newValues,
    req
  });
};

/**
 * Log task deletion
 */
const logTaskDelete = async (userId, task, req) => {
  await logActivity({
    userId,
    action: ACTIONS.DELETE,
    entityType: ENTITY_TYPES.TASK,
    entityId: task.id,
    oldValues: {
      title: task.title,
      status: task.status,
      priority: task.priority
    },
    req
  });
};

/**
 * Log authentication events
 */
const logAuthEvent = async (userId, action, req) => {
  await logActivity({
    userId,
    action,
    entityType: ENTITY_TYPES.AUTH,
    req
  });
};

module.exports = {
  ACTIONS,
  ENTITY_TYPES,
  logActivity,
  logTaskCreate,
  logTaskUpdate,
  logTaskDelete,
  logAuthEvent
};
