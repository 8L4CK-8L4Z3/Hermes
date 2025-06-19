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
import {
  apiLimiter,
  authLimiter,
  uploadLimiter,
} from "./Middleware/rateLimiter.js";

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
import activityRoutes from "./Routes/activityRoutes.js";
import uploadRoutes from "./Routes/uploadRoutes.js";

dbConnect();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allow cross-origin resource sharing
    crossOriginEmbedderPolicy: false, // Allow embedding resources
  })
);
app.use(hpp());

// CORS configuration
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
app.use(compression());

// Logging
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

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
app.use("/api/activities", activityRoutes);

// Upload routes (separate from API routes)
app.use(
  "/api/upload",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader(
      "Access-Control-Allow-Origin",
      FRONTEND_URL || "http://localhost:5743"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
  },
  uploadRoutes
);

// Serve static files from the uploads directory
app.use(
  "/api/upload",
  express.static(path.join(process.cwd(), "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader(
        "Access-Control-Allow-Origin",
        FRONTEND_URL || "http://localhost:5743"
      );
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year cache
    },
  })
);

// Global error handler
app.use((err, req, res, next) => {
  logger.logError("Server", "Unhandled error:", {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    user: req.user,
  });

  res.status(500).json({
    success: false,
    message: NODE_ENV === "development" ? err.message : "Internal server error",
    error:
      NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
            details: err,
          }
        : undefined,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

const server = app.listen(PORT, () => {
  logger.logInfo(
    "Server",
    `Server is running on link http://localhost:${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.logError("Server", "Unhandled Rejection:", err);
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.logError("Server", "Uncaught Exception:", err);
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});
