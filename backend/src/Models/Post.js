import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    media: {
      type: String,
    },
    type: {
      type: String,
      enum: ["trip_share", "review_share", "general", "announcement"],
      default: "general",
    },
    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },
    tags: [String],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
