import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target_type: {
      type: String,
      required: true,
      enum: ["Post", "Comment", "Review"],
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "target_type",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique likes
likeSchema.index(
  { user_id: 1, target_type: 1, target_id: 1 },
  { unique: true }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;
