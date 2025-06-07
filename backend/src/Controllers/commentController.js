import { Comment } from "../Models/Comment.js";
import { Post } from "../Models/Post.js";
import { logger } from "../Utils/logger.js";
import { validateComment } from "../Utils/validators.js";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "../Utils/responses.js";

class CommentController {
  /**
   * Create a new comment
   * @route POST /api/comments
   */
  async createComment(req, res) {
    try {
      const { content, postId, parentCommentId } = req.body;
      const userId = req.user.id; // From auth middleware

      // Validate input
      const validation = validateComment({ content, postId, parentCommentId });
      if (!validation.success) {
        return validationErrorResponse(res, validation.errors);
      }

      // Check if post exists
      const post = await Post.findById(postId);
      if (!post) {
        return notFoundResponse(res, "Post not found");
      }

      // If it's a reply, check if parent comment exists
      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
          return notFoundResponse(res, "Parent comment not found");
        }
      }

      const comment = new Comment({
        content,
        post: postId,
        user: userId,
        parentComment: parentCommentId || null,
      });

      await comment.save();

      logger.info(`Comment created by user ${userId} on post ${postId}`);
      return successResponse(res, comment);
    } catch (error) {
      logger.error("Error creating comment:", error);
      return errorResponse(res, "Failed to create comment");
    }
  }

  /**
   * Get a specific comment
   * @route GET /api/comments/:id
   */
  async getComment(req, res) {
    try {
      const { id } = req.params;

      const comment = await Comment.findById(id)
        .populate("user", "username photo")
        .populate("parentComment");

      if (!comment) {
        return notFoundResponse(res, "Comment not found");
      }

      return successResponse(res, comment);
    } catch (error) {
      logger.error("Error fetching comment:", error);
      return errorResponse(res, "Failed to fetch comment");
    }
  }

  /**
   * Update a comment
   * @route PUT /api/comments/:id
   */
  async updateComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Validate input
      const validation = validateComment({ content });
      if (!validation.success) {
        return validationErrorResponse(res, validation.errors);
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        return notFoundResponse(res, "Comment not found");
      }

      // Check if user owns the comment
      if (comment.user.toString() !== userId) {
        return errorResponse(res, "Unauthorized to update this comment", 403);
      }

      comment.content = content;
      comment.updatedAt = Date.now();
      await comment.save();

      logger.info(`Comment ${id} updated by user ${userId}`);
      return successResponse(res, comment);
    } catch (error) {
      logger.error("Error updating comment:", error);
      return errorResponse(res, "Failed to update comment");
    }
  }

  /**
   * Delete a comment
   * @route DELETE /api/comments/:id
   */
  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const comment = await Comment.findById(id);
      if (!comment) {
        return notFoundResponse(res, "Comment not found");
      }

      // Check if user owns the comment or is admin
      if (comment.user.toString() !== userId && !req.user.isAdmin) {
        return errorResponse(res, "Unauthorized to delete this comment", 403);
      }

      await comment.remove();

      logger.info(`Comment ${id} deleted by user ${userId}`);
      return successResponse(res, { message: "Comment deleted successfully" });
    } catch (error) {
      logger.error("Error deleting comment:", error);
      return errorResponse(res, "Failed to delete comment");
    }
  }

  /**
   * Get comments for a post
   * @route GET /api/posts/:postId/comments
   */
  async getPostComments(req, res) {
    try {
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

      return successResponse(res, comments, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      });
    } catch (error) {
      logger.error("Error fetching post comments:", error);
      return errorResponse(res, "Failed to fetch comments");
    }
  }

  /**
   * Like a comment
   * @route POST /api/comments/:id/like
   */
  async likeComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const comment = await Comment.findById(id);
      if (!comment) {
        return notFoundResponse(res, "Comment not found");
      }

      // Check if already liked
      if (comment.likes.includes(userId)) {
        return errorResponse(res, "Comment already liked", 400);
      }

      comment.likes.push(userId);
      await comment.save();

      logger.info(`Comment ${id} liked by user ${userId}`);
      return successResponse(res, { message: "Comment liked successfully" });
    } catch (error) {
      logger.error("Error liking comment:", error);
      return errorResponse(res, "Failed to like comment");
    }
  }

  /**
   * Unlike a comment
   * @route POST /api/comments/:id/unlike
   */
  async unlikeComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const comment = await Comment.findById(id);
      if (!comment) {
        return notFoundResponse(res, "Comment not found");
      }

      // Remove user from likes array
      comment.likes = comment.likes.filter(
        (like) => like.toString() !== userId
      );
      await comment.save();

      logger.info(`Comment ${id} unliked by user ${userId}`);
      return successResponse(res, { message: "Comment unliked successfully" });
    } catch (error) {
      logger.error("Error unliking comment:", error);
      return errorResponse(res, "Failed to unlike comment");
    }
  }

  /**
   * Get replies to a comment
   * @route GET /api/comments/:id/replies
   */
  async getCommentReplies(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const replies = await Comment.find({ parentComment: id })
        .populate("user", "username photo")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Comment.countDocuments({ parentComment: id });

      return successResponse(res, replies, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      });
    } catch (error) {
      logger.error("Error fetching comment replies:", error);
      return errorResponse(res, "Failed to fetch replies");
    }
  }

  /**
   * Get full comment thread
   * @route GET /api/comments/:id/thread
   */
  async getCommentThread(req, res) {
    try {
      const { id } = req.params;

      // Get the main comment and all its nested replies
      const thread = await Comment.findById(id)
        .populate("user", "username photo")
        .populate({
          path: "replies",
          populate: {
            path: "user",
            select: "username photo",
          },
        });

      if (!thread) {
        return notFoundResponse(res, "Comment thread not found");
      }

      return successResponse(res, thread);
    } catch (error) {
      logger.error("Error fetching comment thread:", error);
      return errorResponse(res, "Failed to fetch comment thread");
    }
  }

  /**
   * Update comment content
   * @route PATCH /api/comments/:id/content
   */
  async updateCommentContent(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Validate input
      const validation = validateComment({ content });
      if (!validation.success) {
        return validationErrorResponse(res, validation.errors);
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        return notFoundResponse(res, "Comment not found");
      }

      // Check if user owns the comment
      if (comment.user.toString() !== userId) {
        return errorResponse(res, "Unauthorized to update this comment", 403);
      }

      comment.content = content;
      comment.isEdited = true;
      comment.updatedAt = Date.now();
      await comment.save();

      logger.info(`Comment ${id} content updated by user ${userId}`);
      return successResponse(res, comment);
    } catch (error) {
      logger.error("Error updating comment content:", error);
      return errorResponse(res, "Failed to update comment content");
    }
  }
}

export default new CommentController();
