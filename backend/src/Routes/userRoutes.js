import express from "express";
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getFollowers,
  getFollowing,
  getUserStats,
  updatePreferences,
  updateLastLogin,
  getUserActivity,
  updateUserPhoto,
  updateUserStats,
  getUserPreferences,
  verifyUser,
} from "../Controllers/userController.js";
import { protect } from "../Middleware/auth.js";
import { isAdmin } from "../Middleware/ownership.js";

const router = express.Router();

// Public routes
router.get("/profile/:id", getProfile);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);
router.get("/:id/stats", getUserStats);
router.get("/:id/activity", getUserActivity);

// Protected routes
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteAccount);
router.put("/preferences", protect, updatePreferences);
router.put("/last-login", protect, updateLastLogin);
router.put("/photo", protect, updateUserPhoto);
router.put("/stats", protect, updateUserStats);
router.get("/preferences", protect, getUserPreferences);

// Admin routes
router.put("/:id/verify", protect, isAdmin, verifyUser);

export default router;
