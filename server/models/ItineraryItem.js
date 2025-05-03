import mongoose from 'mongoose';

const itineraryItemSchema = new mongoose.Schema({
  trip_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  activity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true, index: true },
  day: { type: Date, required: true, index: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  notes: String,
  actual_cost: Number,
  status: { type: String, enum: ['planned', 'completed'], default: 'planned' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('ItineraryItem', itineraryItemSchema); 