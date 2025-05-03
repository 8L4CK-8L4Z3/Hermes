import Destination from '../models/Destination.js';
import Activity from '../models/Activity.js';
import { validationResult } from 'express-validator';

export const createDestination = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, country, city, latitude, longitude, description } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const destination = await Destination.create({
      name,
      country,
      city,
      latitude,
      longitude,
      description,
      image_url: imageUrl,
      created_by: req.user.id,
      is_approved: req.user.is_admin // Auto-approve if admin
    });

    res.status(201).json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateDestination = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { destinationId } = req.params;
    const updateData = req.body;

    if (req.file) {
      updateData.image_url = req.file.path;
    }

    // Only admins or original creator can update
    const destination = await Destination.findOneAndUpdate(
      {
        _id: destinationId,
        $or: [
          { created_by: req.user.id },
          { $expr: { $eq: [true, req.user.is_admin] } }
        ]
      },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found or unauthorized' });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    // Only admins or original creator can delete
    const destination = await Destination.findOneAndDelete({
      _id: destinationId,
      $or: [
        { created_by: req.user.id },
        { $expr: { $eq: [true, req.user.is_admin] } }
      ]
    });

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found or unauthorized' });
    }

    // Delete associated activities
    await Activity.deleteMany({ destination_id: destinationId });

    res.json({ message: 'Destination and associated activities deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findOne({
      _id: id,
      $or: [
        { is_approved: true },
        { created_by: req?.user?.id },
        { $expr: { $eq: [true, req?.user?.is_admin] } }
      ]
    });

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDestinations = async (req, res) => {
  try {
    const { page = 1, limit = 10, country, city, search } = req.query;

    const query = { is_approved: true };
    if (country) query.country = country;
    if (city) query.city = city;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const destinations = await Destination.find(query)
      .sort({ rating_avg: -1, rating_count: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Destination.countDocuments(query);

    res.json({
      destinations,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const approveDestination = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { destinationId } = req.params;

    const destination = await Destination.findByIdAndUpdate(
      destinationId,
      { $set: { is_approved: true } },
      { new: true }
    );

    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPendingDestinations = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { page = 1, limit = 10 } = req.query;

    const destinations = await Destination.find({ is_approved: false })
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('created_by', 'username email')
      .exec();

    const count = await Destination.countDocuments({ is_approved: false });

    res.json({
      destinations,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 