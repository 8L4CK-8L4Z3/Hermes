import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  experience_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true, index: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// Compound index to ensure one like per user per experience
likeSchema.index({ user_id: 1, experience_id: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema); 