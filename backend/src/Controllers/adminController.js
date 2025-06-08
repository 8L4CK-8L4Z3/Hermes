import User from "../Models/User.js";
import Analytics from "../Models/Analytics.js";
import ModerationLog from "../Models/ModerationLog.js";
import Review from "../Models/Review.js";
import Post from "../Models/Post.js";
import Comment from "../Models/Comment.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "AdminController";

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
export const getStats = asyncHandler(async (req, res) => {
  logger.logInfo(NAMESPACE, "Fetching admin dashboard stats");

  const today = new Date();
  const lastMonth = new Date(today.setMonth(today.getMonth() - 1));

  const stats = {
    users: {
      total: await User.countDocuments(),
      new: await User.countDocuments({ createdAt: { $gte: lastMonth } }),
      verified: await User.countDocuments({ isVerified: true }),
    },
    content: {
      reviews: await Review.countDocuments(),
      posts: await Post.countDocuments(),
      comments: await Comment.countDocuments(),
    },
    moderation: {
      pendingReports: await ModerationLog.countDocuments({ status: "pending" }),
      resolvedReports: await ModerationLog.countDocuments({
        status: "resolved",
      }),
    },
  };

  return successPatterns.retrieved(res, { data: stats });
});

/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  const role = req.query.role;
  const isVerified = req.query.isVerified;

  logger.logInfo(NAMESPACE, "Fetching users list");

  let query = {};

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role === "admin") query.isAdmin = true;
  if (role === "mod") query.isMod = true;
  if (isVerified !== undefined) query.isVerified = isVerified === "true";

  const users = await User.find(query)
    .select("-password_hash")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  return successPatterns.retrieved(res, {
    data: users,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Update user role (admin/moderator)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { isAdmin, isMod } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  // Prevent removing the last admin
  if (user.isAdmin && isAdmin === false) {
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1) {
      return errorPatterns.conflict(res, {
        message: "Cannot remove the last admin user",
      });
    }
  }

  user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
  user.isMod = isMod !== undefined ? isMod : user.isMod;
  await user.save();

  logger.logInfo(NAMESPACE, `Updated role for user: ${user._id}`);
  return successPatterns.updated(res, {
    data: { isAdmin: user.isAdmin, isMod: user.isMod },
  });
});

/**
 * @desc    Ban a user
 * @route   PUT /api/admin/users/:id/ban
 * @access  Private (Admin)
 */
export const banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  // Prevent banning admins
  if (user.isAdmin) {
    return errorPatterns.forbidden(res, {
      message: "Cannot ban an admin user",
    });
  }

  user.isBanned = true;
  user.banReason = reason;
  await user.save();

  // Log the moderation action
  await ModerationLog.create({
    moderator_id: req.user._id,
    action: "ban_user",
    target_type: "user",
    target_id: user._id,
    reason,
  });

  logger.logInfo(NAMESPACE, `Banned user: ${user._id}`);
  return successPatterns.updated(res, {
    message: "User banned successfully",
  });
});

/**
 * @desc    Unban a user
 * @route   PUT /api/admin/users/:id/unban
 * @access  Private (Admin)
 */
export const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return errorPatterns.notFound(res, { message: "User not found" });
  }

  user.isBanned = false;
  user.banReason = undefined;
  await user.save();

  // Log the moderation action
  await ModerationLog.create({
    moderator_id: req.user._id,
    action: "unban_user",
    target_type: "user",
    target_id: user._id,
    reason: "User unbanned",
  });

  logger.logInfo(NAMESPACE, `Unbanned user: ${user._id}`);
  return successPatterns.updated(res, {
    message: "User unbanned successfully",
  });
});

/**
 * @desc    Get moderation logs with pagination and filters
 * @route   GET /api/admin/moderation-logs
 * @access  Private (Admin)
 */
export const getModerationLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const action = req.query.action;
  const targetType = req.query.targetType;

  logger.logInfo(NAMESPACE, "Fetching moderation logs");

  let query = {};
  if (action) query.action = action;
  if (targetType) query.target_type = targetType;

  const logs = await ModerationLog.find(query)
    .populate("moderator_id", "username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ModerationLog.countDocuments(query);

  return successPatterns.retrieved(res, {
    data: logs,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get platform analytics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  logger.logInfo(NAMESPACE, "Fetching platform analytics");

  const analytics = await Analytics.find({
    date: {
      $gte: start,
      $lte: end,
    },
  }).sort({ date: 1 });

  const aggregatedData = {
    userGrowth: analytics.map((day) => ({
      date: day.date,
      newUsers: day.metrics.newUsers,
      activeUsers: day.metrics.activeUsers,
    })),
    contentCreation: analytics.map((day) => ({
      date: day.date,
      newTrips: day.metrics.newTrips,
      newReviews: day.metrics.newReviews,
      newPosts: day.metrics.newPosts,
    })),
    engagement: analytics.map((day) => ({
      date: day.date,
      totalLikes: day.metrics.totalLikes,
      totalComments: day.metrics.totalComments,
    })),
    popularDestinations: analytics
      .flatMap((day) => day.popularDestinations)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    popularPlaces: analytics
      .flatMap((day) => day.popularPlaces)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
  };

  return successPatterns.retrieved(res, {
    data: aggregatedData,
    meta: { startDate: start, endDate: end },
  });
});

/**
 * @desc    Get reported content with pagination and filters
 * @route   GET /api/admin/reported-content
 * @access  Private (Admin)
 */
export const getReportedContent = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status || "pending";
  const contentType = req.query.contentType;

  logger.logInfo(NAMESPACE, "Fetching reported content");

  let query = { status };
  if (contentType) query.target_type = contentType;

  const reports = await ModerationLog.find(query)
    .populate("moderator_id", "username")
    .populate("target_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ModerationLog.countDocuments(query);

  return successPatterns.retrieved(res, {
    data: reports,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Moderate reported content
 * @route   PUT /api/admin/reported-content/:id
 * @access  Private (Admin)
 */
export const moderateContent = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const report = await ModerationLog.findById(req.params.id).populate(
    "target_id"
  );

  if (!report) {
    return errorPatterns.notFound(res, { message: "Report not found" });
  }

  report.status = "resolved";
  report.resolution = {
    action,
    reason,
    moderator_id: req.user._id,
    date: new Date(),
  };

  // Handle content based on action
  if (action === "remove") {
    switch (report.target_type) {
      case "review":
        await Review.findByIdAndDelete(report.target_id);
        break;
      case "post":
        await Post.findByIdAndDelete(report.target_id);
        break;
      case "comment":
        await Comment.findByIdAndDelete(report.target_id);
        break;
    }
  }

  await report.save();

  logger.logInfo(NAMESPACE, `Moderated content: ${report._id}`);
  return successPatterns.updated(res, {
    message: "Content moderated successfully",
  });
});
