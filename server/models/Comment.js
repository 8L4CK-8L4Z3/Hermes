import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  experience_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true, index: true },
  content: { type: String, required: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', index: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Comment', commentSchema); 