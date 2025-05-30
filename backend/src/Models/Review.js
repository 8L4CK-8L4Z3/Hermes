import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
    },
    photos: [
      {
        url: String,
        caption: String,
        uploaded_at: Date,
      },
    ],
    helpful_votes: {
      count: { type: Number, default: 0 },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    visit_date: Date,
    categories: {
      cleanliness: Number,
      service: Number,
      value: Number,
      atmosphere: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
