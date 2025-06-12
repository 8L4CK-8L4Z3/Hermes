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
import {
  banUserValidator,
  idParamValidator,
  analyticsDatesValidator,
  reportedContentValidator,
  moderateContentValidator,
} from "../Middleware/validators.js";
const router = express.Router();

// All routes are protected and require admin access
router.use(protect, isAdmin); //Working

// Admin dashboard stats
router.get("/stats", cache("5m"), getStats); //Working

// User management
router.get("/users", getUsers); //Working
router.put("/users/:id/role", idParamValidator, updateUserRole); //Working
router.put("/users/:id/ban", banUserValidator, banUser); //Working
router.put("/users/:id/unban", idParamValidator, unbanUser); //Working

// Moderation and analytics
router.get("/moderation-logs", getModerationLogs);
router.post("/analytics", analyticsDatesValidator, getAnalytics);
router.get("/reported-content", reportedContentValidator, getReportedContent);
router.put("/reported-content/:id",moderateContentValidator,moderateContent);

export default router;
