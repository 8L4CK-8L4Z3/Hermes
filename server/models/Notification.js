import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, index: true },
  content: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  action_url: String
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Notification', notificationSchema); 