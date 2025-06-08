import express from "express";
import { protect, isAdmin } from "../Middleware/auth.js";
import { placeValidator, idParamValidator } from "../Middleware/validators.js";
import { cache } from "../Middleware/cache.js";
import {
  createPlace,
  getPlace,
  updatePlace,
  deletePlace,
  getPlacesByType,
  getPlacesByDestination,
  getPopularPlaces,
  getPlacesByPriceRange,
  getPlacesByOpeningHours,
  getPlaceStats,
} from "../Controllers/placeController.js";

const router = express.Router();

// Public routes with caching
router.get("/popular", cache("15m"), getPopularPlaces);
router.get("/type/:type", cache("15m"), getPlacesByType);
router.get("/destination/:destinationId", cache("15m"), getPlacesByDestination);
router.get("/price/:range", cache("15m"), getPlacesByPriceRange);
router.get("/hours", cache("15m"), getPlacesByOpeningHours);
router.get("/:id", idParamValidator, cache("15m"), getPlace);
router.get("/:id/stats", idParamValidator, cache("15m"), getPlaceStats);

// Protected admin routes
router.use(protect, isAdmin);
router.post("/", placeValidator, createPlace);
router.put("/:id", [idParamValidator, placeValidator], updatePlace);
router.delete("/:id", idParamValidator, deletePlace);

export default router;
