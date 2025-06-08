import express from "express";
import { apiLimiter } from "../Utils/rateLimiter.js";
import {
  searchAll,
  searchDestinations,
  searchPlaces,
  searchUsers,
  searchPosts,
  getSearchSuggestions,
} from "../Controllers/searchController.js";

const router = express.Router();

// Search routes
router.get("/", searchAll);
router.get("/destinations", searchDestinations);
router.get("/places", searchPlaces);
router.get("/users", searchUsers);
router.get("/posts", searchPosts);
router.get("/suggestions", getSearchSuggestions);

export default router;
