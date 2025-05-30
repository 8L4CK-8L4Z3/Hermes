import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    start_date: {
      type: Date,
      required: [true, "Start date is required"],
    },
    end_date: {
      type: Date,
      required: [true, "End date is required"],
    },
    destinations: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["planning", "ongoing", "completed", "cancelled"],
      default: "planning",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    budget: {
      amount: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
    activities: [
      {
        place_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Place",
        },
        date: Date,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
