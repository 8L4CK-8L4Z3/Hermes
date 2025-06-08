import express from "express";
import {
  getStats,
  getUsers,
  updateUserRole,
  banUser,
  unbanUser,
  getModerationLogs,
  getAnalytics,
  getReportedContent,
  moderateContent,
} from "../Controllers/adminController.js";
import { protect, isAdmin } from "../Middleware/auth.js";
import { cache } from "../Middleware/cache.js";

const router = express.Router();

// All routes are protected and require admin access
router.use(protect, isAdmin);

// Admin dashboard stats
router.get("/stats", cache("5m"), getStats);

// User management
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/ban", banUser);
router.put("/users/:id/unban", unbanUser);

// Moderation and analytics
router.get("/moderation-logs", getModerationLogs);
router.get("/analytics", cache("15m"), getAnalytics);
router.get("/reported-content", getReportedContent);
router.put("/reported-content/:id", moderateContent);

export default router;
