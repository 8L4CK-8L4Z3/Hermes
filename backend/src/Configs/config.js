import dotenv from "dotenv";

dotenv.config();

export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRE = process.env.JWT_EXPIRE || "15m";
export const JWT_COOKIE_EXPIRE = process.env.JWT_COOKIE_EXPIRE || "7d";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const FRONTEND_URL = process.env.FRONTEND_URL;

// Email Configuration
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_SECURE = process.env.SMTP_SECURE === "true";
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME;
export const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS;

// Rate Limiter Configuration
export const API_RATE_LIMIT_WINDOW = process.env.API_RATE_LIMIT_WINDOW;
export const API_RATE_LIMIT_MAX = process.env.API_RATE_LIMIT_MAX;
export const API_RATE_LIMIT_MESSAGE = process.env.API_RATE_LIMIT_MESSAGE;
export const AUTH_RATE_LIMIT_WINDOW = process.env.AUTH_RATE_LIMIT_WINDOW;
export const AUTH_RATE_LIMIT_MAX = process.env.AUTH_RATE_LIMIT_MAX;
export const AUTH_RATE_LIMIT_MESSAGE = process.env.AUTH_RATE_LIMIT_MESSAGE;
export const UPLOAD_RATE_LIMIT_WINDOW = process.env.UPLOAD_RATE_LIMIT_WINDOW;
export const UPLOAD_RATE_LIMIT_MAX = process.env.UPLOAD_RATE_LIMIT_MAX;
export const UPLOAD_RATE_LIMIT_MESSAGE = process.env.UPLOAD_RATE_LIMIT_MESSAGE;

// Redis Configuration
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
