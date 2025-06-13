import mongoose from "mongoose";
import { MONGO_URI } from "../Configs/config.js";
import Analytics from "../Models/Analytics.js";
import Destination from "../Models/Destination.js";

const seedAnalytics = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing analytics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.deleteMany({ date: today });
    console.log("Cleared existing analytics for today");

    // Get all destinations
    const destinations = await Destination.find({});

    if (destinations.length === 0) {
      console.warn(
        "No destinations found. Please run the destination seeder first."
      );
      return;
    }

    // Create popular destinations data with varying view counts
    const popularDestinations = destinations.map((destination, index) => ({
      destination_id: destination._id,
      views: Math.floor(1000 - index * 100 + Math.random() * 200), // Decreasing views for each destination
      saves: Math.floor(500 - index * 50 + Math.random() * 100), // Decreasing saves for each destination
    }));

    // Create analytics document
    const analytics = await Analytics.create({
      date: today,
      metrics: {
        newUsers: 150,
        activeUsers: 500,
        newTrips: 75,
        newReviews: 120,
        newPosts: 200,
        totalLikes: 850,
        totalComments: 430,
      },
      popularDestinations,
    });

    console.log("Analytics seeded successfully");

    // Log preview of created analytics
    const createdAnalytics = await Analytics.findById(analytics._id)
      .populate("popularDestinations.destination_id")
      .select("date popularDestinations");

    console.log("\nCreated Analytics Preview:");
    console.log(JSON.stringify(createdAnalytics, null, 2));
  } catch (error) {
    console.error("Error seeding analytics:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seeder
seedAnalytics();
