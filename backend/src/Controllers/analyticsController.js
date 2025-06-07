import Analytics from "../Models/Analytics.js";
import User from "../Models/User.js";
import Post from "../Models/Post.js";
import Review from "../Models/Review.js";
import Destination from "../Models/Destination.js";
import Place from "../Models/Place.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
  HTTP_STATUS,
} from "../Utils/responses.js";

const NAMESPACE = "AnalyticsController";

/**
 * @desc    Get user activity analytics
 * @route   GET /api/analytics/users
 * @access  Private (Admin)
 */
export const getUserAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  logger.logInfo(NAMESPACE, "Fetching user activity analytics");

  const analytics = await Analytics.find({
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  const userMetrics = analytics.map((day) => ({
    date: day.date,
    newUsers: day.metrics.newUsers,
    activeUsers: day.metrics.activeUsers,
  }));

  return successPatterns.retrieved(res, {
    data: userMetrics,
    meta: { startDate: start, endDate: end },
  });
});

/**
 * @desc    Get content engagement analytics
 * @route   GET /api/analytics/content
 * @access  Private (Admin)
 */
export const getContentAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  logger.logInfo(NAMESPACE, "Fetching content engagement analytics");

  const analytics = await Analytics.find({
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  const contentMetrics = analytics.map((day) => ({
    date: day.date,
    newTrips: day.metrics.newTrips,
    newReviews: day.metrics.newReviews,
    newPosts: day.metrics.newPosts,
    totalLikes: day.metrics.totalLikes,
    totalComments: day.metrics.totalComments,
  }));

  return successPatterns.retrieved(res, {
    data: contentMetrics,
    meta: { startDate: start, endDate: end },
  });
});

/**
 * @desc    Get destination popularity analytics
 * @route   GET /api/analytics/destinations
 * @access  Private (Admin)
 */
export const getDestinationAnalytics = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, "Fetching destination popularity analytics");

  const analytics = await Analytics.findOne({
    date: new Date().toISOString().split("T")[0],
  }).populate("popularDestinations.destination_id");

  const popularDestinations = analytics?.popularDestinations || [];
  popularDestinations.sort((a, b) => b.views - a.views);

  return successPatterns.retrieved(res, {
    data: popularDestinations.slice(0, parseInt(limit)),
  });
});

/**
 * @desc    Get place popularity analytics
 * @route   GET /api/analytics/places
 * @access  Private (Admin)
 */
export const getPlaceAnalytics = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, "Fetching place popularity analytics");

  const analytics = await Analytics.findOne({
    date: new Date().toISOString().split("T")[0],
  }).populate("popularPlaces.place_id");

  const popularPlaces = analytics?.popularPlaces || [];
  popularPlaces.sort((a, b) => b.views - a.views);

  return successPatterns.retrieved(res, {
    data: popularPlaces.slice(0, parseInt(limit)),
  });
});

/**
 * @desc    Get search trends analytics
 * @route   GET /api/analytics/search
 * @access  Private (Admin)
 */
export const getSearchAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  logger.logInfo(NAMESPACE, "Fetching search trends analytics");

  const analytics = await Analytics.find({
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  const searchMetrics = analytics.map((day) => ({
    date: day.date,
    topSearches: day.metrics.topSearches || [],
    searchVolume: day.metrics.searchVolume || 0,
  }));

  return successPatterns.retrieved(res, {
    data: searchMetrics,
    meta: { startDate: start, endDate: end },
  });
});

/**
 * @desc    Update daily metrics
 * @route   POST /api/analytics/metrics/daily
 * @access  Private (Admin)
 */
export const updateDailyMetrics = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  logger.logInfo(NAMESPACE, "Updating daily metrics");

  // Calculate metrics
  const newUsers = await User.countDocuments({
    createdAt: {
      $gte: new Date(today),
      $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)),
    },
  });

  const activeUsers = await User.countDocuments({
    lastLogin: {
      $gte: new Date(today),
      $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)),
    },
  });

  const newTrips = await Post.countDocuments({
    type: "trip_share",
    createdAt: {
      $gte: new Date(today),
      $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)),
    },
  });

  const newReviews = await Review.countDocuments({
    createdAt: {
      $gte: new Date(today),
      $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)),
    },
  });

  // Update or create analytics document
  const analytics = await Analytics.findOneAndUpdate(
    { date: today },
    {
      $set: {
        "metrics.newUsers": newUsers,
        "metrics.activeUsers": activeUsers,
        "metrics.newTrips": newTrips,
        "metrics.newReviews": newReviews,
      },
    },
    { upsert: true, new: true }
  );

  return successPatterns.updated(res, {
    data: analytics,
    message: "Daily metrics updated successfully",
  });
});

