import express from "express";
import logger from "./Utils/logger.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dbConnect from "./Configs/db.js";
import { NODE_ENV } from "./Configs/config.js";
import authRoutes from "./Routes/authRoutes.js";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(helmet());

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

if (dbConnect()) {
  logger.logInfo("Server", "Database connected");
} else {
  logger.logError("Server", "Database connection failed");
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.logInfo("Server", `Server is running on port ${PORT}`);
});
