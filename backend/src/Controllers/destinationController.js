import Destination from "../Models/Destination.js";
import Place from "../Models/Place.js";
import Analytics from "../Models/Analytics.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "DestinationController";

/**
 * Create a new destination
 * @route POST /api/destinations
 * @access Private (Admin)
 */
export const createDestination = asyncHandler(async (req, res) => {
  const { name, description, location, photo } = req.body;

  logger.logInfo(NAMESPACE, `Creating new destination: ${name}`);

  const destination = await Destination.create({
    name,
    description,
    location,
    photo,
  });

  return successPatterns.created(res, {
    data: destination,
    message: "Destination created successfully",
  });
});

/**
 * Get destination details
 * @route GET /api/destinations/:id
 * @access Public
 */
export const getDestination = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.logInfo(NAMESPACE, `Fetching destination with id: ${id}`);

  const destination = await Destination.findById(id);

  if (!destination) {
    return errorPatterns.notFound(res, {
      message: "Destination not found",
    });
  }

  // Update analytics
  try {
    await Analytics.findOneAndUpdate(
      { date: new Date().toISOString().split("T")[0] },
      {
        $inc: { "metrics.destinationViews": 1 },
        $addToSet: {
          popularDestinations: {
            destination_id: destination._id,
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
    data: destination,
  });
});

/**
 * Update destination information
 * @route PUT /api/destinations/:id
 * @access Private (Admin)
 */
export const updateDestination = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, location, photo } = req.body;

  logger.logInfo(NAMESPACE, `Updating destination with id: ${id}`);

  const destination = await Destination.findById(id);

  if (!destination) {
    return errorPatterns.notFound(res, {
      message: "Destination not found",
    });
  }

  destination.name = name || destination.name;
  destination.description = description || destination.description;
  destination.location = location || destination.location;
  destination.photo = photo || destination.photo;

  await destination.save();

  return successPatterns.updated(res, {
    data: destination,
    message: "Destination updated successfully",
  });
});

/**
 * Delete destination
 * @route DELETE /api/destinations/:id
 * @access Private (Admin)
 */
export const deleteDestination = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.logInfo(NAMESPACE, `Deleting destination with id: ${id}`);

  const destination = await Destination.findById(id);

  if (!destination) {
    return errorPatterns.notFound(res, {
      message: "Destination not found",
    });
  }

  // Delete associated places
  await Place.deleteMany({ destination_id: id });

  await destination.deleteOne();

  return successPatterns.deleted(res, {
    message: "Destination and associated places deleted successfully",
  });
});

/**
 * Search destinations
 * @route GET /api/destinations/search
 * @access Public
 */
export const searchDestinations = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Searching destinations with query: ${query}`);

  const searchQuery = query
    ? {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } },
        ],
      }
    : {};

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
 * Get trending destinations
 * @route GET /api/destinations/popular
 * @access Public
 */
export const getPopularDestinations = asyncHandler(async (req, res) => {
  const { limit = 4 } = req.query;

  logger.logInfo(NAMESPACE, "Fetching popular destinations");

  // Try to get analytics first
  const analytics = await Analytics.findOne({
    date: new Date().toISOString().split("T")[0],
  }).populate({
    path: "popularDestinations.destination_id",
    select: "name description location images",
  });

  if (analytics?.popularDestinations?.length > 0) {
    // Sort by views and return
    const sortedDestinations = analytics.popularDestinations
      .sort((a, b) => b.views - a.views)
      .slice(0, parseInt(limit));

    return successPatterns.retrieved(res, {
      data: sortedDestinations,
    });
  }

  // If no analytics exist, just return the most recently added destinations
  const destinations = await Destination.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select("name description location images");

  // Format the response to match the analytics format
  const formattedDestinations = destinations.map((dest) => ({
    destination_id: dest,
    views: 0,
    saves: 0,
  }));

  return successPatterns.retrieved(res, {
    data: formattedDestinations,
  });
});

/**
 * Get nearby destinations
 * @route GET /api/destinations/nearby
 * @access Public
 */
export const getNearbyDestinations = asyncHandler(async (req, res) => {
  const { location, radius = 50, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Fetching destinations near location: ${location}`);

  // Simple text-based location matching for now
  // TODO: Implement proper geospatial queries using coordinates
  const destinations = await Destination.find({
    location: { $regex: location, $options: "i" },
  }).limit(parseInt(limit));

  return successPatterns.retrieved(res, {
    data: destinations,
  });
});

/**
 * Update destination photo
 * @route PUT /api/destinations/:id/photo
 * @access Private (Admin)
 */
export const updateDestinationPhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { photo } = req.body;

  logger.logInfo(NAMESPACE, `Updating photo for destination: ${id}`);

  const destination = await Destination.findById(id);

  if (!destination) {
    return errorPatterns.notFound(res, {
      message: "Destination not found",
    });
  }

  destination.photo = photo;
  await destination.save();

  return successPatterns.updated(res, {
    data: destination,
    message: "Destination photo updated successfully",
  });
});

/**
 * Get destination statistics
 * @route GET /api/destinations/:id/stats
 * @access Public
 */
export const getDestinationStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.logInfo(NAMESPACE, `Fetching stats for destination: ${id}`);

  const destination = await Destination.findById(id);

  if (!destination) {
    return errorPatterns.notFound(res, {
      message: "Destination not found",
    });
  }

  const analytics = await Analytics.findOne({
    date: new Date().toISOString().split("T")[0],
    "popularDestinations.destination_id": id,
  });

  const stats = {
    views:
      analytics?.popularDestinations.find(
        (d) => d.destination_id.toString() === id
      )?.views || 0,
    placesCount: await Place.countDocuments({ destination_id: id }),
  };

  return successPatterns.retrieved(res, {
    data: stats,
  });
});

/**
 * Get all places in a destination
 * @route GET /api/destinations/:id/places
 * @access Public
 */
export const getDestinationPlaces = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Fetching places for destination: ${id}`);

  const destination = await Destination.findById(id);

  if (!destination) {
    return errorPatterns.notFound(res, {
      message: "Destination not found",
    });
  }

  const query = { destination_id: id };
  if (type) {
    query.type = type;
  }

  const total = await Place.countDocuments(query);
  const places = await Place.find(query)
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

export default {
  createDestination,
  getDestination,
  updateDestination,
  deleteDestination,
  searchDestinations,
  getPopularDestinations,
  getNearbyDestinations,
  updateDestinationPhoto,
  getDestinationStats,
  getDestinationPlaces,
};
