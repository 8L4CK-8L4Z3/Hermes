import express from "express";
import { protect } from "../Middleware/auth.js";
import { isAdmin } from "../Middleware/ownership.js";
import {
  destinationValidator,
  idParamValidator,
} from "../Middleware/validators.js";
import { cache } from "../Middleware/cache.js";
import {
  searchDestinations,
  getPopularDestinations,
  getNearbyDestinations,
  getDestination,
  getDestinationStats,
  getDestinationPlaces,
  createDestination,
  updateDestination,
  deleteDestination,
  updateDestinationPhoto,
} from "../Controllers/destinationController.js";

const router = express.Router();

// Public routes
router.get("/search", cache("15m"), searchDestinations);
router.get("/popular", cache("15m"), getPopularDestinations);
router.get("/nearby", cache("15m"), getNearbyDestinations);
router.get("/:id", idParamValidator, cache("15m"), getDestination);
router.get("/:id/stats", idParamValidator, cache("15m"), getDestinationStats);
router.get("/:id/places", idParamValidator, cache("15m"), getDestinationPlaces);

// Protected admin routes
router.use(protect);
router.post("/", [isAdmin, destinationValidator], createDestination);
router.put(
  "/:id",
  [isAdmin, idParamValidator, destinationValidator],
  updateDestination
);
router.delete("/:id", [isAdmin, idParamValidator], deleteDestination);
router.put("/:id/photo", [isAdmin, idParamValidator], updateDestinationPhoto);

export default router;
