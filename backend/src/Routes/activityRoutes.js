import express from "express";
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  searchActivities,
  getPopularActivities,
  getActivitiesByCategory,
} from "../Controllers/activityController.js";
import { protect, isAdmin } from "../Middleware/auth.js";
import { idParamValidator } from "../Middleware/validators.js";

const router = express.Router();

// Public routes
router.get("/", getAllActivities);
router.get("/search", searchActivities);
router.get("/popular", getPopularActivities);
router.get("/category/:category", getActivitiesByCategory);
router.get("/:id", idParamValidator, getActivityById);

// Protected routes (require authentication and admin role)
router.post("/", protect, isAdmin, createActivity);
router.put("/:id", idParamValidator, protect, isAdmin, updateActivity);
router.delete("/:id", idParamValidator, protect, isAdmin, deleteActivity);

export default router;
