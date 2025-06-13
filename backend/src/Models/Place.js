import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    destination_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          default: "",
        },
        uploaded_at: {
          type: Date,
          default: Date.now,
        },
        is_primary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    average_rating: {
      type: Number,
      default: 0,
    },
    price_range: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
    },
    opening_hours: {
      type: String,
      required: [true, "Opening hours are required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Place = mongoose.model("Place", placeSchema);

export default Place;
