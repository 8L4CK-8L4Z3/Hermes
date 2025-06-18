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
  toggleLike,
} from "../Controllers/postController.js";
import { protect } from "../Middleware/auth.js";
import { postValidator } from "../Middleware/validators.js";
import { cache } from "../Middleware/cache.js";

const router = express.Router();

// Public routes with caching
router.get("/type/:type", cache("15m"), getPostsByType);
router.get("/location", cache("15m"), getPostsByLocation);
router.get("/tags", cache("15m"), getPostsByTags);
router.get("/user/:userId", cache("15m"), getUserPosts);
router.get("/visibility/:visibility", getPostsByVisibility);

// Protected routes
router.use(protect);

// Feed route - must come before /:id to prevent conflict
router.get("/feed", getFeed);

// Post interactions
router.post("/:id/like", toggleLike);

// Post attribute updates
router.patch("/:id/visibility", updatePostVisibility);
router.patch("/:id/type", updatePostType);
router.patch("/:id/location", updatePostLocation);

// Post CRUD operations - generic ID routes should come last
router.post("/", postValidator, createPost);
router.get("/:id", cache("15m"), getPost);
router.put("/:id", postValidator, updatePost);
router.delete("/:id", deletePost);

export default router;
