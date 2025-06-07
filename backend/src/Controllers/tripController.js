import Trip from "../Models/Trip.js";
import User from "../Models/User.js";
import Place from "../Models/Place.js";
import Post from "../Models/Post.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  HTTP_STATUS,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "TripController";

/**
 * @desc    Create new trip
 * @route   POST /api/trips
 * @access  Private
 */
export const createTrip = asyncHandler(async (req, res) => {
  const { title, start_date, end_date, destinations, isPublic, budget } =
    req.body;

  const trip = await Trip.create({
    user_id: req.user._id,
    title,
    start_date,
    end_date,
    destinations,
    isPublic,
    budget,
  });

  // Update user's trip count
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.tripsCount": 1 },
  });

  logger.logInfo(NAMESPACE, `Trip created: ${trip._id}`);
  return successPatterns.created(res, { data: trip });
});

/**
 * @desc    Get trip details
 * @route   GET /api/trips/:id
 * @access  Public/Private (depends on trip visibility)
 */
export const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate("user_id", "username photo")
    .populate("activities.place_id");

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check if trip is private and user is not the owner
  if (
    !trip.isPublic &&
    (!req.user || trip.user_id._id.toString() !== req.user._id.toString())
  ) {
    return errorPatterns.forbidden(res, {
      message: "Access to this trip is restricted",
    });
  }

  logger.logInfo(NAMESPACE, `Trip retrieved: ${trip._id}`);
  return successPatterns.retrieved(res, { data: trip });
});

/**
 * @desc    Update trip information
 * @route   PUT /api/trips/:id
 * @access  Private
 */
export const updateTrip = asyncHandler(async (req, res) => {
  let trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this trip",
    });
  }

  trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  logger.logInfo(NAMESPACE, `Trip updated: ${trip._id}`);
  return successPatterns.updated(res, { data: trip });
});

/**
 * @desc    Delete trip
 * @route   DELETE /api/trips/:id
 * @access  Private
 */
export const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to delete this trip",
    });
  }

  await trip.remove();

  // Update user's trip count
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.tripsCount": -1 },
  });

  logger.logInfo(NAMESPACE, `Trip deleted: ${trip._id}`);
  return successPatterns.deleted(res, { message: "Trip deleted successfully" });
});

/**
 * @desc    Get all trips for a user
 * @route   GET /api/trips/user/:userId
 * @access  Public/Private (depends on trip visibility)
 */
export const getUserTrips = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { user_id: req.params.userId };

  // If not the owner, only show public trips
  if (!req.user || req.user._id.toString() !== req.params.userId) {
    query.isPublic = true;
  }

  const trips = await Trip.find(query)
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Trip.countDocuments(query);

  logger.logInfo(NAMESPACE, `Retrieved trips for user: ${req.params.userId}`);
  return successPatterns.retrieved(res, {
    data: trips,
    meta: { page, limit, total },
  });
});

/**
 * @desc    Add destination to trip
 * @route   POST /api/trips/:id/destinations
 * @access  Private
 */
export const addDestination = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this trip",
    });
  }

  trip.destinations.push(req.body.destination);
  await trip.save();

  logger.logInfo(NAMESPACE, `Destination added to trip: ${trip._id}`);
  return successPatterns.updated(res, { data: trip });
});

/**
 * @desc    Remove destination from trip
 * @route   DELETE /api/trips/:id/destinations/:destinationId
 * @access  Private
 */
export const removeDestination = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this trip",
    });
  }

  trip.destinations = trip.destinations.filter(
    (dest) => dest !== req.params.destinationId
  );
  await trip.save();

  logger.logInfo(NAMESPACE, `Destination removed from trip: ${trip._id}`);
  return successPatterns.updated(res, { data: trip });
});

/**
 * @desc    Update trip status
 * @route   PATCH /api/trips/:id/status
 * @access  Private
 */
export const updateTripStatus = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this trip",
    });
  }

  trip.status = req.body.status;
  await trip.save();

  logger.logInfo(NAMESPACE, `Trip status updated: ${trip._id}`);
  return successPatterns.updated(res, { data: trip });
});

/**
 * @desc    Share trip with other users
 * @route   POST /api/trips/:id/share
 * @access  Private
 */
export const shareTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to share this trip",
    });
  }

  // Create a post about the trip
  const post = await Post.create({
    user_id: req.user._id,
    content:
      req.body.content ||
      `Check out my trip to ${trip.destinations.join(", ")}!`,
    type: "trip_share",
    visibility: "public",
  });

  logger.logInfo(NAMESPACE, `Trip shared: ${trip._id}`);
  return successPatterns.created(res, { data: { trip, post } });
});

