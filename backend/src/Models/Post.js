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
      trim: true,
      maxLength: [1000, "Content must be less than 1000 characters"],
    },
    media: {
      type: [String],
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty array
          return v.every((url) => {
            try {
              new URL(url);
              return true;
            } catch (e) {
              return false;
            }
          });
        },
        message: "Media must be valid URLs",
      },
      default: [],
    },
    type: {
      type: String,
      enum: {
        values: ["trip_share", "review_share", "general", "announcement"],
        message: "Invalid post type",
      },
      default: "general",
    },
    visibility: {
      type: String,
      enum: {
        values: ["public", "followers", "private"],
        message: "Invalid visibility setting",
      },
      default: "public",
    },
    tags: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
    },
    likes_count: {
      type: Number,
      default: 0,
    },
    comments_count: {
      type: Number,
      default: 0,
    },
    liked_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add indexes for better query performance
postSchema.index({ user_id: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
