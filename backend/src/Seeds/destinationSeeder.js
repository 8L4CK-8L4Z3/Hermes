import mongoose from "mongoose";
import { MONGO_URI } from "../Configs/config.js";
import Destination from "../Models/Destination.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample destination data matching available images
const destinations = [
  {
    name: "Barcelona",
    description:
      "A vibrant city known for its stunning architecture, including Gaudi's masterpieces, beautiful beaches, and rich cultural heritage.",
    location: "Catalonia, Spain",
    images: [],
  },
  {
    name: "Paris",
    description:
      "The City of Light, famous for its iconic Eiffel Tower, world-class museums, charming cafes, and romantic atmosphere.",
    location: "Île-de-France, France",
    images: [],
  },
  {
    name: "Japan",
    description:
      "A fascinating blend of ancient traditions and cutting-edge technology, featuring beautiful temples, serene gardens, and modern cities.",
    location: "East Asia",
    images: [],
  },
  {
    name: "Norway",
    description:
      "A stunning Scandinavian country known for its dramatic fjords, northern lights, midnight sun, and spectacular natural beauty.",
    location: "Northern Europe",
    images: [],
  },
  {
    name: "New York",
    description:
      "The city that never sleeps, featuring iconic skyscrapers, Central Park, Broadway shows, and diverse cultural experiences.",
    location: "New York, United States",
    images: [],
  },
  {
    name: "Rome",
    description:
      "The Eternal City, home to ancient ruins like the Colosseum, Vatican City, magnificent art, and world-renowned Italian cuisine.",
    location: "Lazio, Italy",
    images: [],
  },
];

// Function to get all image files from the destinations upload directory
const getDestinationImages = () => {
  const uploadsPath = path.join(process.cwd(), "uploads", "destinations");
  try {
    const files = fs
      .readdirSync(uploadsPath)
      .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

    // Create a map of images for each destination
    const imageMap = new Map();

    files.forEach((file) => {
      const destinationName = file.split(".")[0];
      imageMap.set(destinationName, {
        url: `destinations/${file}`,
        caption: `View of ${destinationName.replace(/-/g, " ")}`,
        uploaded_at: new Date(),
        is_primary: true, // Since we have one image per destination, make it primary
      });
    });

    return imageMap;
  } catch (error) {
    console.error("Error reading destination images:", error);
    return new Map();
  }
};

// Seed the database
const seedDestinations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing destinations
    await Destination.deleteMany({});
    console.log("Cleared existing destinations");

    // Get available images
    const imageMap = getDestinationImages();

    if (imageMap.size === 0) {
      console.warn("No images found in uploads/destinations directory");
    }

    // Add images to matching destinations
    const destinationsWithImages = destinations.map((destination) => {
      const destinationImage = imageMap.get(destination.name);
      return {
        ...destination,
        images: destinationImage ? [destinationImage] : [],
      };
    });

    // Insert destinations
    await Destination.insertMany(destinationsWithImages);
    console.log("Destinations seeded successfully");

    // Log preview of created destinations
    const createdDestinations = await Destination.find({}).select(
      "name images"
    );
    console.log("\nCreated Destinations Preview:");
    console.log(JSON.stringify(createdDestinations, null, 2));
  } catch (error) {
    console.error("Error seeding destinations:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seeder
seedDestinations();
