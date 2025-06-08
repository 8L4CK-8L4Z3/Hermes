import Place from "../Models/Place.js";
import Destination from "../Models/Destination.js";
import Analytics from "../Models/Analytics.js";
import Review from "../Models/Review.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "PlaceController";

/**
 * @desc    Create new place
 * @route   POST /api/places
 * @access  Private (Admin)
 */
export const createPlace = asyncHandler(async (req, res) => {
  const {
    destination_id,
    type,
    name,
    description,
    photo,
    price_range,
    opening_hours,
    address,
  } = req.body;

  // Check if destination exists
  const destination = await Destination.findById(destination_id);
  if (!destination) {
    return errorPatterns.notFound(res, { message: "Destination not found" });
  }

  logger.logInfo(
    NAMESPACE,
    `Creating new place: ${name} in destination: ${destination_id}`
  );

  const place = await Place.create({
    destination_id,
    type,
    name,
    description,
    photo,
    price_range,
    opening_hours,
    address,
  });

  return successPatterns.created(res, {
    data: place,
    message: "Place created successfully",
  });
});

/**
 * @desc    Get place details
 * @route   GET /api/places/:id
 * @access  Public
 */
export const getPlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id).populate("destination_id");

  if (!place) {
    return errorPatterns.notFound(res, { message: "Place not found" });
  }

  logger.logInfo(NAMESPACE, `Retrieved place: ${place._id}`);
  return successPatterns.retrieved(res, { data: place });
});

/**
 * @desc    Update place information
 * @route   PUT /api/places/:id
 * @access  Private (Admin)
 */
export const updatePlace = asyncHandler(async (req, res) => {
  const {
    type,
    name,
    description,
    photo,
    price_range,
    opening_hours,
    address,
  } = req.body;

  const place = await Place.findById(req.params.id);
  if (!place) {
    return errorPatterns.notFound(res, { message: "Place not found" });
  }

  logger.logInfo(NAMESPACE, `Updating place: ${place._id}`);

  place.type = type || place.type;
  place.name = name || place.name;
  place.description = description || place.description;
  place.photo = photo || place.photo;
  place.price_range = price_range || place.price_range;
  place.opening_hours = opening_hours || place.opening_hours;
  place.address = address || place.address;

  await place.save();

  return successPatterns.updated(res, {
    data: place,
    message: "Place updated successfully",
  });
});

/**
 * @desc    Delete place
 * @route   DELETE /api/places/:id
 * @access  Private (Admin)
 */
export const deletePlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);
  if (!place) {
    return errorPatterns.notFound(res, { message: "Place not found" });
  }

  logger.logInfo(NAMESPACE, `Deleting place: ${place._id}`);

  // Delete associated reviews
  await Review.deleteMany({ place_id: place._id });
  await place.deleteOne();

  return successPatterns.deleted(res, {
    message: "Place and associated reviews deleted successfully",
  });
});

/**
 * @desc    Get places by type
 * @route   GET /api/places/type/:type
 * @access  Public
 */
export const getPlacesByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Fetching places of type: ${type}`);

  const total = await Place.countDocuments({ type });
  const places = await Place.find({ type })
    .populate("destination_id")
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
 * @desc    Get places by destination
 * @route   GET /api/places/destination/:destinationId
 * @access  Public
 */
export const getPlacesByDestination = asyncHandler(async (req, res) => {
  const { destinationId } = req.params;
  const { type, page = 1, limit = 10 } = req.query;

  const query = { destination_id: destinationId };
  if (type) query.type = type;

  logger.logInfo(
    NAMESPACE,
    `Fetching places for destination: ${destinationId}`
  );

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

/**
 * @desc    Get popular places
 * @route   GET /api/places/popular
 * @access  Public
 */
export const getPopularPlaces = asyncHandler(async (req, res) => {
  const { limit = 12 } = req.query;

  logger.logInfo(NAMESPACE, "Fetching popular places");

  const places = await Place.find()
    .sort({ average_rating: -1 })
    .limit(parseInt(limit))
    .populate("destination_id");

  return successPatterns.retrieved(res, { data: places });
});

/**
 * @desc    Update place average rating
 * @route   PUT /api/places/:id/rating
 * @access  Private
 */
export const updatePlaceRating = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);
  if (!place) {
    return errorPatterns.notFound(res, { message: "Place not found" });
  }

  const reviews = await Review.find({ place_id: place._id });
  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  logger.logInfo(NAMESPACE, `Updating rating for place: ${place._id}`);

  place.average_rating = averageRating;
  await place.save();

  return successPatterns.updated(res, {
    data: place,
    message: "Place rating updated successfully",
  });
});

/**
 * @desc    Get places by price range
 * @route   GET /api/places/price/:range
 * @access  Public
 */
export const getPlacesByPriceRange = asyncHandler(async (req, res) => {
  const { range } = req.params;
  const { page = 1, limit = 10 } = req.query;

  logger.logInfo(NAMESPACE, `Fetching places with price range: ${range}`);

  const total = await Place.countDocuments({ price_range: range });
  const places = await Place.find({ price_range: range })
    .populate("destination_id")
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
 * @desc    Get places by opening hours
 * @route   GET /api/places/hours
 * @access  Public
 */
export const getPlacesByOpeningHours = asyncHandler(async (req, res) => {
  const { day, time } = req.query;
  const { page = 1, limit = 10 } = req.query;

  // This is a simplified implementation. In a real app, you'd want to use
  // a more sophisticated time range query based on your opening_hours format
  const query = {
    opening_hours: { $regex: `${day}.*${time}`, $options: "i" },
  };

  logger.logInfo(NAMESPACE, `Fetching places by opening hours: ${day} ${time}`);

  const total = await Place.countDocuments(query);
  const places = await Place.find(query)
    .populate("destination_id")
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
 * @desc    Get place statistics
 * @route   GET /api/places/:id/stats
 * @access  Public
 */
export const getPlaceStats = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);
  if (!place) {
    return errorPatterns.notFound(res, { message: "Place not found" });
  }

  const reviewCount = await Review.countDocuments({ place_id: place._id });
  const analytics = await Analytics.findOne({
    "popularPlaces.place_id": place._id,
  });

  const stats = {
    reviewCount,
    averageRating: place.average_rating,
    views:
      analytics?.popularPlaces.find((p) => p.place_id.equals(place._id))
        ?.views || 0,
  };

  logger.logInfo(NAMESPACE, `Retrieved stats for place: ${place._id}`);
  return successPatterns.retrieved(res, { data: stats });
});
