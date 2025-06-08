import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./Utils/logger.js";
import dbConnect from "./Configs/db.js";
import { NODE_ENV, PORT, FRONTEND_URL } from "./Configs/config.js";
import { apiLimiter, authLimiter, uploadLimiter } from "./Utils/rateLimiter.js";
import { sanitizeInput } from "./Middleware/inputSanitizer.js";
import authRoutes from "./Routes/authRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import analyticsRoutes from "./Routes/analyticsRoutes.js";
import commentRoutes from "./Routes/commentRoutes.js";
import followRoutes from "./Routes/followRoutes.js";
import postRoutes from "./Routes/postRoutes.js";
import reviewRoutes from "./Routes/reviewRoutes.js";
import placeRoutes from "./Routes/placeRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";
import moderationRoutes from "./Routes/moderationRoutes.js";
import likeRoutes from "./Routes/likeRoutes.js";
import destinationRoutes from "./Routes/destinationRoutes.js";
import searchRoutes from "./Routes/searchRoutes.js";
import tripRoutes from "./Routes/tripRoutes.js";
import userRoutes from "./Routes/userRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Middleware
app.use(helmet()); // Security headers
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(
  cors({
    origin: FRONTEND_URL || "http://localhost:5743",
    credentials: true,
  })
);

// Rate limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/upload", uploadLimiter);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use(compression()); // Compress responses

// Logging
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);

if (dbConnect()) {
  logger.logInfo("Server", "Database connected");
} else {
  logger.logError("Server", "Database connection failed");
}

app.listen(PORT, () => {
  logger.logInfo("Server", `Server is running on port ${PORT}`);
});
