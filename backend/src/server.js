import express from "express";
import dotenv from "dotenv";
import logger from "./Utils/logger.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dbConnect from "./Configs/db.js";
import { NODE_ENV } from "./Configs/config.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(helmet());

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

if (dbConnect()) {
  logger.logInfo("Server", "Database connected");
} else {
  logger.logError("Server", "Database connection failed");
}
