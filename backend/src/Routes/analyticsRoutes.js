import express from "express";
import {
  getUserAnalytics,
  getContentAnalytics,
  getDestinationAnalytics,
  getPlaceAnalytics,
  getSearchAnalytics,
  updateDailyMetrics,
  updatePopularDestinations,
  updatePopularPlaces,
  getAnalyticsByDate,
  getAnalyticsByMetric,
  getPopularContent,
} from "../Controllers/analyticsController.js";
import { protect } from "../Middleware/auth.js";
import { isAdmin } from "../Middleware/ownership.js";
import { cache } from "../Middleware/cache.js";

const router = express.Router();

// All routes are protected and require admin access
router.use(protect, isAdmin);

// GET routes with caching
router.get("/users", cache("15m"), getUserAnalytics);
router.get("/content", cache("15m"), getContentAnalytics);
router.get("/destinations", cache("15m"), getDestinationAnalytics);
router.get("/places", cache("15m"), getPlaceAnalytics);
router.get("/search", cache("15m"), getSearchAnalytics);
router.get("/date", cache("15m"), getAnalyticsByDate);
router.get("/metric/:metricName", cache("15m"), getAnalyticsByMetric);
router.get("/content/popular", cache("15m"), getPopularContent);

// POST routes for updating analytics
router.post("/metrics/daily", updateDailyMetrics);
router.post("/destinations/popular", updatePopularDestinations);
router.post("/places/popular", updatePopularPlaces);

export default router;
