import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  country: { type: String, required: true, index: true },
  city: { type: String, required: true, index: true },
  latitude: Number,
  longitude: Number,
  description: String,
  image_url: String,
  is_approved: { type: Boolean, default: false, index: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating_avg: { type: Number, default: 0 },
  rating_count: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Destination', destinationSchema); 