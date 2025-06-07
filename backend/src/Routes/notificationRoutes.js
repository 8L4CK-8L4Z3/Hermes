import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createNotification,
  updateNotificationReadStatus,
  getNotificationsByType,
  deleteOldNotifications,
} from "../Controllers/notificationController.js";
import { protect } from "../Middleware/auth.js";
import { isAdmin } from "../Middleware/ownership.js";
const router = express.Router();

// Public routes (none)

// Protected routes (require authentication)
router.use(protect);

router.get("/", getNotifications);
router.get("/unread/count", getUnreadCount);
router.get("/type/:type", getNotificationsByType);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/status", updateNotificationReadStatus);
router.delete("/:id", deleteNotification);

// Admin only routes
router.post("/", isAdmin, createNotification);
router.delete("/cleanup", isAdmin, deleteOldNotifications);

export default router;
