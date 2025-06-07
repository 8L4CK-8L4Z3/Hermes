import User from "../Models/User.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  HTTP_STATUS,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "UserController";

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile/:id
 * @access  Public
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password_hash");

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  logger.logInfo(NAMESPACE, `Profile retrieved for user: ${user._id}`);
  return successPatterns.retrieved(res, { data: user });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { username, email, bio, photo } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  if (username) user.username = username;
  if (email) user.email = email;
  if (bio !== undefined) user.bio = bio;
  if (photo) user.photo = photo;

  const updatedUser = await user.save();
  logger.logInfo(NAMESPACE, `Profile updated for user: ${user._id}`);
  return successPatterns.updated(res, { data: updatedUser });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/profile
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  await user.deleteOne();
  logger.logInfo(NAMESPACE, `Account deleted for user: ${user._id}`);
  return successPatterns.deleted(res, {
    message: "Account deleted successfully",
  });
});

/**
 * @desc    Get user's followers
 * @route   GET /api/users/:id/followers
 * @access  Public
 */
export const getFollowers = asyncHandler(async (req, res) => {
  const followers = await User.find({ following: req.params.id }).select(
    "username photo bio"
  );

  logger.logInfo(NAMESPACE, `Followers retrieved for user: ${req.params.id}`);
  return successPatterns.retrieved(res, { data: followers });
});

/**
 * @desc    Get users being followed
 * @route   GET /api/users/:id/following
 * @access  Public
 */
export const getFollowing = asyncHandler(async (req, res) => {
  const following = await User.find({ followers: req.params.id }).select(
    "username photo bio"
  );

  logger.logInfo(
    NAMESPACE,
    `Following list retrieved for user: ${req.params.id}`
  );
  return successPatterns.retrieved(res, { data: following });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/:id/stats
 * @access  Public
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("stats");

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  logger.logInfo(NAMESPACE, `Stats retrieved for user: ${user._id}`);
  return successPatterns.retrieved(res, { data: user.stats });
});

/**
 * @desc    Update user preferences
 * @route   PUT /api/users/preferences
 * @access  Private
 */
export const updatePreferences = asyncHandler(async (req, res) => {
  const { language, notifications } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  if (language) user.preferences.language = language;
  if (notifications) {
    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...notifications,
    };
  }

  const updatedUser = await user.save();
  logger.logInfo(NAMESPACE, `Preferences updated for user: ${user._id}`);
  return successPatterns.updated(res, { data: updatedUser.preferences });
});

/**
 * @desc    Update last login timestamp
 * @route   PUT /api/users/last-login
 * @access  Private
 */
export const updateLastLogin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  user.lastLogin = new Date();
  await user.save();

  logger.logInfo(NAMESPACE, `Last login updated for user: ${user._id}`);
  return successPatterns.updated(res, {
    message: "Last login updated successfully",
  });
});

/**
 * @desc    Get user's recent activity
 * @route   GET /api/users/:id/activity
 * @access  Public
 */
export const getUserActivity = asyncHandler(async (req, res) => {
  // This would typically aggregate recent posts, reviews, trips, etc.
  // Implementation depends on your specific activity tracking needs
  logger.logInfo(NAMESPACE, `Activity retrieved for user: ${req.params.id}`);
  return successPatterns.retrieved(res, { data: [] });
});

/**
 * @desc    Update user profile photo
 * @route   PUT /api/users/photo
 * @access  Private
 */
export const updateUserPhoto = asyncHandler(async (req, res) => {
  const { photo } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  user.photo = photo;
  const updatedUser = await user.save();

  logger.logInfo(NAMESPACE, `Photo updated for user: ${user._id}`);
  return successPatterns.updated(res, { data: { photo: updatedUser.photo } });
});

/**
 * @desc    Update user statistics
 * @route   PUT /api/users/stats
 * @access  Private
 */
export const updateUserStats = asyncHandler(async (req, res) => {
  const { stats } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  user.stats = {
    ...user.stats,
    ...stats,
  };

  const updatedUser = await user.save();
  logger.logInfo(NAMESPACE, `Stats updated for user: ${user._id}`);
  return successPatterns.updated(res, { data: updatedUser.stats });
});

/**
 * @desc    Get user preferences
 * @route   GET /api/users/preferences
 * @access  Private
 */
export const getUserPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("preferences");

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  logger.logInfo(NAMESPACE, `Preferences retrieved for user: ${user._id}`);
  return successPatterns.retrieved(res, { data: user.preferences });
});

/**
 * @desc    Update user verification status
 * @route   PUT /api/users/:id/verify
 * @access  Admin
 */
export const verifyUser = asyncHandler(async (req, res) => {
  const { isVerified } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  user.isVerified = isVerified;
  const updatedUser = await user.save();

  logger.logInfo(
    NAMESPACE,
    `Verification status updated for user: ${user._id}`
  );
  return successPatterns.updated(res, {
    data: { isVerified: updatedUser.isVerified },
  });
});
