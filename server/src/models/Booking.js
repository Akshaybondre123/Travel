import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    storageKey: { type: String },
    documentType: {
      type: String,
      enum: ['flight', 'hotel', 'train', 'bus', 'other'],
      default: 'other',
    },
    extractedData: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'extracted', 'failed'],
      default: 'uploaded',
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
