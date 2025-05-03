import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema({
  user_id_1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  user_id_2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// Compound index to ensure unique friendships
friendshipSchema.index({ user_id_1: 1, user_id_2: 1 }, { unique: true });

export default mongoose.model('Friendship', friendshipSchema); 