import mongoose from "mongoose";

const moderationLogSchema = new mongoose.Schema(
  {
    moderator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    target_type: {
      type: String,
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ModerationLog = mongoose.model("ModerationLog", moderationLogSchema);

export default ModerationLog;
