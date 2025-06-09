import express from "express";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowSuggestions,
  getFollowStats,
  getMutualFollowers,
} from "../Controllers/followController.js";
import { protect } from "../Middleware/auth.js";
import { cache } from "../Middleware/cache.js";
import { createMongoIdValidator } from "../Middleware/validators.js";

const router = express.Router();
const userIdValidator = createMongoIdValidator("userId");

// Public routes (with caching)
router.get("/:userId/followers", userIdValidator, cache("5m"), getFollowers);
router.get("/:userId/following", userIdValidator, cache("5m"), getFollowing);
router.get("/:userId/stats", userIdValidator, cache("5m"), getFollowStats);

// Protected routes
router.use(protect);
router.post("/:userId", userIdValidator, followUser);
router.delete("/:userId", userIdValidator, unfollowUser);
router.get("/suggestions", cache("15m"), getFollowSuggestions);
router.get("/:userId/mutual", userIdValidator, getMutualFollowers);

export default router;
