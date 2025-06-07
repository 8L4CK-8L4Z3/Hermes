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
      enum: ["report", "remove", "warn", "ignore", "ban_user", "unban_user"],
    },
    target_type: {
      type: String,
      required: true,
      enum: ["review", "post", "comment", "user"],
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "target_type",
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    resolution: {
      action: {
        type: String,
        enum: ["remove", "warn", "ignore"],
      },
      note: String,
      moderator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      date: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
moderationLogSchema.index({ status: 1, createdAt: -1 });
moderationLogSchema.index({ moderator_id: 1, createdAt: -1 });
moderationLogSchema.index({ target_type: 1, target_id: 1 });

const ModerationLog = mongoose.model("ModerationLog", moderationLogSchema);

export default ModerationLog;
