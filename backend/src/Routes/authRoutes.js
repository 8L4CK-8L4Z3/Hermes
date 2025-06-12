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
import {
  passwordUpdateValidator,
  userRegistrationValidator,
  userLoginValidator,
} from "../Middleware/validators.js";

const router = express.Router();

// Public routes
router.post("/register", userRegistrationValidator, register); //Working
router.post("/login", userLoginValidator, login); //Working
router.post("/forgot-password", forgotPassword); //Working
router.get("/verify-email/:token", verifyEmail); //Working
router.post("/reset-password/:resetToken", resetPassword); //Working

// Protected routes
router.post("/logout", protect, logout); //Working
router.post("/refresh-token", protect, refreshTokenHandler); //Working
router.put("/update-password",protect,passwordUpdateValidator,updatePassword); //Working

export default router;
