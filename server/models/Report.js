import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  report_type: { type: String, required: true, index: true },
  target_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  target_type: { type: String, required: true, index: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Report', reportSchema); 