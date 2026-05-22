import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const activitySchema = new mongoose.Schema(
  {
    time: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    type: { type: String, default: 'other' },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    date: { type: String, default: '' },
    title: { type: String, default: '' },
    activities: { type: [activitySchema], default: [] },
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    destination: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    summary: { type: String },
    days: { type: [daySchema], default: [] },
    tips: [String],
    rawContent: { type: mongoose.Schema.Types.Mixed },
    shareId: { type: String, unique: true, default: () => nanoid(12) },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Itinerary', itinerarySchema);
