import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import routes from "./routes/index.js";
import { rateLimiter } from "./utils/rateLimiter.js";
import requestLogger, { logger } from "./utils/logger.js";
import dbConnect from "./config/database.js";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middleware/error.js";
import morgan from "morgan";

dotenv.config();

// Connect to database
dbConnect();

const app = express();

const isDev = process.env.NODE_ENV === "development";

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request logging
if (isDev) {
  app.use(requestLogger(isDev));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// Apply rate limiting to API routes
app.use("/api", rateLimiter);

// Mount API routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Handle 404 errors
app.use(notFound);

// Global error handler
app.use(errorHandler);

try {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    if (isDev) {
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    }
  });
} catch (error) {
  logger.error(`Error starting server: ${error.message}`);
  process.exit(1);
}

export default app;