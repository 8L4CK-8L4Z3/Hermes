import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true, index: true },
  preference_value: { type: String, required: true }
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

// Compound index to ensure unique preferences per user per category
userPreferenceSchema.index({ user_id: 1, category: 1 }, { unique: true });

export default mongoose.model('UserPreference', userPreferenceSchema); 