import User from "../Models/User.js";
import Follow from "../Models/Follow.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "FollowController";

/**
 * @desc    Follow a user
 * @route   POST /api/follow/:userId
 * @access  Private
 */
export const followUser = asyncHandler(async (req, res) => {
  const followerId = req.user.id;
  const userId = req.params.userId;

  logger.logInfo(
    NAMESPACE,
    `Attempting to follow user: ${userId} by user: ${followerId}`
  );

  // Check if trying to follow self
  if (followerId === userId) {
    logger.logWarn(
      NAMESPACE,
      `User ${followerId} attempted to follow themselves`
    );
    return errorPatterns.validationError(res, {
      message: "You cannot follow yourself",
    });
  }

  // Check if target user exists
  const userToFollow = await User.findById(userId);
  if (!userToFollow) {
    logger.logWarn(
      NAMESPACE,
      `Target user ${userId} not found for follow request`
    );
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  // Check if already following
  const existingFollow = await Follow.findOne({
    user_id: userId,
    follower_id: followerId,
  });

  if (existingFollow) {
    logger.logWarn(
      NAMESPACE,
      `User ${followerId} already follows user ${userId}`
    );
    return errorPatterns.conflict(res, {
      message: "You are already following this user",
    });
  }

  try {
    // Create follow relationship
    await Follow.create({
      user_id: userId,
      follower_id: followerId,
    });

    // Update user stats
    await Promise.all([
      User.findByIdAndUpdate(userId, { $inc: { "stats.followersCount": 1 } }),
      User.findByIdAndUpdate(followerId, {
        $inc: { "stats.followingCount": 1 },
      }),
    ]);

    logger.logInfo(
      NAMESPACE,
      `User ${followerId} successfully followed user ${userId}`
    );
    return successPatterns.created(res, {
      message: "Successfully followed user",
    });
  } catch (error) {
    logger.logError(NAMESPACE, `Error following user: ${userId}`, error);
    throw error;
  }
});

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/follow/:userId
 * @access  Private
 */
export const unfollowUser = asyncHandler(async (req, res) => {
  const followerId = req.user.id;
  const userId = req.params.userId;

  logger.logInfo(
    NAMESPACE,
    `Attempting to unfollow user: ${userId} by user: ${followerId}`
  );

  // Check if trying to unfollow self
  if (followerId === userId) {
    logger.logWarn(
      NAMESPACE,
      `User ${followerId} attempted to unfollow themselves`
    );
    return errorPatterns.validationError(res, {
      message: "You cannot unfollow yourself",
    });
  }

  try {
    // Check if follow relationship exists
    const follow = await Follow.findOne({
      user_id: userId,
      follower_id: followerId,
    });

    if (!follow) {
      logger.logWarn(
        NAMESPACE,
        `Follow relationship not found between users ${followerId} and ${userId}`
      );
      return errorPatterns.notFound(res, {
        message: "You are not following this user",
      });
    }

    // Remove follow relationship
    await follow.deleteOne();

    // Update user stats
    await Promise.all([
      User.findByIdAndUpdate(userId, { $inc: { "stats.followersCount": -1 } }),
      User.findByIdAndUpdate(followerId, {
        $inc: { "stats.followingCount": -1 },
      }),
    ]);

    logger.logInfo(
      NAMESPACE,
      `User ${followerId} successfully unfollowed user ${userId}`
    );
    return successPatterns.deleted(res, {
      message: "Successfully unfollowed user",
    });
  } catch (error) {
    logger.logError(NAMESPACE, `Error unfollowing user: ${userId}`, error);
    throw error;
  }
});

/**
 * @desc    Get user's followers
 * @route   GET /api/follow/:userId/followers
 * @access  Public
 */
export const getFollowers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.params.userId;

  logger.logInfo(
    NAMESPACE,
    `Retrieving followers for user: ${userId}, page: ${page}, limit: ${limit}`
  );

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      logger.logWarn(
        NAMESPACE,
        `User ${userId} not found when retrieving followers`
      );
      return errorPatterns.notFound(res, { message: "User not found" });
    }

    const [followers, total] = await Promise.all([
      Follow.find({ user_id: userId })
        .populate("follower_id", "username photo bio stats")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Follow.countDocuments({ user_id: userId }),
    ]);

    logger.logInfo(
      NAMESPACE,
      `Successfully retrieved ${followers.length} followers for user: ${userId}`
    );
    return successPatterns.retrieved(res, {
      data: followers.map((f) => f.follower_id),
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.logError(
      NAMESPACE,
      `Error retrieving followers for user: ${userId}`,
      error
    );
    throw error;
  }
});

/**
 * @desc    Get users being followed
 * @route   GET /api/follow/:userId/following
 * @access  Public
 */
