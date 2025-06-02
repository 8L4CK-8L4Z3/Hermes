import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import { JWT_SECRET, JWT_EXPIRE } from "../Configs/config.js";
import { errorResponse, successResponse, HTTP_STATUS } from "./responses.js";

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

    res.cookie("token", newToken, {
      httpOnly: true,
      expires: new Date(Date.now() + JWT_EXPIRE * 24 * 60 * 60 * 1000),
    });

    return newToken;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
