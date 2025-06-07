import express from "express";
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
  getFeed,
  getUserPosts,
  updatePostVisibility,
  updatePostType,
  updatePostLocation,
  getPostsByType,
  getPostsByVisibility,
  getPostsByLocation,
  getPostsByTags,
} from "../Controllers/postController.js";
import { protect } from "../Middleware/auth.js";
import { postValidator } from "../Middleware/validators.js";
import { cache } from "../Middleware/cache.js";

const router = express.Router();

// Public routes with caching
router.get("/:id", cache("15m"), getPost);
router.get("/type/:type", cache("15m"), getPostsByType);
router.get("/location", cache("15m"), getPostsByLocation);
router.get("/tags", cache("15m"), getPostsByTags);
router.get("/user/:userId", cache("15m"), getUserPosts);

// Protected routes
router.use(protect);

// Post CRUD operations
router.post("/", postValidator, createPost);
router.put("/:id", postValidator, updatePost);
router.delete("/:id", deletePost);

// Feed
router.get("/feed", getFeed);

// Post attribute updates
router.patch("/:id/visibility", updatePostVisibility);
router.patch("/:id/type", updatePostType);
router.patch("/:id/location", updatePostLocation);

// Visibility-specific routes
router.get("/visibility/:visibility", getPostsByVisibility);

export default router;
