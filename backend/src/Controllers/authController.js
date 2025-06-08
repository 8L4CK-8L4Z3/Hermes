import User from "../Models/User.js";
import { generateToken, refreshToken } from "../Utils/token.js";
import {
  successResponse,
  errorResponse,
  asyncHandler,
} from "../Utils/responses.js";
import { JWT_COOKIE_EXPIRE } from "../Configs/config.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../Utils/email.js";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return errorResponse(res, {
        code: HTTP_STATUS.CONFLICT,
        message: "User already exists",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash,
      verificationToken: crypto.randomBytes(32).toString("hex"),
    });

    // Generate token
    const token = generateToken(user._id);

    // Send verification email
    await sendVerificationEmail(user.email, user.verificationToken);

    // Set cookie
    const cookieExpire = parseInt(JWT_COOKIE_EXPIRE) || 8; // Default to 8 days if not set
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return successResponse(res, {
      code: HTTP_STATUS.CREATED,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Error registering user",
      error: error.message,
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, {
        code: HTTP_STATUS.UNAUTHORIZED,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, {
        code: HTTP_STATUS.UNAUTHORIZED,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Set cookie
    const cookieExpire = parseInt(JWT_COOKIE_EXPIRE) || 8; // Default to 8 days if not set
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
    });

    return successResponse(res, {
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Error logging in",
      error: error.message,
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  try {
    // Clear cookie
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    return successResponse(res, {
      message: "Logged out successfully",
    });
  } catch (error) {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Error logging out",
      error: error.message,
    });
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Private
export const refreshTokenHandler = asyncHandler(async (req, res) => {
  try {
    const newToken = await refreshToken(req, res);
    return successResponse(res, {
      message: "Token refreshed successfully",
      data: { token: newToken },
    });
  } catch (error) {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Error refreshing token",
      error: error.message,
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, {
        code: HTTP_STATUS.NOT_FOUND,
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email
    await sendPasswordResetEmail(user.email, resetToken);

    return successResponse(res, {
      message: "Password reset email sent",
    });
  } catch (error) {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Error sending reset email",
      error: error.message,
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, {
        code: HTTP_STATUS.BAD_REQUEST,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return successResponse(res, {
      message: "Password reset successful",
    });
  } catch (error) {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Error resetting password",
      error: error.message,
    });
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return errorResponse(res, {
        code: HTTP_STATUS.BAD_REQUEST,
        message: "Invalid verification token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return successResponse(res, {
      message: "Email verified successfully",
    });
  } catch (error) {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Error verifying email",
      error: error.message,
    });
  }
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, {
        code: HTTP_STATUS.UNAUTHORIZED,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return successResponse(res, {
      message: "Password updated successfully",
    });
  } catch (error) {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Error updating password",
      error: error.message,
    });
  }
});
