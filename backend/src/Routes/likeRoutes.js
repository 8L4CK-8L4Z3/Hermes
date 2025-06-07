import express from "express";
import {
  likeContent,
  unlikeContent,
  getLikes,
  getUserLikes,
  getLikesByType,
  getLikedContent,
} from "../Controllers/likeController.js";
import { protect } from "../Middleware/auth.js";
import { idParamValidator, likeValidator } from "../Middleware/validators.js";

const router = express.Router();

// Public routes
router.get("/content/:type/:id", idParamValidator, getLikes);
router.get("/type/:type", getLikesByType);

// Protected routes
router.use(protect);
router.post("/", likeValidator, likeContent);
router.delete("/", likeValidator, unlikeContent);
router.get("/user/:userId", idParamValidator, getUserLikes);
router.get("/user/:userId/content", idParamValidator, getLikedContent);

export default router;
