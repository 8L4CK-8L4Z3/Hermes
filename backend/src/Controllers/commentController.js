import Comment from "../Models/Comment.js";
import Post from "../Models/Post.js";
import logger from "../Utils/logger.js";
import { commentValidator } from "../Middleware/validators.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "CommentController";

/**
 * @desc    Create a new comment
 * @route   POST /api/comments
 * @access  Private
 */
export const createComment = asyncHandler(async (req, res) => {
  const { content, postId, parentCommentId } = req.body;
  const userId = req.user.id;

  // Validate input
  const validation = commentValidator({ content, postId, parentCommentId });
  if (!validation.success) {
    return errorPatterns.validationError(res, validation.errors);
  }

  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    return errorPatterns.notFound(res, { message: "Post not found" });
  }

  // If it's a reply, check if parent comment exists
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return errorPatterns.notFound(res, {
        message: "Parent comment not found",
      });
    }
  }

  const comment = new Comment({
    content,
    post: postId,
    user: userId,
    parentComment: parentCommentId || null,
  });

  await comment.save();

  logger.logInfo(
    NAMESPACE,
    `Comment created by user ${userId} on post ${postId}`
  );
  return successPatterns.created(res, { data: comment });
});

/**
 * @desc    Get a specific comment
 * @route   GET /api/comments/:id
 * @access  Public
 */
export const getComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id)
    .populate("user", "username photo")
    .populate("parentComment");

  if (!comment) {
    return errorPatterns.notFound(res, { message: "Comment not found" });
  }

  return successPatterns.ok(res, { data: comment });
});

/**
 * @desc    Update a comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  // Validate input
  const validation = validateComment({ content });
  if (!validation.success) {
    return errorPatterns.validationError(res, validation.errors);
  }

  const comment = await Comment.findById(id);
  if (!comment) {
    return errorPatterns.notFound(res, { message: "Comment not found" });
  }

  // Check if user owns the comment
  if (comment.user.toString() !== userId) {
    return errorPatterns.unauthorized(
      res,
      { message: "Unauthorized to update this comment" },
      HTTP_STATUS.FORBIDDEN
    );
  }

  comment.content = content;
  comment.updatedAt = Date.now();
  await comment.save();

  logger.logInfo(NAMESPACE, `Comment ${id} updated by user ${userId}`);
  return successPatterns.ok(res, { data: comment });
});

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const comment = await Comment.findById(id);
  if (!comment) {
    return errorPatterns.notFound(res, { message: "Comment not found" });
  }

  // Check if user owns the comment or is admin
  if (comment.user.toString() !== userId && !req.user.isAdmin) {
    return errorPatterns.unauthorized(
      res,
      { message: "Unauthorized to delete this comment" },
      HTTP_STATUS.FORBIDDEN
    );
  }

  await comment.remove();

  logger.logInfo(NAMESPACE, `Comment ${id} deleted by user ${userId}`);
  return successPatterns.ok(res, { message: "Comment deleted successfully" });
});

/**
 * @desc    Get comments for a post
 * @route   GET /api/posts/:postId/comments
 * @access  Public
 */
export const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comments = await Comment.find({ post: postId, parentComment: null })
    .populate("user", "username photo")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Comment.countDocuments({
    post: postId,
    parentComment: null,
  });

  return successPatterns.ok(res, {
    data: comments,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
    },
  });
});

/**
 * @desc    Like a comment
 * @route   POST /api/comments/:id/like
 * @access  Private
 */
export const likeComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const comment = await Comment.findById(id);
  if (!comment) {
    return errorPatterns.notFound(res, { message: "Comment not found" });
  }

  // Check if already liked
  if (comment.likes.includes(userId)) {
    return errorPatterns.badRequest(res, { message: "Comment already liked" });
  }

  comment.likes.push(userId);
  await comment.save();

  logger.logInfo(NAMESPACE, `Comment ${id} liked by user ${userId}`);
  return successPatterns.ok(res, { message: "Comment liked successfully" });
});

/**
 * @desc    Unlike a comment
 * @route   DELETE /api/comments/:id/like
 * @access  Private
 */
export const unlikeComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const comment = await Comment.findById(id);
  if (!comment) {
    return errorPatterns.notFound(res, { message: "Comment not found" });
  }

  const likeIndex = comment.likes.indexOf(userId);
  if (likeIndex === -1) {
    return errorPatterns.badRequest(res, { message: "Comment not liked yet" });
  }

  comment.likes.splice(likeIndex, 1);
  await comment.save();

  logger.logInfo(NAMESPACE, `Comment ${id} unliked by user ${userId}`);
  return successPatterns.ok(res, { message: "Comment unliked successfully" });
});

/**
 * @desc    Get comment replies
 * @route   GET /api/comments/:id/replies
 * @access  Public
 */
export const getCommentReplies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const replies = await Comment.find({ parentComment: id })
    .populate("user", "username photo")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Comment.countDocuments({ parentComment: id });

  return successPatterns.ok(res, {
    data: replies,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
    },
  });
});

/**
 * @desc    Get comment thread
 * @route   GET /api/comments/:id/thread
 * @access  Public
 */
export const getCommentThread = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const thread = await Comment.findById(id)
    .populate("user", "username photo")
    .populate({
      path: "parentComment",
      populate: { path: "user", select: "username photo" },
    });

  if (!thread) {
    return errorPatterns.notFound(res, { message: "Comment thread not found" });
  }

  return successPatterns.ok(res, { data: thread });
});

/**
 * @desc    Update comment content
 * @route   PATCH /api/comments/:id/content
 * @access  Private
 */
export const updateCommentContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  // Validate input
  const validation = validateComment({ content });
  if (!validation.success) {
    return errorPatterns.validationError(res, validation.errors);
  }

  const comment = await Comment.findById(id);
  if (!comment) {
    return errorPatterns.notFound(res, { message: "Comment not found" });
  }

  // Check if user owns the comment
  if (comment.user.toString() !== userId) {
    return errorPatterns.unauthorized(
      res,
      { message: "Unauthorized to update this comment" },
      HTTP_STATUS.FORBIDDEN
    );
  }

  comment.content = content;
  comment.updatedAt = Date.now();
  await comment.save();

  logger.logInfo(NAMESPACE, `Comment ${id} content updated by user ${userId}`);
  return successPatterns.ok(res, { data: comment });
});
