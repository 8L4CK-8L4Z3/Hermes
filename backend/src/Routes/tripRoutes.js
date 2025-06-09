import express from "express";
import {
  createTrip,
  getTrip,
  updateTrip,
  deleteTrip,
  getUserTrips,
  addDestination,
  removeDestination,
  updateTripStatus,
  shareTrip,
  getPublicTrips,
  updateBudget,
  addActivity,
  removeActivity,
  updateActivity,
  getTripActivities,
  getTripTimeline,
  updateTripVisibility,
} from "../Controllers/tripController.js";
import { protect } from "../Middleware/auth.js";
import {
  tripValidator,
  createMongoIdValidator,
} from "../Middleware/validators.js";
import { checkTripOwnership } from "../Middleware/ownership.js";
import { cache } from "../Middleware/cache.js";

const router = express.Router();

const userIdValidator = createMongoIdValidator("userId");
const destinationIdValidator = createMongoIdValidator("destinationId");
const activityIdValidator = createMongoIdValidator("activityId");

// Public routes with caching
router.get("/public", cache("15m"), getPublicTrips);
router.get("/:id", cache("15m"), getTrip);
router.get("/user/:userId", userIdValidator, cache("15m"), getUserTrips);
router.get("/:id/activities", cache("15m"), getTripActivities);
router.get("/:id/timeline", cache("15m"), getTripTimeline);

// Protected routes
router.use(protect);

// Trip CRUD operations
router.post("/", tripValidator, createTrip);
router.put("/:id", tripValidator, checkTripOwnership, updateTrip);
router.delete("/:id", checkTripOwnership, deleteTrip);

// Trip destinations
router.post("/:id/destinations", checkTripOwnership, addDestination);
router.delete(
  "/:id/destinations/:destinationId",
  destinationIdValidator,
  checkTripOwnership,
  removeDestination
);

// Trip activities
router.post("/:id/activities", checkTripOwnership, addActivity);
router.delete(
  "/:id/activities/:activityId",
  activityIdValidator,
  checkTripOwnership,
  removeActivity
);
router.patch(
  "/:id/activities/:activityId",
  activityIdValidator,
  checkTripOwnership,
  updateActivity
);

// Trip attributes
router.patch("/:id/status", checkTripOwnership, updateTripStatus);
router.patch("/:id/budget", checkTripOwnership, updateBudget);
router.patch("/:id/visibility", checkTripOwnership, updateTripVisibility);

// Trip sharing
router.post("/:id/share", checkTripOwnership, shareTrip);

export default router;
