import mongoose from "mongoose";
import Place from "../Models/Place.js";
import placesSeedData from "./placesSeedData.js";
import dbConnect from "../Configs/db.js";
import logger from "../Utils/logger.js";

const NAMESPACE = "PlaceSeeder";

const seedPlaces = async () => {
  try {
    // Connect to database
    await dbConnect();
    logger.logInfo(NAMESPACE, "Connected to database");

    // Delete existing places
    await Place.deleteMany({});
    logger.logInfo(NAMESPACE, "Cleared existing places data");

    // Insert new places
    const places = await Place.insertMany(placesSeedData);
    logger.logInfo(NAMESPACE, `Successfully seeded ${places.length} places`);

    // Disconnect from database
    await mongoose.disconnect();
    logger.logInfo(NAMESPACE, "Disconnected from database");

    process.exit(0);
  } catch (error) {
    logger.logError(NAMESPACE, "Error seeding places", error);
    process.exit(1);
  }
};

// Run seeder
seedPlaces();
