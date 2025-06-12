import { body, param, query } from "express-validator";
import handleValidationErrors from "./validationResult.js";

// User Validators
const userRegistrationValidator = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage("Password must contain at least one letter and one number"),
  handleValidationErrors,
];

const passwordUpdateValidator = [
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage("Password must contain at least one letter and one number"),
  handleValidationErrors,
];

const userLoginValidator = [
  body("email").trim().isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const userUpdateValidator = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores"),
  body("photo").optional().isURL().withMessage("Photo must be a valid URL"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio can be at most 500 characters"),
  handleValidationErrors,
];

// Post Validators
const postValidator = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Post content must be between 1 and 1000 characters"),
  body("media").optional().isURL().withMessage("Media must be a valid URL"),
  body("type")
    .optional()
    .isIn(["trip_share", "review_share", "general", "announcement"])
    .withMessage("Invalid post type"),
  body("visibility")
    .optional()
    .isIn(["public", "followers", "private"])
    .withMessage("Invalid visibility type"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().withMessage("Each tag must be a string"),
  body("location.type")
    .optional()
    .isIn(["Point"])
    .withMessage("Location type must be 'Point'"),
  body("location.coordinates")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be an array of two numbers"),
  body("location.coordinates.*")
    .optional()
    .isFloat()
    .withMessage("Coordinates must contain valid numbers"),
  handleValidationErrors,
];

// Comment Validators
const commentValidator = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment content must be between 1 and 1000 characters"),
  body("parent_comment_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent comment ID"),
  handleValidationErrors,
];

