import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    metrics: {
      newUsers: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      newTrips: { type: Number, default: 0 },
      newReviews: { type: Number, default: 0 },
      newPosts: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
    },
    popularDestinations: [
      {
        destination_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Destination",
        },
        views: Number,
        saves: Number,
      },
    ],
    popularPlaces: [
      {
        place_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Place",
        },
        views: Number,
        reviews: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
