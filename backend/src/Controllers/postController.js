import Post from "../Models/Post.js";
import User from "../Models/User.js";
import Destination from "../Models/Destination.js";
import Place from "../Models/Place.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";
import mongoose from "mongoose";

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

  // Create post with default values where needed
  const post = await Post.create({
    user_id,
    content,
    media: media || [],
    type: type || "general",
    visibility: visibility || "public",
    tags: tags || [],
    location: location || null,
  });

  // Populate user details for the response
  await post.populate("user_id", "username photo");

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
  const post = await Post.findById(id)
    .populate("user_id", "username photo")
    .populate("liked_by", "username photo");

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

  logger.logInfo(NAMESPACE, "Feed request received", {
    query: req.query,
    auth: {
      isAuthenticated: !!req.user,
      userId: req.user?.id,
    },
  });

  if (!req.user || !req.user.id) {
    logger.logError(NAMESPACE, "User not authenticated", { user: req.user });
    return errorPatterns.unauthorized(res, {
      message: "User not authenticated",
      details: { user: req.user },
    });
  }

  const user_id = req.user.id;

  try {
    // Get user's following list
    logger.logInfo(NAMESPACE, "Fetching user data", { userId: user_id });
    const user = await User.findById(user_id);

    if (!user) {
      logger.logError(NAMESPACE, "User not found", { userId: user_id });
      return errorPatterns.notFound(res, {
        message: "User not found",
        details: { userId: user_id },
      });
    }

    logger.logInfo(NAMESPACE, "User found", {
      username: user.username,
      followingCount: user.following?.length || 0,
    });

    const following = user.following || [];

    // Build query
    const query = {
      $or: [
        {
          user_id: { $in: following },
          visibility: { $in: ["public", "followers"] },
        },
        { visibility: "public" },
      ],
    };

    logger.logInfo(NAMESPACE, "Executing posts query", {
      query: JSON.stringify(query),
      page,
      limit,
    });

    // Get posts with basic population
    let posts = await Post.find(query)
      .populate("user_id", "username name photo")
      .populate("liked_by", "username photo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Populate locations based on their type
    posts = await Promise.all(
      posts.map(async (post) => {
        if (post.location) {
          try {
            let locationModel =
              post.location.ref_type === "Destination" ? Destination : Place;
            const locationDoc = await locationModel
              .findById(post.location.ref_id)
              .select("name address")
              .lean();
            if (locationDoc) {
              post.location.ref_id = locationDoc;
            }
          } catch (error) {
            logger.logError(NAMESPACE, "Error populating location", {
              error,
              postId: post._id,
              locationType: post.location.ref_type,
              locationId: post.location.ref_id,
            });
          }
        }
        return post;
      })
    );

    logger.logInfo(NAMESPACE, "Posts retrieved", { count: posts?.length });

    if (!posts) {
      logger.logError(NAMESPACE, "Posts query returned null");
      return errorPatterns.internal(res, {
        message: "Failed to fetch posts",
        details: { query },
      });
    }

    // Add isLiked field and transform user_id to user
    const postsWithLikeStatus = posts.map((post) => {
      try {
        // Format location data
        let formattedLocation = null;
        if (post.location?.ref_id) {
          formattedLocation = {
            id: post.location.ref_id._id,
            name: post.location.ref_id.name,
            type: post.location.ref_type.toLowerCase(),
            address: post.location.ref_id.address,
          };
        }

        return {
          ...post,
          id: post._id,
          user: post.user_id,
          user_id: undefined,
          location: formattedLocation,
          media: post.media || [],
          tags: post.tags || [],
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          isLiked:
            post.liked_by?.some(
              (likedUser) => likedUser._id?.toString() === user_id?.toString()
            ) || false,
        };
      } catch (error) {
        logger.logError(NAMESPACE, "Error processing post data", {
          error,
          postId: post._id,
        });
        return {
          ...post,
          id: post._id,
          location: null,
          media: [],
          tags: [],
          likes: 0,
          comments: 0,
          isLiked: false,
        };
      }
    });

    // Get total count
    const total = await Post.countDocuments(query);

    logger.logInfo(NAMESPACE, "Feed request completed", {
      totalPosts: total,
      returnedPosts: posts.length,
      page,
      limit,
    });

    return successPatterns.retrieved(res, {
      data: postsWithLikeStatus,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        hasMore: total > page * limit,
      },
    });
  } catch (error) {
    logger.logError(NAMESPACE, "Error in getFeed", {
      error,
      stack: error.stack,
      query: req.query,
      userId: user_id,
    });
    throw error;
  }
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
 * @desc    Like/Unlike a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const post = await Post.findById(id);

  if (!post) {
    return errorPatterns.notFound(res, { message: "Post not found" });
  }

  const userLikedIndex = post.liked_by.indexOf(user_id);

  if (userLikedIndex === -1) {
    // Like the post
    post.liked_by.push(user_id);
    post.likes_count += 1;
  } else {
    // Unlike the post
    post.liked_by.splice(userLikedIndex, 1);
    post.likes_count -= 1;
  }

  await post.save();

  return successPatterns.ok(res, {
    data: {
      likes_count: post.likes_count,
      isLiked: userLikedIndex === -1,
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