// Review Validators
const reviewValidator = [
  body("place_id")
    .notEmpty()
    .withMessage("Place ID is required")
    .isMongoId()
    .withMessage("Invalid Place ID"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").trim().notEmpty().withMessage("Comment is required"),
  body("photos").optional().isArray().withMessage("Photos must be an array"),
  body("photos.*.url")
    .optional()
    .isURL()
    .withMessage("Each photo must have a valid URL"),
  body("photos.*.caption")
    .optional()
    .isString()
    .withMessage("Caption must be a string"),
  body("visit_date")
    .optional()
    .isISO8601()
    .withMessage("Visit date must be a valid date"),
  body("categories").optional().isObject(),
  body("categories.cleanliness")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Cleanliness rating must be between 0 and 5"),
  body("categories.service")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Service rating must be between 0 and 5"),
  body("categories.value")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Value rating must be between 0 and 5"),
  body("categories.atmosphere")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Atmosphere rating must be between 0 and 5"),
  handleValidationErrors,
];

// Trip Validators
const tripValidator = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Trip title must be between 3 and 100 characters"),
  body("start_date")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body("end_date")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((end_date, { req }) => {
      if (new Date(end_date) <= new Date(req.body.start_date)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("destinations")
    .isArray({ min: 1 })
    .withMessage("At least one destination is required"),
  body("destinations.*")
    .trim()
    .notEmpty()
    .withMessage("Destination cannot be empty"),
  body("status")
    .optional()
    .isIn(["planning", "ongoing", "completed", "cancelled"])
    .withMessage("Invalid trip status"),
  body("isPublic").optional().isBoolean(),
  body("budget.amount").optional().isFloat({ min: 0 }),
  body("budget.currency").optional().isString(),
  body("activities").optional().isArray(),
  body("activities.*.place_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Place ID in activities"),
  body("activities.*.date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date in activities"),
  body("activities.*.notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string"),
  handleValidationErrors,
];

// Place Validators
const placeValidator = [
  body("destination_id")
    .notEmpty()
    .withMessage("Destination ID is required")
    .isMongoId()
    .withMessage("Invalid Destination ID"),
  body("type").trim().notEmpty().withMessage("Type is required"),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Place name must be between 2 and 100 characters"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("photo").optional().isURL().withMessage("Photo must be a valid URL"),
  body("price_range")
    .optional()
    .isIn(["$", "$$", "$$$", "$$$$"])
    .withMessage("Invalid price range"),
  body("opening_hours")
    .trim()
    .notEmpty()
    .withMessage("Opening hours are required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  handleValidationErrors,
];

// Destination Validators
const destinationValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Destination name must be between 2 and 100 characters"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("photo").optional().isURL().withMessage("Photo must be a valid URL"),
  handleValidationErrors,
];

// A factory for creating MongoDB ObjectId validators for URL parameters
const createMongoIdValidator = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`),
];

// ID Parameter Validator (reusable for any route that uses IDs)
const idParamValidator = [createMongoIdValidator("id"), handleValidationErrors];

// ModerationLog Validators
const moderationLogValidator = [
  body("action")
    .trim()
    .notEmpty()
    .withMessage("Action is required")
    .isIn(["report", "remove", "warn", "ignore", "ban_user", "unban_user"])
    .withMessage("Invalid moderation action"),
  body("target_type")
    .trim()
    .notEmpty()
    .withMessage("Target type is required")
    .isIn(["user", "post", "comment", "review"])
    .withMessage("Invalid target type"),
  body("target_id")
    .trim()
    .notEmpty()
    .withMessage("Target ID is required")
    .isMongoId()
    .withMessage("Invalid target ID format"),
  body("reason").trim().notEmpty().withMessage("Reason is required"),
  body("status")
    .optional()
    .trim()
    .isIn(["pending", "resolved"])
    .withMessage("Invalid status"),
  body("resolution.action")
    .optional()
    .isIn(["remove", "warn", "ignore"])
    .withMessage("Invalid resolution action"),
  body("resolution.note").optional().isString(),
  body("resolution.moderator_id").optional().isMongoId(),
  body("resolution.date").optional().isISO8601(),
  handleValidationErrors,
];

// Enhanced Follow Validators
const followValidator = [
  body("user_id")
    .trim()
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format")
    .custom((value, { req }) => {
      if (value === req.user.id) {
        throw new Error("Cannot follow yourself");
      }
      return true;
    }),
  handleValidationErrors,
];

// Notification Validators
const notificationValidator = [
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Notification type is required")
    .isIn(["follow", "like", "comment", "mention", "trip_invite", "system"])
    .withMessage("Invalid notification type"),
  body("data").isObject().withMessage("Notification data must be an object"),
  body("user_id")
    .trim()
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),
  handleValidationErrors,
];

// Enhanced Like Validators
const likeValidator = [
  body("target_type")
    .trim()
    .notEmpty()
    .withMessage("Target type is required")
    .isIn(["Post", "Comment", "Review"])
    .withMessage("Invalid target type"),
  body("target_id")
    .trim()
    .notEmpty()
    .withMessage("Target ID is required")
    .isMongoId()
    .withMessage("Invalid target ID format"),
  handleValidationErrors,
];

// Update User Stats Validator
const userStatsValidator = [
  body("tripsCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Trips count must be a non-negative integer"),
  body("reviewsCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reviews count must be a non-negative integer"),
  body("followersCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Followers count must be a non-negative integer"),
  body("followingCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Following count must be a non-negative integer"),
  handleValidationErrors,
];

// User Preferences Validator
const userPreferencesValidator = [
  body("language")
    .optional()
    .isIn(["en", "fr", "es", "de", "it", "pt"])
    .withMessage("Invalid language selection"),
  body("notifications.email")
    .optional()
    .isBoolean()
    .withMessage("Email notification preference must be boolean"),
  body("notifications.push")
    .optional()
    .isBoolean()
    .withMessage("Push notification preference must be boolean"),
  handleValidationErrors,
];

// Report Content Validator
const validateReport = [
  body("target_type")
    .trim()
    .notEmpty()
    .withMessage("Target type is required")
    .isIn(["review", "post", "comment", "user"])
    .withMessage("Invalid target type"),
  body("target_id")
    .trim()
    .notEmpty()
    .withMessage("Target ID is required")
    .isMongoId()
    .withMessage("Invalid target ID format"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Reason must be between 10 and 500 characters"),
  handleValidationErrors,
];

// Moderation Action Validator
const validateModAction = [
  body("action")
    .trim()
    .notEmpty()
    .withMessage("Action is required")
    .isIn(["remove", "warn", "ignore"])
    .withMessage("Invalid moderation action"),
  body("resolution_note")
    .trim()
    .notEmpty()
    .withMessage("Resolution note is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Resolution note must be between 10 and 500 characters"),
  handleValidationErrors,
];

// Analytics Validators
const analyticsValidator = [
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date"),
  body("metrics").isObject().withMessage("Metrics must be an object"),
  body("metrics.newUsers")
    .optional()
    .isInt({ min: 0 })
    .withMessage("newUsers must be a non-negative integer"),
  body("metrics.activeUsers")
    .optional()
    .isInt({ min: 0 })
    .withMessage("activeUsers must be a non-negative integer"),
  body("metrics.newTrips")
    .optional()
    .isInt({ min: 0 })
    .withMessage("newTrips must be a non-negative integer"),
  body("metrics.newReviews")
    .optional()
    .isInt({ min: 0 })
    .withMessage("newReviews must be a non-negative integer"),
  body("metrics.newPosts")
    .optional()
    .isInt({ min: 0 })
    .withMessage("newPosts must be a non-negative integer"),
  body("metrics.totalLikes")
    .optional()
    .isInt({ min: 0 })
    .withMessage("totalLikes must be a non-negative integer"),
  body("metrics.totalComments")
    .optional()
    .isInt({ min: 0 })
    .withMessage("totalComments must be a non-negative integer"),
  body("popularDestinations")
    .optional()
    .isArray()
    .withMessage("Popular destinations must be an array"),
  body("popularDestinations.*.destination_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Destination ID in popularDestinations"),
  body("popularDestinations.*.views")
    .optional()
    .isInt({ min: 0 })
    .withMessage("views must be a non-negative integer"),
  body("popularDestinations.*.saves")
    .optional()
    .isInt({ min: 0 })
    .withMessage("saves must be a non-negative integer"),
  body("popularPlaces")
    .optional()
    .isArray()
    .withMessage("Popular places must be an array"),
  body("popularPlaces.*.place_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Place ID in popularPlaces"),
  body("popularPlaces.*.views")
    .optional()
    .isInt({ min: 0 })
    .withMessage("views must be a non-negative integer"),
  body("popularPlaces.*.reviews")
    .optional()
    .isInt({ min: 0 })
    .withMessage("reviews must be a non-negative integer"),
  validateModAction,
  userUpdateValidator,
  createMongoIdValidator,
  handleValidationErrors,
];

// Admin Validators
const banUserValidator = [
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Reason must be between 10 and 500 characters"),
  idParamValidator,
  handleValidationErrors,
];

const analyticsDatesValidator = [
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date"),
  handleValidationErrors,
];

const reportedContentValidator = [
  query("page")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
  query("status")
    .optional()
    .isIn(["pending", "resolved"])
    .withMessage("Invalid status"),
  query("contentType")
    .optional()
    .isIn(["review", "post", "comment", "user"])
    .withMessage("Invalid content type"),
  handleValidationErrors,
];

const moderateContentValidator = [
  body("action")
    .notEmpty()
    .withMessage("Action is required")
    .isIn(["remove", "ignore"])
    .withMessage("Invalid action"),
  body("reason")
    .notEmpty()
    .withMessage("Reason is required")
    .isLength({ min: 1, max: 500 })
    .withMessage("Reason must be between 1 and 500 characters"),
  idParamValidator,
  handleValidationErrors,
];

export {
  moderateContentValidator,
  reportedContentValidator,
  userRegistrationValidator,
  userLoginValidator,
  postValidator,
  commentValidator,
  reviewValidator,
  tripValidator,
  placeValidator,
  destinationValidator,
  idParamValidator,
  analyticsValidator,
  moderationLogValidator,
  followValidator,
  notificationValidator,
  likeValidator,
  passwordUpdateValidator,
  userStatsValidator,
  userPreferencesValidator,
  validateReport,
  validateModAction,
  userUpdateValidator,
  createMongoIdValidator,
  banUserValidator,
  analyticsDatesValidator,
};
