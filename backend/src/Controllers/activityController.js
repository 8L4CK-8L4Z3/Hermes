import Activity from "../Models/Activity.js";
import Analytics from "../Models/Analytics.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "ActivityController";

/**
 * Get all activities
 * @route GET /api/activities
 * @access Public
 */
export const getAllActivities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = "popularity" } = req.query;

  logger.logInfo(NAMESPACE, "Fetching all activities");

  const total = await Activity.countDocuments();
  const activities = await Activity.find()
    .select("name image description popularity")
    .sort({ [sort]: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return successPatterns.retrieved(res, {
    data: activities,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get activity by ID
 * @route GET /api/activities/:id
 * @access Public
 */
export const getActivityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.logInfo(NAMESPACE, `Fetching activity with id: ${id}`);

  const activity = await Activity.findById(id);

  if (!activity) {
    return errorPatterns.notFound(res, {
      message: "Activity not found",
    });
  }

  // Update analytics
  try {
    await Analytics.findOneAndUpdate(
      { date: new Date().toISOString().split("T")[0] },
      {
        $inc: { "metrics.activityViews": 1 },
        $addToSet: {
          popularActivities: {
            activity_id: activity._id,
            views: 1,
          },
        },
      },
      { upsert: true }
    );
  } catch (error) {
    logger.logError(NAMESPACE, "Error updating analytics", error);
  }

  return successPatterns.retrieved(res, {
    data: activity,
  });
});

/**
 * Create new activity
 * @route POST /api/activities
 * @access Private (Admin)
 */
export const createActivity = asyncHandler(async (req, res) => {
  const { name, description, image, category, duration, price } = req.body;

  if (!name || !description || !image) {
    return errorPatterns.badRequest(res, {
      message: "Name, description, and image are required",
    });
  }

  const activity = await Activity.create({
    name,
    description,
    image,
    category,
    duration,
    price,
    popularity: 0,
  });

  return successPatterns.created(res, {
    data: activity,
    message: "Activity created successfully",
  });
});

/**
 * Update activity
 * @route PUT /api/activities/:id
 * @access Private (Admin)
 */
export const updateActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image, category, duration, price } = req.body;

  const activity = await Activity.findById(id);

  if (!activity) {
    return errorPatterns.notFound(res, {
      message: "Activity not found",
    });
  }

  activity.name = name || activity.name;
  activity.description = description || activity.description;
  activity.image = image || activity.image;
  activity.category = category || activity.category;
  activity.duration = duration || activity.duration;
  activity.price = price || activity.price;

  await activity.save();

  return successPatterns.updated(res, {
    data: activity,
    message: "Activity updated successfully",
  });
});

/**
 * Delete activity
 * @route DELETE /api/activities/:id
 * @access Private (Admin)
 */
export const deleteActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.logInfo(NAMESPACE, `Deleting activity with id: ${id}`);

  const activity = await Activity.findById(id);

  if (!activity) {
    return errorPatterns.notFound(res, {
      message: "Activity not found",
    });
  }

  await activity.deleteOne();

  return successPatterns.deleted(res, {
    message: "Activity deleted successfully",
  });
});

/**
 * Search activities
 * @route GET /api/activities/search
 * @access Public
 */
export const searchActivities = asyncHandler(async (req, res) => {
  const { query, category, page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Searching activities with query: ${query}`);

  const searchQuery = {
    ...(query && {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }),
    ...(category && { category }),
  };

  const total = await Activity.countDocuments(searchQuery);
  const activities = await Activity.find(searchQuery)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return successPatterns.retrieved(res, {
    data: activities,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get popular activities
 * @route GET /api/activities/popular
 * @access Public
 */
export const getPopularActivities = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, "Fetching popular activities");

  const analytics = await Analytics.findOne({
    date: new Date().toISOString().split("T")[0],
  })
    .populate("popularActivities.activity_id")
    .sort({ "popularActivities.views": -1 })
    .limit(parseInt(limit));

  const popularActivities = analytics?.popularActivities || [];

  return successPatterns.retrieved(res, {
    data: popularActivities,
  });
});

/**
 * Get activities by category
 * @route GET /api/activities/category/:category
 * @access Public
 */
export const getActivitiesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Fetching activities in category: ${category}`);

  const total = await Activity.countDocuments({ category });
  const activities = await Activity.find({ category })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return successPatterns.retrieved(res, {
    data: activities,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export default {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  searchActivities,
  getPopularActivities,
  getActivitiesByCategory,
};
