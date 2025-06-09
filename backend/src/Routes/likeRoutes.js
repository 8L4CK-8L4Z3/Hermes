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
import {
  idParamValidator,
  likeValidator,
  createMongoIdValidator,
} from "../Middleware/validators.js";

const router = express.Router();
const userIdValidator = createMongoIdValidator("userId");

// Public routes
router.get("/content/:type/:id", idParamValidator, getLikes);
router.get("/type/:type", getLikesByType);

// Protected routes
router.use(protect);
router.post("/", likeValidator, likeContent);
router.delete("/", likeValidator, unlikeContent);
router.get("/user/:userId", userIdValidator, getUserLikes);
router.get("/user/:userId/content", userIdValidator, getLikedContent);

export default router;
