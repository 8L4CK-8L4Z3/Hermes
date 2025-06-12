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

  if (user.isBanned) {
    return errorPatterns.conflict(res, {
      message: "User is already banned",
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

  if (!user.isBanned) {
    return errorPatterns.conflict(res, {
      message: "User is not banned",
    });
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
  try {
    // Default to last 30 days if no dates provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date(
      defaultEndDate.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    // Get dates from request body or use defaults
    const startDate = req.body.startDate
      ? new Date(req.body.startDate)
      : defaultStartDate;
    const endDate = req.body.endDate
      ? new Date(req.body.endDate)
      : defaultEndDate;

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      logger.logError(NAMESPACE, "Invalid date format provided");
      return errorPatterns.badRequest(res, {
        message: "Invalid date format provided",
      });
    }

    logger.logInfo(
      NAMESPACE,
      `Fetching platform analytics from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const analytics = await Analytics.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    logger.logInfo(NAMESPACE, `Found ${analytics.length} analytics records`);

    // Handle case where no analytics data exists
    if (!analytics || analytics.length === 0) {
      logger.logInfo(
        NAMESPACE,
        "No analytics data found for the specified period"
      );
      return successPatterns.retrieved(res, {
        data: {
          userGrowth: [],
          contentCreation: [],
          engagement: [],
          popularDestinations: [],
          popularPlaces: [],
        },
        meta: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          recordsFound: 0,
        },
      });
    }

    const aggregatedData = {
      userGrowth: analytics.map((day) => ({
        date: day.date,
        newUsers: day.metrics?.newUsers || 0,
        activeUsers: day.metrics?.activeUsers || 0,
      })),
      contentCreation: analytics.map((day) => ({
        date: day.date,
        newTrips: day.metrics?.newTrips || 0,
        newReviews: day.metrics?.newReviews || 0,
        newPosts: day.metrics?.newPosts || 0,
      })),
      engagement: analytics.map((day) => ({
        date: day.date,
        totalLikes: day.metrics?.totalLikes || 0,
        totalComments: day.metrics?.totalComments || 0,
      })),
      popularDestinations: analytics
        .flatMap((day) => day.popularDestinations || [])
        .filter((dest) => dest && dest.destination_id) // Filter out null/undefined/invalid entries
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 10),
      popularPlaces: analytics
        .flatMap((day) => day.popularPlaces || [])
        .filter((place) => place && place.place_id) // Filter out null/undefined/invalid entries
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 10),
    };

    logger.logInfo(NAMESPACE, "Successfully aggregated analytics data");

    return successPatterns.retrieved(res, {
      data: aggregatedData,
      meta: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        recordsFound: analytics.length,
      },
    });
  } catch (error) {
    logger.logError(NAMESPACE, `Error in getAnalytics: ${error.message}`);
    logger.logError(NAMESPACE, error.stack);
    throw error;
  }
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

  try {
    // First get the reports with moderator info
    const reports = await ModerationLog.find(query)
      .populate("moderator_id", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Then populate the target content based on type
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        try {
          let targetModel;
          let userField;
          switch (report.target_type) {
            case "review":
              targetModel = Review;
              userField = "user_id";
              break;
            case "post":
              targetModel = Post;
              userField = "user_id";
              break;
            case "comment":
              targetModel = Comment;
              userField = "user_id";
              break;
            case "user":
              // For user type, we don't need to populate user info since the target is the user
              const user = await User.findById(report.target_id)
                .select("username email photo")
                .lean();
              if (!user) {
                return {
                  ...report,
                  target_content_status: "deleted",
                };
              }
              return {
                ...report,
                target_content: user,
                target_content_status: "active",
              };
            default:
              return {
                ...report,
                target_content_status: "error",
                error: "Invalid target type",
              };
          }

          if (targetModel) {
            const targetContent = await targetModel
              .findById(report.target_id)
              .populate(userField, "username email photo")
              .lean();

            if (!targetContent) {
              return {
                ...report,
                target_content_status: "deleted",
              };
            }

            return {
              ...report,
              target_content: targetContent,
              target_content_status: "active",
            };
          }

          return report;
        } catch (error) {
          logger.logError(
            NAMESPACE,
            `Error populating target content for report ${report._id}:`,
            error
          );
          return {
            ...report,
            target_content_status: "error",
            error: "Failed to load target content",
          };
        }
      })
    );

    const total = await ModerationLog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Validate page number
    if (page > totalPages && total > 0) {
      return successPatterns.retrieved(res, {
        data: [],
        meta: {
          page,
          limit,
          total,
          pages: totalPages,
        },
      });
    }

    return successPatterns.retrieved(res, {
      data: populatedReports,
      meta: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    logger.logError(NAMESPACE, "Error fetching reported content:", error);
    return errorPatterns.serverError(res, {
      message: "Error fetching reported content",
      details: error.message,
    });
  }
});

/**
 * @desc    Moderate reported content
 * @route   PUT /api/admin/reported-content/:id
 * @access  Private (Admin)
 */
export const moderateContent = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;

  logger.logInfo(
    NAMESPACE,
    `Moderating content with ID: ${req.params.id}, action: ${action}`
  );

  try {
    // Find the report without population first
    const report = await ModerationLog.findById(req.params.id);

    if (!report) {
      return errorPatterns.notFound(res, { message: "Report not found" });
    }

    logger.logInfo(
      NAMESPACE,
      `Found report with target_type: ${report.target_type}, target_id: ${report.target_id}`
    );

    if (report.status === "resolved") {
      return errorPatterns.conflict(res, {
        message: "Report is already resolved",
      });
    }

    // Update report status and resolution
    report.status = "resolved";
    report.resolution = {
      action,
      note: reason, // Using reason as the resolution note
      moderator_id: req.user._id,
      date: new Date(),
    };

    // Handle content based on action
    if (action === "remove") {
      let Model;
      switch (report.target_type) {
        case "review":
          Model = Review;
          break;
        case "post":
          Model = Post;
          break;
        case "comment":
          Model = Comment;
          break;
        default:
          return errorPatterns.validationError(res, {
            message: "Invalid target type",
            error: { target_type: report.target_type },
          });
      }

      logger.logInfo(
        NAMESPACE,
        `Attempting to delete ${report.target_type} with ID: ${report.target_id}`
      );

      try {
        const contentExists = await Model.findById(report.target_id);
        if (contentExists) {
          await Model.findByIdAndDelete(report.target_id);
          logger.logInfo(
            NAMESPACE,
            `Successfully deleted ${report.target_type} with ID: ${report.target_id}`
          );
        } else {
          logger.logInfo(
            NAMESPACE,
            `${report.target_type} with ID: ${report.target_id} already deleted`
          );
        }
      } catch (deleteError) {
        logger.logError(
          NAMESPACE,
          `Error deleting content: ${deleteError.message}`
        );
        logger.logError(NAMESPACE, `Stack trace: ${deleteError.stack}`);
        return errorPatterns.internalError(res, {
          message: "Error deleting reported content",
          error: {
            message: deleteError.message,
            details: {
              target_type: report.target_type,
              target_id: report.target_id,
            },
          },
        });
      }
    }

    // Save the report changes
    try {
      await report.save();
      logger.logInfo(
        NAMESPACE,
        `Successfully moderated content: ${report._id}`
      );
      return successPatterns.updated(res, {
        message: "Content moderated successfully",
        data: report,
      });
    } catch (saveError) {
      logger.logError(NAMESPACE, `Error saving report: ${saveError.message}`);
      logger.logError(NAMESPACE, `Stack trace: ${saveError.stack}`);
      return errorPatterns.internalError(res, {
        message: "Error saving moderation changes",
        error: {
          message: saveError.message,
        },
      });
    }
  } catch (error) {
    logger.logError(NAMESPACE, `Error in moderation process: ${error.message}`);
    logger.logError(NAMESPACE, `Stack trace: ${error.stack}`);
    return errorPatterns.internalError(res, {
      message: "Error moderating content",
      error: {
        message: error.message,
        details: error.stack,
      },
    });
  }
});
