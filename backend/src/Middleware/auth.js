import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../Configs/config.js";
import User from "../Models/User.js";
import { errorResponse, HTTP_STATUS } from "../Utils/responses.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie or Authorization header
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, {
        code: HTTP_STATUS.UNAUTHORIZED,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return errorResponse(res, {
          code: HTTP_STATUS.UNAUTHORIZED,
          message: "User not found",
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return errorResponse(res, {
        code: HTTP_STATUS.UNAUTHORIZED,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Error in authentication middleware",
      error: error.message,
    });
  }
};

export const isModerator = (req, res, next) => {
  if (!req.user.isMod) {
    return errorResponse(res, {
      code: HTTP_STATUS.FORBIDDEN,
      message: "Access denied. Moderator role required.",
    });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return errorResponse(res, {
      code: HTTP_STATUS.FORBIDDEN,
      message: "Access denied. Admin role required.",
    });
  }
  next();
};
