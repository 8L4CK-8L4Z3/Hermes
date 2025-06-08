import User from "../Models/User.js";
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

const NAMESPACE = "ModerationController";

/**
 * @desc    Report inappropriate content
 * @route   POST /api/moderation/report
 * @access  Private
 */
export const reportContent = asyncHandler(async (req, res) => {
  const { target_type, target_id, reason } = req.body;
  const user_id = req.user._id;

  logger.logInfo(NAMESPACE, `Reporting ${target_type} with ID: ${target_id}`);

  // Validate target exists
  let target;
  switch (target_type) {
    case "review":
      target = await Review.findById(target_id);
      break;
    case "post":
      target = await Post.findById(target_id);
      break;
    case "comment":
      target = await Comment.findById(target_id);
      break;
    default:
      return errorPatterns.badRequest(res, {
        message: "Invalid content type",
      });
  }

  if (!target) {
    return errorPatterns.notFound(res, {
      message: "Content not found",
    });
  }

  // Create moderation log
  const report = await ModerationLog.create({
    moderator_id: user_id,
    action: "report",
    target_type,
    target_id,
    reason,
    status: "pending",
  });

  return successPatterns.created(res, {
    message: "Content reported successfully",
    data: report,
  });
});

/**
 * @desc    Get content reports with pagination and filters
 * @route   GET /api/moderation/reports
 * @access  Private (Mod)
 */
export const getReports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;
  const type = req.query.type;

  logger.logInfo(NAMESPACE, "Fetching content reports");

  let query = {};
  if (status) query.status = status;
  if (type) query.target_type = type;

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
 * @desc    Handle a reported content
 * @route   PUT /api/moderation/reports/:id
 * @access  Private (Mod)
 */
export const handleReport = asyncHandler(async (req, res) => {
  const { action, resolution_note } = req.body;
  const report = await ModerationLog.findById(req.params.id);

  if (!report) {
    return errorPatterns.notFound(res, { message: "Report not found" });
  }

  // Handle the report based on action
  switch (action) {
    case "remove":
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
      break;
    case "warn":
      // Send warning notification to user (implement notification logic)
      break;
    case "ignore":
      // No action needed
      break;
    default:
      return errorPatterns.badRequest(res, {
        message: "Invalid action",
      });
  }

  // Update report status
  report.status = "resolved";
  report.resolution = {
    action,
    note: resolution_note,
    moderator_id: req.user._id,
    date: new Date(),
  };
  await report.save();

  logger.logInfo(
    NAMESPACE,
    `Report ${report._id} handled with action: ${action}`
  );
  return successPatterns.updated(res, {
    message: "Report handled successfully",
    data: report,
  });
});

/**
 * @desc    Get moderation queue with pagination
 * @route   GET /api/moderation/queue
 * @access  Private (Mod)
 */
export const getModerationQueue = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  logger.logInfo(NAMESPACE, "Fetching moderation queue");

  const queue = await ModerationLog.find({ status: "pending" })
    .populate("moderator_id", "username")
    .populate("target_id")
    .sort({ createdAt: 1 }) // Oldest first
    .skip(skip)
    .limit(limit);

  const total = await ModerationLog.countDocuments({ status: "pending" });

  return successPatterns.retrieved(res, {
    data: queue,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Log a moderation action
 * @route   POST /api/moderation/log
 * @access  Private (Mod)
 */
export const logModerationAction = asyncHandler(async (req, res) => {
  const { action, target_type, target_id, reason } = req.body;
  const moderator_id = req.user._id;

  logger.logInfo(NAMESPACE, `Logging moderation action: ${action}`);

  const log = await ModerationLog.create({
    moderator_id,
    action,
    target_type,
    target_id,
    reason,
    status: "resolved",
  });

  return successPatterns.created(res, {
    message: "Moderation action logged successfully",
    data: log,
  });
});

/**
 * @desc    Get moderation history with pagination and filters
 * @route   GET /api/moderation/history
 * @access  Private (Mod)
 */
export const getModerationHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const moderator = req.query.moderator;
  const action = req.query.action;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  logger.logInfo(NAMESPACE, "Fetching moderation history");

  let query = { status: "resolved" };
  if (moderator) query.moderator_id = moderator;
  if (action) query.action = action;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const history = await ModerationLog.find(query)
    .populate("moderator_id", "username")
    .populate("target_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ModerationLog.countDocuments(query);

  return successPatterns.retrieved(res, {
    data: history,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get moderator statistics
 * @route   GET /api/moderation/stats
 * @access  Private (Mod)
 */
export const getModeratorStats = asyncHandler(async (req, res) => {
  const moderator_id = req.query.moderator || req.user._id;
  const startDate = req.query.startDate
    ? new Date(req.query.startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days by default
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

  logger.logInfo(NAMESPACE, `Fetching moderator stats for: ${moderator_id}`);

  const stats = {
    totalActions: await ModerationLog.countDocuments({
      moderator_id,
      createdAt: { $gte: startDate, $lte: endDate },
    }),
    actionsByType: await ModerationLog.aggregate([
      {
        $match: {
          moderator_id: mongoose.Types.ObjectId(moderator_id),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
    ]),
    resolutionTime: await ModerationLog.aggregate([
      {
        $match: {
          moderator_id: mongoose.Types.ObjectId(moderator_id),
          status: "resolved",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          resolutionTime: {
            $subtract: ["$updatedAt", "$createdAt"],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageTime: { $avg: "$resolutionTime" },
        },
      },
    ]),
  };

  return successPatterns.retrieved(res, {
    data: stats,
    meta: {
      startDate,
      endDate,
    },
  });
});
