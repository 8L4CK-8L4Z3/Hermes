import express from "express";
import {
  register,
  login,
  logout,
  refreshTokenHandler,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updatePassword,
} from "../Controllers/authController.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();


// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/reset-password/:resetToken", resetPassword);

// Protected routes
router.post("/logout", protect, logout);
router.post("/refresh-token", protect, refreshTokenHandler);
router.put("/update-password", protect, updatePassword);

export default router;
