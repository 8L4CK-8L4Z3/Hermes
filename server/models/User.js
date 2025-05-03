import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true },
  username: { type: String, required: true, unique: true, index: true },
  profile_picture: String,
  bio: String,
  is_admin: { type: Boolean, default: false },
  roles: [{ type: String }],
  last_login: { type: Date, index: true },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('User', userSchema); 