export const getFollowing = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.params.userId;

  logger.logInfo(
    NAMESPACE,
    `Retrieving following list for user: ${userId}, page: ${page}, limit: ${limit}`
  );

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      logger.logWarn(
        NAMESPACE,
        `User ${userId} not found when retrieving following list`
      );
      return errorPatterns.notFound(res, { message: "User not found" });
    }

    const [following, total] = await Promise.all([
      Follow.find({ follower_id: userId })
        .populate("user_id", "username photo bio stats")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Follow.countDocuments({ follower_id: userId }),
    ]);

    logger.logInfo(
      NAMESPACE,
      `Successfully retrieved ${following.length} following users for user: ${userId}`
    );
    return successPatterns.retrieved(res, {
      data: following.map((f) => f.user_id),
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.logError(
      NAMESPACE,
      `Error retrieving following list for user: ${userId}`,
      error
    );
    throw error;
  }
});

/**
 * @desc    Get follow suggestions
 * @route   GET /api/follow/suggestions
 * @access  Private
 */
export const getFollowSuggestions = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const userId = req.user.id;

  logger.logInfo(
    NAMESPACE,
    `Generating follow suggestions for user: ${userId}, limit: ${limit}`
  );

  try {
    // Get users the current user is following
    const following = await Follow.find({ follower_id: userId }).select(
      "user_id"
    );
    const followingIds = following.map((f) => f.user_id);

    // Get users followed by users the current user is following (mutual connections)
    const mutualConnections = await Follow.find({
      follower_id: { $in: followingIds },
      user_id: { $nin: [...followingIds, userId] },
    })
      .populate("user_id", "username photo bio stats")
      .limit(parseInt(limit));

    // If not enough mutual connections, add some active users
    const suggestedUsers = mutualConnections.map((f) => f.user_id);
    if (suggestedUsers.length < limit) {
      const remainingLimit = parseInt(limit) - suggestedUsers.length;
      const activeUsers = await User.find({
        _id: {
          $nin: [...followingIds, userId, ...suggestedUsers.map((u) => u._id)],
        },
      })
        .sort({ "stats.followersCount": -1 })
        .limit(remainingLimit)
        .select("username photo bio stats");
      suggestedUsers.push(...activeUsers);
    }

    logger.logInfo(
      NAMESPACE,
      `Successfully generated ${suggestedUsers.length} follow suggestions for user: ${userId}`
    );
    return successPatterns.retrieved(res, {
      data: suggestedUsers,
    });
  } catch (error) {
    logger.logError(
      NAMESPACE,
      `Error generating follow suggestions for user: ${userId}`,
      error
    );
    throw error;
  }
});

/**
 * @desc    Get follow statistics
 * @route   GET /api/follow/:userId/stats
 * @access  Public
 */
export const getFollowStats = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  logger.logInfo(NAMESPACE, `Retrieving follow statistics for user: ${userId}`);

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      logger.logWarn(
        NAMESPACE,
        `User ${userId} not found when retrieving follow stats`
      );
      return errorPatterns.notFound(res, { message: "User not found" });
    }

    const stats = {
      followersCount: user.stats.followersCount,
      followingCount: user.stats.followingCount,
    };

    logger.logInfo(
      NAMESPACE,
      `Successfully retrieved follow stats for user: ${userId}`
    );
    return successPatterns.retrieved(res, {
      data: stats,
    });
  } catch (error) {
    logger.logError(
      NAMESPACE,
      `Error retrieving follow stats for user: ${userId}`,
      error
    );
    throw error;
  }
});

/**
 * @desc    Get mutual followers
 * @route   GET /api/follow/:userId/mutual
 * @access  Private
 */
export const getMutualFollowers = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const userId = req.params.userId;

  logger.logInfo(
    NAMESPACE,
    `Retrieving mutual followers between users: ${currentUserId} and ${userId}`
  );

  if (currentUserId === userId) {
    logger.logWarn(
      NAMESPACE,
      `User ${currentUserId} attempted to get mutual followers with themselves`
    );
    return errorPatterns.validationError(res, {
      message: "Cannot get mutual followers with yourself",
    });
  }

  try {
    // Get followers of both users
    const [userFollowers, currentUserFollowers] = await Promise.all([
      Follow.find({ user_id: userId }).select("follower_id"),
      Follow.find({ user_id: currentUserId }).select("follower_id"),
    ]);

    const userFollowerIds = userFollowers.map((f) => f.follower_id.toString());
    const currentUserFollowerIds = currentUserFollowers.map((f) =>
      f.follower_id.toString()
    );

    // Find mutual followers
    const mutualFollowerIds = userFollowerIds.filter((id) =>
      currentUserFollowerIds.includes(id)
    );

    // Get mutual followers' details
    const mutualFollowers = await User.find({
      _id: { $in: mutualFollowerIds },
    }).select("username photo bio stats");

    logger.logInfo(
      NAMESPACE,
      `Successfully retrieved ${mutualFollowers.length} mutual followers between users: ${currentUserId} and ${userId}`
    );
    return successPatterns.retrieved(res, {
      data: mutualFollowers,
    });
  } catch (error) {
    logger.logError(
      NAMESPACE,
      `Error retrieving mutual followers between users: ${currentUserId} and ${userId}`,
      error
    );
    throw error;
  }
});
