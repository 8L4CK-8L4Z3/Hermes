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
