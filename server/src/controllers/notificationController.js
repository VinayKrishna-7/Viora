const notificationService = require('../services/notificationService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await notificationService.getUserNotifications(req.user._id, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Notifications retrieved successfully'));
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Unread notification count retrieved'));
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const updated = await notificationService.markAsRead(req.params.id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, updated, 'Notification marked as read'));
});

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'All notifications marked as read'));
});

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
