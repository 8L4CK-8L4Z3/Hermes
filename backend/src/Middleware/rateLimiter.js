import rateLimit from "express-rate-limit";
import {
  API_RATE_LIMIT_WINDOW,
  API_RATE_LIMIT_MAX,
  API_RATE_LIMIT_MESSAGE,
  AUTH_RATE_LIMIT_WINDOW,
  AUTH_RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_MESSAGE,
  UPLOAD_RATE_LIMIT_WINDOW,
  UPLOAD_RATE_LIMIT_MAX,
  UPLOAD_RATE_LIMIT_MESSAGE,
} from "../Configs/config.js";

export const apiLimiter = rateLimit({
  windowMs: API_RATE_LIMIT_WINDOW,
  limit: API_RATE_LIMIT_MAX,
  message: API_RATE_LIMIT_MESSAGE,
});

export const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW,
  limit: AUTH_RATE_LIMIT_MAX,
  message: AUTH_RATE_LIMIT_MESSAGE,
});

export const uploadLimiter = rateLimit({
  windowMs: UPLOAD_RATE_LIMIT_WINDOW,
  limit: UPLOAD_RATE_LIMIT_MAX,
  message: UPLOAD_RATE_LIMIT_MESSAGE,
});
