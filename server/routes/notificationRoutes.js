import express from 'express';
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
  deleteNotification, deleteAllNotifications
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get notifications with pagination and filters
router.get('/',
  validatePagination,
  getNotifications
);

// Mark single notification as read
router.put('/:id/read',
  validateObjectId('id'),
  markNotificationRead
);

// Mark all notifications as read
router.put('/read/all',
  markAllNotificationsRead
);

// Delete single notification
router.delete('/:id',
  validateObjectId('id'),
  deleteNotification
);

// Delete all notifications
router.delete('/all',
  deleteAllNotifications
);

export default router; 