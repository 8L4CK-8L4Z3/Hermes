import Like from "../Models/Like.js";
import Post from "../Models/Post.js";
import Comment from "../Models/Comment.js";
import Review from "../Models/Review.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "LikeController";

/**
 * @desc    Like any content type (post, comment, review)
 * @route   POST /api/likes
 * @access  Private
 */
export const likeContent = asyncHandler(async (req, res) => {
  const { target_type, target_id } = req.body;
  const user_id = req.user._id;

  logger.logInfo(NAMESPACE, `Liking ${target_type} with ID: ${target_id}`);

  // Validate target exists
  let target;
  switch (target_type) {
    case "Post":
      target = await Post.findById(target_id);
      break;
    case "Comment":
      target = await Comment.findById(target_id);
      break;
    case "Review":
      target = await Review.findById(target_id);
      break;
    default:
      return errorPatterns.badRequest(res, {
        message: "Invalid content type",
      });
  }

  if (!target) {
    return errorPatterns.notFound(res, {
      message: `${target_type} not found`,
    });
  }

  // Check if already liked
  const existingLike = await Like.findOne({
    user_id,
    target_type,
    target_id,
  });

  if (existingLike) {
    return errorPatterns.conflict(res, {
      message: `You have already liked this ${target_type.toLowerCase()}`,
    });
  }

  // Create like
  const like = await Like.create({
    user_id,
    target_type,
    target_id,
  });

  return successPatterns.created(res, {
    message: `${target_type} liked successfully`,
    data: like,
  });
});

/**
 * @desc    Unlike any content type (post, comment, review)
 * @route   DELETE /api/likes
 * @access  Private
 */
export const unlikeContent = asyncHandler(async (req, res) => {
  const { target_type, target_id } = req.body;
  const user_id = req.user._id;

  logger.logInfo(NAMESPACE, `Unliking ${target_type} with ID: ${target_id}`);

  const like = await Like.findOneAndDelete({
    user_id,
    target_type,
    target_id,
  });

  if (!like) {
    return errorPatterns.notFound(res, {
      message: `Like not found for this ${target_type.toLowerCase()}`,
    });
  }

  return successPatterns.deleted(res, {
    message: `${target_type} unliked successfully`,
  });
});

/**
 * @desc    Get likes for specific content
 * @route   GET /api/likes/content/:type/:id
 * @access  Public
 */
export const getLikes = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Getting likes for ${type} with ID: ${id}`);

  const skip = (page - 1) * limit;

  const likes = await Like.find({
    target_type: type,
    target_id: id,
  })
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Like.countDocuments({
    target_type: type,
    target_id: id,
  });

  return successPatterns.retrieved(res, {
    data: likes,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get user's liked content
 * @route   GET /api/likes/user/:userId
 * @access  Private
 */
export const getUserLikes = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Getting likes for user: ${userId}`);

  const skip = (page - 1) * limit;

  const likes = await Like.find({ user_id: userId })
    .populate("target_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Like.countDocuments({ user_id: userId });

  return successPatterns.retrieved(res, {
    data: likes,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get likes by content type
 * @route   GET /api/likes/type/:type
 * @access  Public
 */
export const getLikesByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Getting likes for content type: ${type}`);

  const skip = (page - 1) * limit;

  const likes = await Like.find({ target_type: type })
    .populate("user_id", "username photo")
    .populate("target_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Like.countDocuments({ target_type: type });

  return successPatterns.retrieved(res, {
    data: likes,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get all content liked by a user
 * @route   GET /api/likes/user/:userId/content
 * @access  Private
 */
export const getLikedContent = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { type, page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Getting liked content for user: ${userId}`);

  const skip = (page - 1) * limit;

  const query = { user_id: userId };
  if (type) {
    query.target_type = type;
  }

  const likes = await Like.find(query)
    .populate({
      path: "target_id",
      populate: {
        path: "user_id",
        select: "username photo",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Like.countDocuments(query);

  return successPatterns.retrieved(res, {
    data: likes,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
