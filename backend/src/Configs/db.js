import mongoose from "mongoose";
import { MONGO_URI } from "./config.js";
import logger from "../Utils/logger.js";
import { asyncHandler } from "../Utils/responses.js";

const NAMESPACE = "DB";

const dbConnect = asyncHandler(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.logInfo(NAMESPACE, "Connected to MongoDB");
  } catch (error) {
    logger.logError(NAMESPACE, "Failed to connect to MongoDB", error);
    process.exit(1);
  }
});

export default dbConnect;
