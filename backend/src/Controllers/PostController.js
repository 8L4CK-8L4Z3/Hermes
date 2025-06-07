import Post from "../Models/Post.js";
import User from "../Models/User.js";
import Like from "../Models/Like.js";
import { logger } from "../Utils/logger.js";
import {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
} from "../Utils/responses.js";

/**
 * Post Controller - Handles all post-related operations
 */
class PostController {
  /**
   * Create a new post
   */
  async createPost(req, res) {
    try {
      const { content, media, type, visibility, tags, location } = req.body;
      const user_id = req.user.id; // Assuming auth middleware sets user

      const post = await Post.create({
        user_id,
        content,
        media,
        type,
        visibility,
        tags,
        location,
      });

      logger.info(`New post created by user ${user_id}`);
      return successResponse(res, post, "Post created successfully");
    } catch (error) {
      logger.error("Error creating post:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get post details
   */
  async getPost(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id).populate(
        "user_id",
        "username photo"
      );

      if (!post) {
        return notFoundError(res, "Post not found");
      }

      return successResponse(res, post, "Post retrieved successfully");
    } catch (error) {
      logger.error("Error getting post:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Update post
   */
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user_id = req.user.id;

      const post = await Post.findOne({ _id: id, user_id });

      if (!post) {
        return notFoundError(res, "Post not found or unauthorized");
      }

      Object.assign(post, updates);
      await post.save();

      logger.info(`Post ${id} updated by user ${user_id}`);
      return successResponse(res, post, "Post updated successfully");
    } catch (error) {
      logger.error("Error updating post:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Delete post
   */
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const post = await Post.findOneAndDelete({ _id: id, user_id });

      if (!post) {
        return notFoundError(res, "Post not found or unauthorized");
      }

      logger.info(`Post ${id} deleted by user ${user_id}`);
      return successResponse(res, null, "Post deleted successfully");
    } catch (error) {
      logger.error("Error deleting post:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get social feed
   */
  async getFeed(req, res) {
    try {
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

      return successResponse(res, posts, "Feed retrieved successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      });
    } catch (error) {
      logger.error("Error getting feed:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get posts by a user
   */
  async getUserPosts(req, res) {
    try {
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

      return successResponse(res, posts, "User posts retrieved successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      });
    } catch (error) {
      logger.error("Error getting user posts:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Update post visibility
   */
  async updatePostVisibility(req, res) {
    try {
      const { id } = req.params;
      const { visibility } = req.body;
      const user_id = req.user.id;

      const post = await Post.findOne({ _id: id, user_id });

      if (!post) {
        return notFoundError(res, "Post not found or unauthorized");
      }

      post.visibility = visibility;
      await post.save();

      logger.info(`Post ${id} visibility updated to ${visibility}`);
      return successResponse(res, post, "Post visibility updated successfully");
    } catch (error) {
      logger.error("Error updating post visibility:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Update post type
   */
  async updatePostType(req, res) {
    try {
      const { id } = req.params;
      const { type } = req.body;
      const user_id = req.user.id;

      const post = await Post.findOne({ _id: id, user_id });

      if (!post) {
        return notFoundError(res, "Post not found or unauthorized");
      }

      post.type = type;
      await post.save();

      logger.info(`Post ${id} type updated to ${type}`);
      return successResponse(res, post, "Post type updated successfully");
    } catch (error) {
      logger.error("Error updating post type:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Update post location
   */
  async updatePostLocation(req, res) {
    try {
      const { id } = req.params;
      const { location } = req.body;
      const user_id = req.user.id;

      const post = await Post.findOne({ _id: id, user_id });

      if (!post) {
        return notFoundError(res, "Post not found or unauthorized");
      }

      post.location = location;
      await post.save();

      logger.info(`Post ${id} location updated`);
      return successResponse(res, post, "Post location updated successfully");
    } catch (error) {
      logger.error("Error updating post location:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get posts by type
   */
  async getPostsByType(req, res) {
    try {
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
            user_id: { $in: await this.getUserFollowing(user_id) },
          },
        ],
      })
        .populate("user_id", "username photo")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Post.countDocuments({ type });

      return successResponse(res, posts, "Posts retrieved successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      });
    } catch (error) {
      logger.error("Error getting posts by type:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get posts by visibility
   */
  async getPostsByVisibility(req, res) {
    try {
      const { visibility } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const user_id = req.user.id;

      let query = { visibility };
      if (visibility === "followers") {
        query.user_id = { $in: await this.getUserFollowing(user_id) };
      }

      const posts = await Post.find(query)
        .populate("user_id", "username photo")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Post.countDocuments(query);

      return successResponse(res, posts, "Posts retrieved successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      });
    } catch (error) {
      logger.error("Error getting posts by visibility:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get posts by location
   */
  async getPostsByLocation(req, res) {
    try {
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

      return successResponse(res, posts, "Posts retrieved successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      });
    } catch (error) {
      logger.error("Error getting posts by location:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get posts by tags
   */
  async getPostsByTags(req, res) {
    try {
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

      return successResponse(res, posts, "Posts retrieved successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      });
    } catch (error) {
      logger.error("Error getting posts by tags:", error);
      return errorResponse(res, error.message);
    }
  }

  /**
   * Helper method to get user's following list
   */
  async getUserFollowing(userId) {
    const user = await User.findById(userId);
    return user.following || [];
  }
}

export default new PostController();
