import dotenv from "dotenv";

dotenv.config();

export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRE = process.env.JWT_EXPIRE;
export const JWT_COOKIE_EXPIRE = process.env.JWT_COOKIE_EXPIRE;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
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
export const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW;
export const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX;
export const RATE_LIMIT_MESSAGE = process.env.RATE_LIMIT_MESSAGE;