/**
 * @desc    Get public trips for feed
 * @route   GET /api/trips/public
 * @access  Public
 */
export const getPublicTrips = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const trips = await Trip.find({ isPublic: true })
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Trip.countDocuments({ isPublic: true });

  logger.logInfo(NAMESPACE, "Retrieved public trips");
  return successPatterns.retrieved(res, {
    data: trips,
    meta: { page, limit, total },
  });
});

/**
 * @desc    Update trip budget
 * @route   PATCH /api/trips/:id/budget
 * @access  Private
 */
export const updateBudget = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this trip",
    });
  }

  trip.budget = req.body.budget;
  await trip.save();

  logger.logInfo(NAMESPACE, `Trip budget updated: ${trip._id}`);
  return successPatterns.updated(res, { data: trip });
});

/**
 * @desc    Add activity to trip
 * @route   POST /api/trips/:id/activities
 * @access  Private
 */
export const addActivity = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this trip",
    });
  }

  trip.activities.push(req.body.activity);
  await trip.save();

  logger.logInfo(NAMESPACE, `Activity added to trip: ${trip._id}`);
  return successPatterns.updated(res, { data: trip });
});

/**
 * @desc    Remove activity from trip
 * @route   DELETE /api/trips/:id/activities/:activityId
 * @access  Private
 */
export const removeActivity = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this trip",
    });
  }

  trip.activities = trip.activities.filter(
    (activity) => activity._id.toString() !== req.params.activityId
  );
  await trip.save();

  logger.logInfo(NAMESPACE, `Activity removed from trip: ${trip._id}`);
  return successPatterns.updated(res, { data: trip });
});

/**
 * @desc    Update activity details
 * @route   PATCH /api/trips/:id/activities/:activityId
 * @access  Private
 */
export const updateActivity = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this trip",
    });
  }

  const activityIndex = trip.activities.findIndex(
    (activity) => activity._id.toString() === req.params.activityId
  );

  if (activityIndex === -1) {
    return errorPatterns.notFound(res, { message: "Activity not found" });
  }

  trip.activities[activityIndex] = {
    ...trip.activities[activityIndex],
    ...req.body,
  };

  await trip.save();

  logger.logInfo(NAMESPACE, `Activity updated in trip: ${trip._id}`);
  return successPatterns.updated(res, { data: trip });
});

/**
 * @desc    Get all activities for a trip
 * @route   GET /api/trips/:id/activities
 * @access  Public/Private (depends on trip visibility)
 */
export const getTripActivities = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate("activities.place_id")
    .select("activities isPublic user_id");

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check if trip is private and user is not the owner
  if (
    !trip.isPublic &&
    (!req.user || trip.user_id.toString() !== req.user._id.toString())
  ) {
    return errorPatterns.forbidden(res, {
      message: "Access to this trip is restricted",
    });
  }

  logger.logInfo(NAMESPACE, `Activities retrieved for trip: ${trip._id}`);
  return successPatterns.retrieved(res, { data: trip.activities });
});

/**
 * @desc    Get trip timeline with activities
 * @route   GET /api/trips/:id/timeline
 * @access  Public/Private (depends on trip visibility)
 */
export const getTripTimeline = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate("activities.place_id")
    .populate("user_id", "username photo");

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check if trip is private and user is not the owner
  if (
    !trip.isPublic &&
    (!req.user || trip.user_id.toString() !== req.user._id.toString())
  ) {
    return errorPatterns.forbidden(res, {
      message: "Access to this trip is restricted",
    });
  }

  // Sort activities by date
  const timeline = trip.activities.sort((a, b) => a.date - b.date);

  logger.logInfo(NAMESPACE, `Timeline retrieved for trip: ${trip._id}`);
  return successPatterns.retrieved(res, { data: timeline });
});

/**
 * @desc    Update trip visibility
 * @route   PATCH /api/trips/:id/visibility
 * @access  Private
 */
export const updateTripVisibility = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return errorPatterns.notFound(res, { message: "Trip not found" });
  }

  // Check ownership
  if (trip.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this trip",
    });
  }

  trip.isPublic = req.body.isPublic;
  await trip.save();

  logger.logInfo(NAMESPACE, `Trip visibility updated: ${trip._id}`);
  return successPatterns.updated(res, { data: trip });
});
