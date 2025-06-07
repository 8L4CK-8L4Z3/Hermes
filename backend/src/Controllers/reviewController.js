import Review from "../Models/Review.js";
import Place from "../Models/Place.js";
import User from "../Models/User.js";
import Analytics from "../Models/Analytics.js";
import logger from "../Utils/logger.js";
import {
  successPatterns,
  errorPatterns,
  HTTP_STATUS,
  asyncHandler,
} from "../Utils/responses.js";

const NAMESPACE = "ReviewController";

/**
 * @desc    Create new review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
  const { place_id, rating, comment, photos, visit_date, categories } =
    req.body;

  // Check if place exists
  const place = await Place.findById(place_id);
  if (!place) {
    return errorPatterns.notFound(res, { message: "Place not found" });
  }

  // Check if user already reviewed this place
  const existingReview = await Review.findOne({
    user_id: req.user._id,
    place_id,
  });

  if (existingReview) {
    return errorPatterns.conflict(res, {
      message: "You have already reviewed this place",
    });
  }

  const review = await Review.create({
    user_id: req.user._id,
    place_id,
    rating,
    comment,
    photos,
    visit_date,
    categories,
  });

  // Update place average rating
  const allReviews = await Review.find({ place_id });
  const averageRating =
    allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
  await Place.findByIdAndUpdate(place_id, { average_rating: averageRating });

  // Update user's review count
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.reviewsCount": 1 },
  });

  // Update analytics
  await Analytics.findOneAndUpdate(
    { date: new Date().toISOString().split("T")[0] },
    { $inc: { "metrics.newReviews": 1 } },
    { upsert: true }
  );

  logger.logInfo(NAMESPACE, `Review created: ${review._id}`);
  return successPatterns.created(res, { data: review });
});

/**
 * @desc    Get review details
 * @route   GET /api/reviews/:id
 * @access  Public
 */
export const getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("user_id", "username photo")
    .populate("place_id", "name type");

  if (!review) {
    return errorPatterns.notFound(res, { message: "Review not found" });
  }

  logger.logInfo(NAMESPACE, `Review retrieved: ${review._id}`);
  return successPatterns.retrieved(res, { data: review });
});

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment, photos, visit_date, categories } = req.body;

  let review = await Review.findById(req.params.id);

  if (!review) {
    return errorPatterns.notFound(res, { message: "Review not found" });
  }

  // Check ownership
  if (review.user_id.toString() !== req.user._id.toString()) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to update this review",
    });
  }

  review = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, comment, photos, visit_date, categories },
    { new: true, runValidators: true }
  );

  // Update place average rating
  const allReviews = await Review.find({ place_id: review.place_id });
  const averageRating =
    allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
  await Place.findByIdAndUpdate(review.place_id, {
    average_rating: averageRating,
  });

  logger.logInfo(NAMESPACE, `Review updated: ${review._id}`);
  return successPatterns.updated(res, { data: review });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return errorPatterns.notFound(res, { message: "Review not found" });
  }

  // Check ownership or admin/mod status
  if (
    review.user_id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin &&
    !req.user.isMod
  ) {
    return errorPatterns.forbidden(res, {
      message: "Not authorized to delete this review",
    });
  }

  await review.remove();

  // Update place average rating
  const allReviews = await Review.find({ place_id: review.place_id });
  const averageRating = allReviews.length
    ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
    : 0;
  await Place.findByIdAndUpdate(review.place_id, {
    average_rating: averageRating,
  });

  // Update user's review count
  await User.findByIdAndUpdate(review.user_id, {
    $inc: { "stats.reviewsCount": -1 },
  });

  logger.logInfo(NAMESPACE, `Review deleted: ${review._id}`);
  return successPatterns.deleted(res, {
    message: "Review deleted successfully",
  });
});

/**
 * @desc    Get reviews for a place
 * @route   GET /api/places/:placeId/reviews
 * @access  Public
 */
export const getPlaceReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const reviews = await Review.find({ place_id: req.params.placeId })
    .populate("user_id", "username photo")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Review.countDocuments({ place_id: req.params.placeId });

  logger.logInfo(NAMESPACE, `Place reviews retrieved: ${req.params.placeId}`);
  return successPatterns.retrieved(res, {
    data: reviews,
    meta: { page, limit, total },
  });
});

/**
 * @desc    Get reviews by a user
 * @route   GET /api/users/:userId/reviews
 * @access  Public
 */
export const getUserReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const reviews = await Review.find({ user_id: req.params.userId })
    .populate("place_id", "name type photo")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Review.countDocuments({ user_id: req.params.userId });

  logger.logInfo(NAMESPACE, `User reviews retrieved: ${req.params.userId}`);
  return successPatterns.retrieved(res, {
    data: reviews,
    meta: { page, limit, total },
  });
});

/**
 * @desc    Like a review
 * @route   POST /api/reviews/:id/like
 * @access  Private
 */
export const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return errorPatterns.notFound(res, { message: "Review not found" });
  }

  // Check if user already liked
  if (review.helpful_votes.users.includes(req.user._id)) {
    return errorPatterns.conflict(res, {
      message: "You have already marked this review as helpful",
    });
  }

  review.helpful_votes.count += 1;
  review.helpful_votes.users.push(req.user._id);
  await review.save();

  logger.logInfo(NAMESPACE, `Review liked: ${review._id}`);
  return successPatterns.updated(res, {
    data: { helpfulVotes: review.helpful_votes.count },
  });
});

/**
 * @desc    Unlike a review
 * @route   POST /api/reviews/:id/unlike
 * @access  Private
 */
export const unlikeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return errorPatterns.notFound(res, { message: "Review not found" });
  }

  // Check if user hasn't liked
  if (!review.helpful_votes.users.includes(req.user._id)) {
    return errorPatterns.conflict(res, {
      message: "You haven't marked this review as helpful",
    });
  }

  review.helpful_votes.count -= 1;
  review.helpful_votes.users = review.helpful_votes.users.filter(
    (userId) => userId.toString() !== req.user._id.toString()
  );
  await review.save();

  logger.logInfo(NAMESPACE, `Review unliked: ${review._id}`);
  return successPatterns.updated(res, {
    data: { helpfulVotes: review.helpful_votes.count },
  });
});

/**
 * @desc    Get most helpful reviews
 * @route   GET /api/reviews/helpful
 * @access  Public
 */
export const getHelpfulReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const reviews = await Review.find()
    .sort({ "helpful_votes.count": -1 })
    .populate("user_id", "username photo")
    .populate("place_id", "name type photo")
    .skip(startIndex)
    .limit(limit);

  const total = await Review.countDocuments();

  logger.logInfo(NAMESPACE, "Helpful reviews retrieved");
  return successPatterns.retrieved(res, {
    data: reviews,
    meta: { page, limit, total },
  });
});

/**
 * @desc    Get reviews by visit date range
 * @route   GET /api/reviews/by-date
 * @access  Public
 */
export const getReviewsByVisitDate = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = {
    visit_date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const reviews = await Review.find(query)
    .populate("user_id", "username photo")
    .populate("place_id", "name type photo")
    .sort({ visit_date: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Review.countDocuments(query);

  logger.logInfo(NAMESPACE, "Reviews by date range retrieved");
  return successPatterns.retrieved(res, {
    data: reviews,
    meta: { page, limit, total, dateRange: { startDate, endDate } },
  });
});
