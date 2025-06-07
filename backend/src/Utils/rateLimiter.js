import rateLimit from "express-rate-limit";
import {
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX,
  RATE_LIMIT_MESSAGE,
} from "../Configs/config.js";

export const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  limit: RATE_LIMIT_MAX,
  message: RATE_LIMIT_MESSAGE,
});
