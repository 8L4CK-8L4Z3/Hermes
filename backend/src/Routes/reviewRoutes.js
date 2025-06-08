import express from "express";
import {
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getReviews,
  likeReview,
  unlikeReview,
  getHelpfulReviews,
  getReviewsByVisitDate,
} from "../Controllers/reviewController.js";
import { protect } from "../Middleware/auth.js";
import { reviewValidator } from "../Middleware/validators.js";

const router = express.Router();

// Public routes
router.get("/helpful", getHelpfulReviews);
router.get("/by-date", getReviewsByVisitDate);
router.get("/:id", getReview);

// Protected routes
router.post("/", protect, reviewValidator, createReview);
router.put("/:id", protect, reviewValidator, updateReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/like", protect, likeReview);
router.post("/:id/unlike", protect, unlikeReview);

// Routes that will be mounted under different paths
// These will be used as: app.use('/api/places/:placeId/reviews', reviewRoutes)
// and app.use('/api/users/:userId/reviews', reviewRoutes)
router.get("/", getReviews); // For /api/places/:placeId/reviews and /api/users/:userId/reviews

export default router;
