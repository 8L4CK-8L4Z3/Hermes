import express from "express";
import {
  createComment,
  getComment,
  updateComment,
  deleteComment,
  getPostComments,
  likeComment,
  unlikeComment,
  getCommentReplies,
  getCommentThread,
  updateCommentContent,
} from "../Controllers/commentController.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();
router.use(protect);

// Base routes
router.post("/", createComment);
router.get("/:id", getComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

// Post comments
router.get("/post/:postId", getPostComments);

// Like/Unlike routes
router.post("/:id/like", likeComment);
router.post("/:id/unlike", unlikeComment);

// Replies and thread routes
router.get("/:id/replies", getCommentReplies);
router.get("/:id/thread", getCommentThread);

// Content update route
router.patch("/:id/content", updateCommentContent);

export default router;
