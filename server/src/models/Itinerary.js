import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const itinerarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    destination: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    summary: { type: String },
    days: [
      {
        date: String,
        title: String,
        activities: [
          {
            time: String,
            title: String,
            description: String,
            location: String,
            type: { type: String },
          },
        ],
      },
    ],
    tips: [String],
    rawContent: { type: mongoose.Schema.Types.Mixed },
    isFallback: { type: Boolean, default: false },
    shareId: { type: String, unique: true, default: () => nanoid(12) },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Itinerary', itinerarySchema);
