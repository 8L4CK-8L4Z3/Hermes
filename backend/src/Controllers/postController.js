import Post from "../Models/Post.js";
import User from "../Models/User.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  HTTP_STATUS,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "PostController";

const notFoundError = errorPatterns.notFound;
/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req, res) => {
  const { content, media, type, visibility, tags, location } = req.body;
  const user_id = req.user.id;

  const post = await Post.create({
    user_id,
    content,
    media,
    type,
    visibility,
    tags,
    location,
  });

  logger.logInfo(NAMESPACE, `New post created by user ${user_id}`);
  return successPatterns.created(res, { data: post });
});

/**
 * @desc    Get post details
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate("user_id", "username photo");

  if (!post) {
    return errorPatterns.notFound(res, { message: "Post not found" });
  }

  return successPatterns.ok(res, { data: post });
});

/**
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const user_id = req.user.id;

  const post = await Post.findOne({ _id: id, user_id });

  if (!post) {
    return errorPatterns.notFound(res, {
      message: "Post not found or unauthorized",
    });
  }

  Object.assign(post, updates);
  await post.save();

  logger.logInfo(NAMESPACE, `Post ${id} updated by user ${user_id}`);
  return successPatterns.ok(res, { data: post });
});

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const post = await Post.findOneAndDelete({ _id: id, user_id });

  if (!post) {
    return errorPatterns.notFound(res, {
      message: "Post not found or unauthorized",
    });
  }

  logger.logInfo(NAMESPACE, `Post ${id} deleted by user ${user_id}`);
  return successPatterns.deleted(res, { message: "Post deleted successfully" });
});

/**
 * @desc    Get social feed
 * @route   GET /api/posts/feed
 * @access  Private
 */
export const getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const user_id = req.user.id;

  // Get user's following list
  const user = await User.findById(user_id);
  const following = user.following || [];

  // Get posts from followed users and public posts
  const posts = await Post.find({
    $or: [
      {
        user_id: { $in: following },
        visibility: { $in: ["public", "followers"] },
      },
      { visibility: "public" },
    ],
  })
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Post.countDocuments({
    $or: [
      {
        user_id: { $in: following },
        visibility: { $in: ["public", "followers"] },
      },
      { visibility: "public" },
    ],
  });

  return successPatterns.ok(res, {
    data: posts,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
    },
  });
});

/**
 * @desc    Get posts by a user
 * @route   GET /api/posts/user/:userId
 * @access  Public
 */
export const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const requestingUser = req.user.id;

  let visibilityFilter = { visibility: "public" };

  // If requesting own posts or following the user, include followers-only posts
  if (userId === requestingUser) {
    visibilityFilter = {}; // Show all posts
  } else {
    const isFollowing = await User.exists({
      _id: userId,
      followers: requestingUser,
    });
    if (isFollowing) {
      visibilityFilter = { visibility: { $in: ["public", "followers"] } };
    }
  }

  const posts = await Post.find({
    user_id: userId,
    ...visibilityFilter,
  })
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Post.countDocuments({
    user_id: userId,
    ...visibilityFilter,
  });

  return successPatterns.ok(res, {
    data: posts,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
    },
  });
});

/**
 * @desc    Update post visibility
 * @route   PATCH /api/posts/:id/visibility
 * @access  Private
 */
export const updatePostVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { visibility } = req.body;
  const user_id = req.user.id;

  const post = await Post.findOne({ _id: id, user_id });

  if (!post) {
    return errorPatterns.notFound(res, {
      message: "Post not found or unauthorized",
    });
  }

  post.visibility = visibility;
  await post.save();

  logger.logInfo(NAMESPACE, `Post ${id} visibility updated to ${visibility}`);
  return successPatterns.ok(res, { data: post });
});

/**
 * @desc    Update post type
 * @route   PATCH /api/posts/:id/type
 * @access  Private
 */
export const updatePostType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const user_id = req.user.id;

  const post = await Post.findOne({ _id: id, user_id });

  if (!post) {
    return errorPatterns.notFound(res, {
      message: "Post not found or unauthorized",
    });
  }

  post.type = type;
  await post.save();

  logger.logInfo(NAMESPACE, `Post ${id} type updated to ${type}`);
  return successPatterns.ok(res, { data: post });
});

/**
 * @desc    Update post location
 * @route   PATCH /api/posts/:id/location
 * @access  Private
 */
export const updatePostLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { location } = req.body;
  const user_id = req.user.id;

  const post = await Post.findOne({ _id: id, user_id });

  if (!post) {
    return errorPatterns.notFound(res, {
      message: "Post not found or unauthorized",
    });
  }

  post.location = location;
  await post.save();

  logger.logInfo(NAMESPACE, `Post ${id} location updated`);
  return successPatterns.ok(res, { data: post });
});

/**
 * @desc    Get posts by type
 * @route   GET /api/posts/type/:type
 * @access  Public
 */
export const getPostsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const user_id = req.user.id;

  const posts = await Post.find({
    type,
    $or: [
      { visibility: "public" },
      { user_id },
      {
        visibility: "followers",
        user_id: { $in: await getUserFollowing(user_id) },
      },
    ],
  })
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Post.countDocuments({ type });

  return successPatterns.ok(res, {
    data: posts,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
    },
  });
});

/**
 * @desc    Get posts by visibility
 * @route   GET /api/posts/visibility/:visibility
 * @access  Private
 */
export const getPostsByVisibility = asyncHandler(async (req, res) => {
  const { visibility } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const user_id = req.user.id;

  let query = { visibility };
  if (visibility === "followers") {
    query.user_id = { $in: await getUserFollowing(user_id) };
  }

  const posts = await Post.find(query)
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Post.countDocuments(query);

  return successPatterns.ok(res, {
    data: posts,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
    },
  });
});

/**
 * @desc    Get posts by location
 * @route   GET /api/posts/location
 * @access  Public
 */
export const getPostsByLocation = asyncHandler(async (req, res) => {
  const { longitude, latitude, radius = 10000 } = req.query; // radius in meters
  const { page = 1, limit = 10 } = req.query;

  const posts = await Post.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: radius,
      },
    },
    visibility: "public",
  })
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Post.countDocuments({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: radius,
      },
    },
    visibility: "public",
  });

  return successPatterns.ok(res, {
    data: posts,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
    },
  });
});

/**
 * @desc    Get posts by tags
 * @route   GET /api/posts/tags
 * @access  Public
 */
export const getPostsByTags = asyncHandler(async (req, res) => {
  const { tags } = req.query; // Comma-separated tags
  const { page = 1, limit = 10 } = req.query;
  const tagArray = tags.split(",").map((tag) => tag.trim());

  const posts = await Post.find({
    tags: { $in: tagArray },
    visibility: "public",
  })
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Post.countDocuments({
    tags: { $in: tagArray },
    visibility: "public",
  });

  return successPatterns.ok(res, {
    data: posts,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
    },
  });
});

/**
 * Helper function to get user's following list
 * @private
 */
const getUserFollowing = async (userId) => {
  const user = await User.findById(userId);
  return user.following || [];
};
