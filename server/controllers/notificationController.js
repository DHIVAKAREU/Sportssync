const Notification = require('../models/notifications.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc Get user notifications
 * @route GET /api/v1/notifications
 * @access Protected
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    return successResponse(res, 200, { notifications, unreadCount }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Mark notification read
 * @route PATCH /api/v1/notifications/:id/read
 * @access Protected
 */
const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return errorResponse(res, 404, 'Notification not found', 'NOT_FOUND');

    return successResponse(res, 200, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Mark all notifications read
 * @route PATCH /api/v1/notifications/read-all
 * @access Protected
 */
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return successResponse(res, 200, {}, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};