/**
 * @desc    Update popular destinations
 * @route   POST /api/analytics/destinations/popular
 * @access  Private (Admin)
 */
export const updatePopularDestinations = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  logger.logInfo(NAMESPACE, "Updating popular destinations");

  // Get destinations with their view counts
  const destinations = await Destination.aggregate([
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "destination_id",
        as: "reviews",
      },
    },
    {
      $project: {
        name: 1,
        views: { $size: "$reviews" },
      },
    },
    { $sort: { views: -1 } },
    { $limit: 10 },
  ]);

  // Update analytics
  const analytics = await Analytics.findOneAndUpdate(
    { date: today },
    {
      $set: {
        popularDestinations: destinations.map((dest) => ({
          destination_id: dest._id,
          views: dest.views,
        })),
      },
    },
    { upsert: true, new: true }
  );

  return successPatterns.updated(res, {
    data: analytics.popularDestinations,
    message: "Popular destinations updated successfully",
  });
});

/**
 * @desc    Update popular places
 * @route   POST /api/analytics/places/popular
 * @access  Private (Admin)
 */
export const updatePopularPlaces = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  logger.logInfo(NAMESPACE, "Updating popular places");

  // Get places with their review counts
  const places = await Place.aggregate([
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "place_id",
        as: "reviews",
      },
    },
    {
      $project: {
        name: 1,
        reviewCount: { $size: "$reviews" },
        averageRating: 1,
      },
    },
    { $sort: { reviewCount: -1, averageRating: -1 } },
    { $limit: 10 },
  ]);

  // Update analytics
  const analytics = await Analytics.findOneAndUpdate(
    { date: today },
    {
      $set: {
        popularPlaces: places.map((place) => ({
          place_id: place._id,
          views: place.reviewCount,
        })),
      },
    },
    { upsert: true, new: true }
  );

  return successPatterns.updated(res, {
    data: analytics.popularPlaces,
    message: "Popular places updated successfully",
  });
});

/**
 * @desc    Get analytics by date range
 * @route   GET /api/analytics/date
 * @access  Private (Admin)
 */
export const getAnalyticsByDate = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  logger.logInfo(NAMESPACE, "Fetching analytics by date range");

  const analytics = await Analytics.find({
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  return successPatterns.retrieved(res, {
    data: analytics,
    meta: { startDate: start, endDate: end },
  });
});

/**
 * @desc    Get analytics by specific metric
 * @route   GET /api/analytics/metric/:metricName
 * @access  Private (Admin)
 */
export const getAnalyticsByMetric = asyncHandler(async (req, res) => {
  const { metricName } = req.params;
  const { startDate, endDate } = req.query;
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  logger.logInfo(NAMESPACE, `Fetching analytics for metric: ${metricName}`);

  const analytics = await Analytics.find({
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  const metricData = analytics.map((day) => ({
    date: day.date,
    value: day.metrics[metricName] || 0,
  }));

  return successPatterns.retrieved(res, {
    data: metricData,
    meta: {
      startDate: start,
      endDate: end,
      metric: metricName,
    },
  });
});

/**
 * @desc    Get popular content across all types
 * @route   GET /api/analytics/content/popular
 * @access  Private (Admin)
 */
export const getPopularContent = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, "Fetching popular content");

  // Get popular posts
  const popularPosts = await Post.aggregate([
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "target_id",
        as: "likes",
      },
    },
    {
      $project: {
        type: 1,
        content: 1,
        likeCount: { $size: "$likes" },
      },
    },
    { $sort: { likeCount: -1 } },
    { $limit: parseInt(limit) },
  ]);

  // Get popular reviews
  const popularReviews = await Review.aggregate([
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "target_id",
        as: "likes",
      },
    },
    {
      $project: {
        rating: 1,
        comment: 1,
        likeCount: { $size: "$likes" },
      },
    },
    { $sort: { likeCount: -1 } },
    { $limit: parseInt(limit) },
  ]);

  return successPatterns.retrieved(res, {
    data: {
      popularPosts,
      popularReviews,
    },
  });
});
