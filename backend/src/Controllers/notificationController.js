import Notification from "../Models/Notification.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "NotificationController";

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const userId = req.user.id;

  const query = { user_id: userId };
  if (type) query.type = type;

  const options = {
    sort: { createdAt: -1 },
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  const [notifications, total] = await Promise.all([
    Notification.find(query, null, options),
    Notification.countDocuments(query),
  ]);

  logger.logInfo(NAMESPACE, `Retrieved notifications for user: ${userId}`);
  return successPatterns.retrieved(res, {
    data: notifications,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    _id: id,
    user_id: userId,
  });

  if (!notification) {
    return errorPatterns.notFound(res, { message: "Notification not found" });
  }

  notification.is_read = true;
  await notification.save();

  logger.logInfo(NAMESPACE, `Marked notification ${id} as read`);
  return successPatterns.updated(res, {
    data: notification,
    message: "Notification marked as read",
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Notification.updateMany(
    { user_id: userId, is_read: false },
    { is_read: true }
  );

  logger.logInfo(
    NAMESPACE,
    `Marked all notifications as read for user: ${userId}`
  );
  return successPatterns.updated(res, {
    message: "All notifications marked as read",
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    user_id: userId,
  });

  if (!notification) {
    return errorPatterns.notFound(res, { message: "Notification not found" });
  }

  logger.logInfo(NAMESPACE, `Deleted notification ${id}`);
  return successPatterns.deleted(res, {
    message: "Notification deleted successfully",
  });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread/count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await Notification.countDocuments({
    user_id: userId,
    is_read: false,
  });

  logger.logInfo(NAMESPACE, `Retrieved unread count for user: ${userId}`);
  return successPatterns.retrieved(res, {
    data: { count },
  });
});

/**
 * @desc    Create new notification
 * @route   POST /api/notifications
 * @access  Private (Internal/Admin)
 */
export const createNotification = asyncHandler(async (req, res) => {
  const { user_id, type, data } = req.body;

  const notification = await Notification.create({
    user_id,
    type,
    data,
    is_read: false,
  });

  logger.logInfo(
    NAMESPACE,
    `Created notification for user: ${user_id}, type: ${type}`
  );
  return successPatterns.created(res, {
    data: notification,
    message: "Notification created successfully",
  });
});

/**
 * @desc    Update notification read status
 * @route   PATCH /api/notifications/:id/status
 * @access  Private
 */
export const updateNotificationReadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_read } = req.body;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    _id: id,
    user_id: userId,
  });

  if (!notification) {
    return errorPatterns.notFound(res, { message: "Notification not found" });
  }

  notification.is_read = is_read;
  await notification.save();

  logger.logInfo(
    NAMESPACE,
    `Updated notification ${id} read status to: ${is_read}`
  );
  return successPatterns.updated(res, {
    data: notification,
    message: "Notification status updated",
  });
});

/**
 * @desc    Get notifications by type
 * @route   GET /api/notifications/type/:type
 * @access  Private
 */
export const getNotificationsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  const options = {
    sort: { createdAt: -1 },
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  const [notifications, total] = await Promise.all([
    Notification.find({ user_id: userId, type }, null, options),
    Notification.countDocuments({ user_id: userId, type }),
  ]);

  logger.logInfo(
    NAMESPACE,
    `Retrieved ${type} notifications for user: ${userId}`
  );
  return successPatterns.retrieved(res, {
    data: notifications,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Delete old notifications
 * @route   DELETE /api/notifications/cleanup
 * @access  Private (Admin)
 */
export const deleteOldNotifications = asyncHandler(async (req, res) => {
  const { days = 30 } = req.body;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    is_read: true,
  });

  logger.logInfo(
    NAMESPACE,
    `Deleted ${result.deletedCount} old notifications older than ${days} days`
  );
  return successPatterns.deleted(res, {
    data: { deletedCount: result.deletedCount },
    message: `Deleted ${result.deletedCount} old notifications`,
  });
});
