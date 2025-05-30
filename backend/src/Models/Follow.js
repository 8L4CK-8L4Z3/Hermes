import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    follower_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique follows
followSchema.index({ user_id: 1, follower_id: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);

export default Follow;
