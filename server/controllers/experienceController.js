import Experience from '../models/Experience.js';
import Media from '../models/Media.js';
import Trip from '../models/Trip.js';
import { validationResult } from 'express-validator';

export const createExperience = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { trip_id, title, content, tags, is_public } = req.body;

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: trip_id, user_id: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    const experience = await Experience.create({
      user_id: req.user.id,
      trip_id,
      title,
      content,
      tags,
      is_public
    });

    // Handle media uploads if any
    if (req.files && req.files.length > 0) {
      const mediaPromises = req.files.map(file => {
        return Media.create({
          experience_id: experience._id,
          media_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          url: file.path,
          caption: file.originalname,
          mime_type: file.mimetype
        });
      });

      await Promise.all(mediaPromises);
    }

    const populatedExperience = await Experience.findById(experience._id)
      .populate('user_id', 'username profile_picture')
      .populate('trip_id', 'title');

    res.status(201).json(populatedExperience);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { experienceId } = req.params;
    const updateData = req.body;

    const experience = await Experience.findOneAndUpdate(
      { _id: experienceId, user_id: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('user_id', 'username profile_picture')
      .populate('trip_id', 'title');

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found or unauthorized' });
    }

    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const experience = await Experience.findOneAndDelete({
      _id: experienceId,
      user_id: req.user.id
    });

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found or unauthorized' });
    }

    // Delete associated media
    await Media.deleteMany({ experience_id: experienceId });

    res.json({ message: 'Experience and associated media deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const experience = await Experience.findOne({
      _id: experienceId,
      $or: [
        { is_public: true },
        { user_id: req.user.id }
      ]
    })
      .populate('user_id', 'username profile_picture')
      .populate('trip_id', 'title')
      .populate({
        path: 'media',
        model: 'Media'
      });

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getExperiences = async (req, res) => {
  try {
    const { page = 1, limit = 10, tags, search } = req.query;

    const query = { is_public: true };
    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const experiences = await Experience.find(query)
      .populate('user_id', 'username profile_picture')
      .populate('trip_id', 'title')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Experience.countDocuments(query);

    res.json({
      experiences,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addMediaToExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Verify experience ownership
    const experience = await Experience.findOne({
      _id: experienceId,
      user_id: req.user.id
    });

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found or unauthorized' });
    }

    const mediaPromises = req.files.map(file => {
      return Media.create({
        experience_id: experienceId,
        media_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        url: file.path,
        caption: file.originalname,
        mime_type: file.mimetype
      });
    });

    const media = await Promise.all(mediaPromises);

    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeMediaFromExperience = async (req, res) => {
  try {
    const { experienceId, mediaId } = req.params;

    // Verify experience ownership
    const experience = await Experience.findOne({
      _id: experienceId,
      user_id: req.user.id
    });

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found or unauthorized' });
    }

    const media = await Media.findOneAndDelete({
      _id: mediaId,
      experience_id: experienceId
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    res.json({ message: 'Media removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTripExperiences = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // First check if trip exists and user has access
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Build query based on trip privacy
    const query = { trip_id: tripId };
    if (!trip.is_public && (!req.user || trip.user_id.toString() !== req.user.id)) {
      query.is_public = true; // Only public experiences for private trips
    }

    const experiences = await Experience.find(query)
      .populate('user_id', 'username profile_picture')
      .populate('trip_id', 'title')
      .populate({
        path: 'media',
        model: 'Media'
      })
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Experience.countDocuments(query);

    res.json({
      experiences,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};