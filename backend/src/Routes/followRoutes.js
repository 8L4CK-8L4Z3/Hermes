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
import { idParamValidator } from "../Middleware/validators.js"; 

const router = express.Router();

// Public routes (with caching)
router.get("/:userId/followers", cache("5m"), getFollowers);
router.get("/:userId/following", cache("5m"), getFollowing);
router.get("/:userId/stats", cache("5m"), getFollowStats);

// Protected routes
router.use(protect);
router.post("/:userId", idParamValidator, followUser);
router.delete("/:userId", idParamValidator, unfollowUser);
router.get("/suggestions", cache("15m"), getFollowSuggestions);
router.get("/:userId/mutual", idParamValidator, getMutualFollowers);

export default router;
