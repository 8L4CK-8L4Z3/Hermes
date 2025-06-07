import express from "express";
import {
  reportContent,
  getReports,
  handleReport,
  getModerationQueue,
  logModerationAction,
  getModerationHistory,
  getModeratorStats,
} from "../Controllers/moderationController.js";
import { protect, isModerator } from "../Middleware/auth.js";
import { validateReport, validateModAction } from "../Middleware/validators.js";

const router = express.Router();

// Public routes (with authentication)
router.post("/report", protect, validateReport, reportContent);

// Moderator only routes
router.get("/reports", protect, isModerator, getReports);
router.put("/reports/:id", protect, isModerator, handleReport);
router.get("/queue", protect, isModerator, getModerationQueue);
router.post(
  "/log",
  protect,
  isModerator,
  validateModAction,
  logModerationAction
);
router.get("/history", protect, isModerator, getModerationHistory);
router.get("/stats", protect, isModerator, getModeratorStats);

export default router;
