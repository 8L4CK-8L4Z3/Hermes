import ItineraryItem from '../models/ItineraryItem.js';
import Trip from '../models/Trip.js';
import Activity from '../models/Activity.js';
import { validationResult } from 'express-validator';

export const addItineraryItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { trip_id, activity_id, day, start_time, end_time, notes, actual_cost } = req.body;

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: trip_id, user_id: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    // Verify activity exists and is approved
    const activity = await Activity.findOne({ _id: activity_id, is_approved: true });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found or not approved' });
    }

    const itineraryItem = await ItineraryItem.create({
      trip_id,
      activity_id,
      day,
      start_time,
      end_time,
      notes,
      actual_cost,
      status: 'planned'
    });

    res.status(201).json(itineraryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateItineraryItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const updateData = req.body;

    // Verify ownership through trip
    const itineraryItem = await ItineraryItem.findById(itemId).populate('trip_id');
    if (!itineraryItem || itineraryItem.trip_id.user_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Itinerary item not found or unauthorized' });
    }

    const updatedItem = await ItineraryItem.findByIdAndUpdate(
      itemId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteItineraryItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Verify ownership through trip
    const itineraryItem = await ItineraryItem.findById(itemId).populate('trip_id');
    if (!itineraryItem || itineraryItem.trip_id.user_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Itinerary item not found or unauthorized' });
    }

    await ItineraryItem.findByIdAndDelete(itemId);

    res.json({ message: 'Itinerary item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTripItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { day } = req.query;

    // Verify trip access
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!trip.is_public && trip.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to private trip' });
    }

    const query = { trip_id: tripId };
    if (day) {
      query.day = day;
    }

    const itineraryItems = await ItineraryItem.find(query)
      .sort({ day: 1, start_time: 1 })
      .populate('activity_id');

    res.json(itineraryItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateItineraryItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    if (!['planned', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Verify ownership through trip
    const itineraryItem = await ItineraryItem.findById(itemId).populate('trip_id');
    if (!itineraryItem || itineraryItem.trip_id.user_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Itinerary item not found or unauthorized' });
    }

    itineraryItem.status = status;
    await itineraryItem.save();

    res.json(itineraryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};