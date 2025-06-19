import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    popularity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number, // in hours
      required: true,
      min: 0.5,
    },
    difficulty: {
      type: String,
      enum: ["easy", "moderate", "challenging", "expert"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "adventure",
        "culture",
        "nature",
        "sports",
        "photography",
        "food",
        "relaxation",
      ],
    },
    maxGroupSize: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSeasons: [
      {
        type: String,
        enum: ["spring", "summer", "fall", "winter"],
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
