import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import {
  JWT_SECRET,
  JWT_EXPIRE,
  JWT_COOKIE_EXPIRE,
  NODE_ENV,
} from "../Configs/config.js";

export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    const newToken = generateToken(user._id);

    const cookieExpire = parseInt(JWT_COOKIE_EXPIRE) || 8; // Default to 8 days if not set
    res.cookie("token", newToken, {
      httpOnly: true,
      expires: new Date(Date.now() + cookieExpire * 60 * 60 * 1000),
      secure: NODE_ENV === "production",
      sameSite: "strict",
    });

    return newToken;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
};
