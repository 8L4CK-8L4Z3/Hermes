import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  experience_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true, index: true },
  media_type: { type: String, required: true, index: true },
  url: { type: String, required: true },
  caption: String,
  mime_type: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Media', mediaSchema); 