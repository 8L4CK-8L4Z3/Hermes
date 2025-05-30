import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET, JWT_EXPIRE } from "../Configs/config.js";
import { errorHandler, successHandler } from "./reponseHandlers.js";

const generateToken = (userId) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
  return token;
};

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorHandler(res, 401, "Unauthorized - No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return errorHandler(res, 401, "Unauthorized - User not found");
    }

    // Check if token matches stored refresh token
    if (token !== user.refreshToken) {
      return errorHandler(res, 401, "Unauthorized - Invalid token");
    }

    // Add user ID to request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorHandler(res, 401, "Token expired");
    }
    return errorHandler(res, 401, "Invalid token");
  }
};

const refreshToken = async (req, res) => {
  try {
    const userId = req.userId;

    // Generate new token
    const newToken = generateToken(userId);

    // Update user's refresh token
    await User.findByIdAndUpdate(userId, { refreshToken: newToken });

    successHandler(res, 200, "Token refreshed successfully", {
      token: newToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    errorHandler(res, 500, "Server error");
  }
};

export { generateToken, verifyToken, refreshToken };
