import { body, param } from "express-validator";

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
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
    .withMessage("Password must contain at least one letter and one number"),
];

const userLoginValidator = [
  body("email").trim().isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Post Validators
const postValidator = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Post content must be between 1 and 1000 characters"),
  body("media").optional().isURL().withMessage("Media must be a valid URL"),
];

// Comment Validators
const commentValidator = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment content must be between 1 and 1000 characters"),
];

// Review Validators
const reviewValidator = [
  body("rating")
    .isInt({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),
  body("content").trim(),
];

// Trip Validators
const tripValidator = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Trip title must be between 3 and 100 characters"),
  body("description").trim(),
  body("startDate").isISO8601().withMessage("Start date must be a valid date"),
  body("endDate")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
];

// Place Validators
const placeValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Place name must be between 2 and 100 characters"),
  body("description").trim(),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("coordinates")
    .optional()
    .isArray()
    .withMessage("Coordinates must be an array")
    .custom((value) => {
      if (value && (!Array.isArray(value) || value.length !== 2)) {
        throw new Error(
          "Coordinates must be an array of [latitude, longitude]"
        );
      }
      return true;
    }),
];

// Destination Validators
const destinationValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Destination name must be between 2 and 100 characters"),
  body("description").trim(),
  body("location").trim().notEmpty().withMessage("Location is required"),
];

// ID Parameter Validator (reusable for any route that uses IDs)
const idParamValidator = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];

// Analytics Validators
const analyticsValidator = [
  body("date").isISO8601().withMessage("Date must be a valid date"),
  body("metrics").isObject().withMessage("Metrics must be an object"),
  body("popularDestinations")
    .isArray()
    .withMessage("Popular destinations must be an array"),
  body("popularPlaces")
    .isArray()
    .withMessage("Popular places must be an array"),
];

// ModerationLog Validators
const moderationLogValidator = [
  body("action")
    .trim()
    .notEmpty()
    .withMessage("Action is required")
    .isIn(["warn", "ban", "delete", "approve", "reject"])
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
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "resolved", "rejected"])
    .withMessage("Invalid status"),
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
];

// Enhanced Like Validators
const likeValidator = [
  body("target_type")
    .trim()
    .notEmpty()
    .withMessage("Target type is required")
    .isIn(["post", "comment", "review"])
    .withMessage("Invalid target type"),
  body("target_id")
    .trim()
    .notEmpty()
    .withMessage("Target ID is required")
    .isMongoId()
    .withMessage("Invalid target ID format"),
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
];

// Report Content Validator
const validateReport = [
  body("target_type")
    .trim()
    .notEmpty()
    .withMessage("Target type is required")
    .isIn(["review", "post", "comment"])
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
];

export {
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
  userStatsValidator,
  userPreferencesValidator,
  validateReport,
  validateModAction,
};
