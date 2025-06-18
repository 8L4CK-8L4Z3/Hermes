import User from "../Models/User.js";
import Destination from "../Models/Destination.js";
import Place from "../Models/Place.js";
import Post from "../Models/Post.js";
import Trip from "../Models/Trip.js";
import Activity from "../Models/Activity.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "SearchController";

/**
 * @desc    Search across all content types
 * @route   GET /api/search
 * @access  Public
 */
export const searchAll = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    return errorPatterns.validationError(res, {
      message: "Search query is required",
    });
  }

  logger.logInfo(NAMESPACE, `Performing global search with query: ${query}`);

  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };

  const [destinations, places, users, posts, trips, activities] =
    await Promise.all([
      Destination.find(searchQuery)
        .limit(limit)
        .select("name description location photo"),
      Place.find(searchQuery)
        .limit(limit)
        .populate("destination_id", "name")
        .select("name description type photo average_rating"),
      User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { bio: { $regex: query, $options: "i" } },
        ],
      })
        .limit(limit)
        .select("username photo bio"),
      Post.find({
        $and: [
          {
            $or: [
              { content: { $regex: query, $options: "i" } },
              { tags: { $regex: query, $options: "i" } },
            ],
          },
          { visibility: "public" },
        ],
      })
        .limit(limit)
        .populate("user_id", "username photo")
        .select("content media type tags createdAt"),
      Trip.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { destinations: { $regex: query, $options: "i" } },
        ],
        isPublic: true,
      })
        .limit(limit)
        .populate("user_id", "username photo")
        .select("title destinations start_date end_date status user_id"),
      Activity.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      })
        .limit(limit)
        .select("name description location category tags image popularity"),
    ]);

  return successPatterns.retrieved(res, {
    data: {
      destinations,
      places,
      users,
      posts,
      trips,
      activities,
    },
    meta: {
      query,
      results: {
        destinations: destinations.length,
        places: places.length,
        users: users.length,
        posts: posts.length,
        trips: trips.length,
        activities: activities.length,
      },
    },
  });
});

/**
 * @desc    Search destinations
 * @route   GET /api/search/destinations
 * @access  Public
 */
export const searchDestinations = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    return errorPatterns.validationError(res, {
      message: "Search query is required",
    });
  }

  logger.logInfo(NAMESPACE, `Searching destinations with query: ${query}`);

  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
    ],
  };

  const total = await Destination.countDocuments(searchQuery);
  const destinations = await Destination.find(searchQuery)
    .skip((page - 1) * limit)
    .limit(limit);

  return successPatterns.retrieved(res, {
    data: destinations,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Search places
 * @route   GET /api/search/places
 * @access  Public
 */
export const searchPlaces = asyncHandler(async (req, res) => {
  const { query, type, price_range, page = 1, limit = 10 } = req.query;

  if (!query) {
    return errorPatterns.validationError(res, {
      message: "Search query is required",
    });
  }

  logger.logInfo(NAMESPACE, `Searching places with query: ${query}`);

  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };

  if (type) searchQuery.type = type;
  if (price_range) searchQuery.price_range = price_range;

  const total = await Place.countDocuments(searchQuery);
  const places = await Place.find(searchQuery)
    .populate("destination_id", "name location")
    .skip((page - 1) * limit)
    .limit(limit);

  return successPatterns.retrieved(res, {
    data: places,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Search users
 * @route   GET /api/search/users
 * @access  Public
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    return errorPatterns.validationError(res, {
      message: "Search query is required",
    });
  }

  logger.logInfo(NAMESPACE, `Searching users with query: ${query}`);

  const searchQuery = {
    $or: [
      { username: { $regex: query, $options: "i" } },
      { bio: { $regex: query, $options: "i" } },
    ],
  };

  const total = await User.countDocuments(searchQuery);
  const users = await User.find(searchQuery)
    .select("-password_hash")
    .skip((page - 1) * limit)
    .limit(limit);

  return successPatterns.retrieved(res, {
    data: users,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Search posts
 * @route   GET /api/search/posts
 * @access  Public
 */
export const searchPosts = asyncHandler(async (req, res) => {
  const { query, type, page = 1, limit = 10 } = req.query;

  if (!query) {
    return errorPatterns.validationError(res, {
      message: "Search query is required",
    });
  }

  logger.logInfo(NAMESPACE, `Searching posts with query: ${query}`);

  const searchQuery = {
    $and: [
      {
        $or: [
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      },
      { visibility: "public" },
    ],
  };

  if (type) searchQuery.type = type;

  const total = await Post.countDocuments(searchQuery);
  const posts = await Post.find(searchQuery)
    .populate("user_id", "username photo")
    .skip((page - 1) * limit)
    .limit(limit);

  return successPatterns.retrieved(res, {
    data: posts,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get search suggestions
 * @route   GET /api/search/suggestions
 * @access  Public
 */
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { query, limit = 5 } = req.query;

  if (!query || query.length < 2) {
    return successPatterns.retrieved(res, {
      data: [],
      meta: { query },
    });
  }

  logger.logInfo(NAMESPACE, `Getting search suggestions for query: ${query}`);

  const [destinations, places, users] = await Promise.all([
    Destination.find({ name: { $regex: `^${query}`, $options: "i" } })
      .limit(limit)
      .select("name"),
    Place.find({ name: { $regex: `^${query}`, $options: "i" } })
      .limit(limit)
      .select("name type"),
    User.find({ username: { $regex: `^${query}`, $options: "i" } })
      .limit(limit)
      .select("username"),
  ]);

  const suggestions = {
    destinations: destinations.map((d) => ({
      type: "destination",
      text: d.name,
      id: d._id,
    })),
    places: places.map((p) => ({
      type: "place",
      text: p.name,
      subtext: p.type,
      id: p._id,
    })),
    users: users.map((u) => ({
      type: "user",
      text: u.username,
      id: u._id,
    })),
  };

  return successPatterns.retrieved(res, {
    data: suggestions,
    meta: { query },
  });
});

/**
 * @desc    Search trips
 * @route   GET /api/search/trips
 * @access  Public
 */
export const searchTrips = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    return errorPatterns.validationError(res, {
      message: "Search query is required",
    });
  }

  logger.logInfo(NAMESPACE, `Searching trips with query: ${query}`);

  const searchQuery = {
    $and: [
      {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { destinations: { $regex: query, $options: "i" } },
        ],
      },
      { isPublic: true },
    ],
  };

  const total = await Trip.countDocuments(searchQuery);
  const trips = await Trip.find(searchQuery)
    .populate("user_id", "username photo")
    .skip((page - 1) * limit)
    .limit(limit);

  return successPatterns.retrieved(res, {
    data: trips,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Search activities
 * @route   GET /api/search/activities
 * @access  Public
 */
export const searchActivities = asyncHandler(async (req, res) => {
  const { query, category, page = 1, limit = 10 } = req.query;

  if (!query) {
    return errorPatterns.validationError(res, {
      message: "Search query is required",
    });
  }

  logger.logInfo(NAMESPACE, `Searching activities with query: ${query}`);

  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ],
  };
  if (category) searchQuery.category = category;

  const total = await Activity.countDocuments(searchQuery);
  const activities = await Activity.find(searchQuery)
    .skip((page - 1) * limit)
    .limit(limit);

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
  searchAll,
  searchDestinations,
  searchPlaces,
  searchUsers,
  searchPosts,
  getSearchSuggestions,
  searchTrips,
  searchActivities,
};
