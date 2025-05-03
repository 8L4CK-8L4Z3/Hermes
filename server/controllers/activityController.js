import Activity from '../models/Activity.js';
import Destination from '../models/Destination.js';
import { validationResult } from 'express-validator';

export const createActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { destination_id, name, description, category, price, duration } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    // Verify destination exists and is approved
    const destination = await Destination.findOne({ _id: destination_id, is_approved: true });
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found or not approved' });
    }

    const activity = await Activity.create({
      destination_id,
      name,
      description,
      category,
      price,
      duration,
      image_url: imageUrl,
      created_by: req.user.id,
      is_approved: req.user.is_admin // Auto-approve if admin
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { activityId } = req.params;
    const updateData = req.body;

    if (req.file) {
      updateData.image_url = req.file.path;
    }

    // Only admins or original creator can update
    const activity = await Activity.findOneAndUpdate(
      {
        _id: activityId,
        $or: [
          { created_by: req.user.id },
          { $expr: { $eq: [true, req.user.is_admin] } }
        ]
      },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found or unauthorized' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    // Only admins or original creator can delete
    const activity = await Activity.findOneAndDelete({
      _id: activityId,
      $or: [
        { created_by: req.user.id },
        { $expr: { $eq: [true, req.user.is_admin] } }
      ]
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found or unauthorized' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findOne({
      _id: id,
      $or: [
        { is_approved: true },
        { created_by: req?.user?.id },
        { $expr: { $eq: [true, req?.user?.is_admin] } }
      ]
    }).populate('destination_id');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, destination_id, category, search } = req.query;

    const query = { is_approved: true };
    if (destination_id) query.destination_id = destination_id;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const activities = await Activity.find(query)
      .populate('destination_id')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Activity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const approveActivity = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { activityId } = req.params;

    const activity = await Activity.findByIdAndUpdate(
      activityId,
      { $set: { is_approved: true } },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPendingActivities = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { page = 1, limit = 10 } = req.query;

    const activities = await Activity.find({ is_approved: false })
      .populate('destination_id')
      .populate('created_by', 'username email')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Activity.countDocuments({ is_approved: false });

    res.json({
      activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 