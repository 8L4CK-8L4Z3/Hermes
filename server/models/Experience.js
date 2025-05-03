import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  trip_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String, index: true }],
  is_public: { type: Boolean, default: true },
  like_count: { type: Number, default: 0 },
  comment_count: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Experience', experienceSchema); 