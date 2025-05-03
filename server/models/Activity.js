import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  destination_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true, index: true },
  name: { type: String, required: true, index: true },
  description: String,
  category: { type: String, required: true, index: true },
  price: Number,
  duration: String,
  image_url: String,
  is_approved: { type: Boolean, default: false, index: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Activity', activitySchema); 