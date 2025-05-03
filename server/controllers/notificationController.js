import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, is_read } = req.query;

    const query = { user_id: req.user.id };
    if (is_read !== undefined) {
      query.is_read = is_read;
    }

    const notifications = await Notification.find(query)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      unreadCount: await Notification.countDocuments({
        user_id: req.user.id,
        is_read: false
      })
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user_id: req.user.id },
      { $set: { is_read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { $set: { is_read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user_id: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user_id: req.user.id });
    res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to create notifications (used by other controllers)
export const createNotification = async ({
  userId,
  type,
  content,
  actionUrl
}) => {
  try {
    return await Notification.create({
      user_id: userId,
      type,
      content,
      action_url: actionUrl,
      is_read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}; 