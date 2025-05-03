import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Experience from '../models/Experience.js';
import { validationResult } from 'express-validator';

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, bio } = req.body;
    const userId = req.user.id;

    // Check if username is taken if it's being updated
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { username, bio } },
      { new: true, runValidators: true }
    ).select('-password_hash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Assuming file upload is handled by multer and processed by sharp
    const imageUrl = req.file.path; // This would be the processed image path

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profile_picture: imageUrl } },
      { new: true }
    ).select('-password_hash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user_id: userId };
    if (status) {
      query.status = status;
    }

    const trips = await Trip.find(query)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Trip.countDocuments(query);

    res.json({
      trips,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserExperiences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const experiences = await Experience.find({ 
      user_id: userId,
      is_public: true 
    })
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Experience.countDocuments({ 
      user_id: userId,
      is_public: true 
    });

    res.json({
      experiences,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserStatistics = async (req, res) => {
  try {
    const { userId } = req.params;

    const [tripCount, experienceCount, publicExperienceCount] = await Promise.all([
      Trip.countDocuments({ user_id: userId }),
      Experience.countDocuments({ user_id: userId }),
      Experience.countDocuments({ user_id: userId, is_public: true })
    ]);

    res.json({
      tripCount,
      experienceCount,
      publicExperienceCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user's content
    await Promise.all([
      Trip.deleteMany({ user_id: userId }),
      Experience.deleteMany({ user_id: userId })
    ]);

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 