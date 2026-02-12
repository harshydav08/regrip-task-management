const taskService = require('../services/taskService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.userId, req.body, req);
  
  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task }
  });
});

/**
 * @desc    Get all tasks with filtering and pagination
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.userId, req.query);
  
  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.userId, req.params.id);
  
  res.status(200).json({
    success: true,
    data: { task }
  });
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.userId, req.params.id, req.body, req);
  
  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task }
  });
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.userId, req.params.id, req);
  
  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Get task statistics
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getTaskStats(req.userId);
  
  res.status(200).json({
    success: true,
    data: { stats }
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats
};
