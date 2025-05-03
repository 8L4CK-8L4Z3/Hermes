import Trip from '../models/Trip.js';
import ItineraryItem from '../models/ItineraryItem.js';
import { validationResult } from 'express-validator';

export const createTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, start_date, end_date, budget, is_public, tags } = req.body;

    const trip = await Trip.create({
      user_id: req.user.id,
      title,
      description,
      start_date,
      end_date,
      budget,
      is_public,
      tags,
      status: 'planning'
    });

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tripId } = req.params;
    const updateData = req.body;

    const trip = await Trip.findOneAndUpdate(
      { _id: tripId, user_id: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findOneAndDelete({ _id: tripId, user_id: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    // Delete associated itinerary items
    await ItineraryItem.deleteMany({ trip_id: tripId });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user has access to private trip
    if (!trip.is_public && trip.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to private trip' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, is_public } = req.query;

    const query = { user_id: req.user.id };
    if (status) query.status = status;
    if (is_public !== undefined) query.is_public = is_public;

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

export const updateTripStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;

    if (!['planning', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const trip = await Trip.findOneAndUpdate(
      { _id: tripId, user_id: req.user.id },
      { $set: { status } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTripVisibility = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { is_public } = req.body;

    const trip = await Trip.findOneAndUpdate(
      { _id: tripId, user_id: req.user.id },
      { $set: { is_public } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getItinerary = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if trip exists and user has access
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // If trip is private, check if user is the owner
    if (!trip.is_public && (!req.user || trip.user_id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized access to private trip itinerary' });
    }

    // Get itinerary items sorted by date and time
    const itineraryItems = await ItineraryItem.find({ trip_id: id })
      .sort({ date: 1, start_time: 1 })
      .populate('activity_id')
      .exec();

    // Group items by date
    const groupedItinerary = itineraryItems.reduce((acc, item) => {
      const dateKey = item.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {});

    res.json({
      trip_id: id,
      itinerary: groupedItinerary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};