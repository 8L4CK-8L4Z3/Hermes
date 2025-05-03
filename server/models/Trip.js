import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  start_date: { type: Date, required: true, index: true },
  end_date: { type: Date, required: true, index: true },
  budget: Number,
  is_public: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['planning', 'active', 'completed'], default: 'planning' },
  tags: [{ type: String, index: true }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Trip', tripSchema); 