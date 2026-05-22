import express from 'express';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';
import { upload, getFileUrl, getStorageKey } from '../middleware/upload.js';
import { extractFromDocument } from '../services/gemini.js';
import { isServerless } from '../config/runtime.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(bookings);
});

router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = getFileUrl(req.file);
    const localPath = req.file.path || null;
    const storageKey = getStorageKey(req.file);

    const booking = await Booking.create({
      user: req.user._id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileUrl,
      storageKey,
      status: 'processing',
    });

    if (isServerless) {
      await processBooking(booking);
      const updated = await Booking.findById(booking._id);
      return res.status(201).json(updated);
    }

    res.status(201).json(booking);
    processBooking(booking).catch(console.error);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

async function processBooking(booking) {
  try {
    const extracted = await extractFromDocument({
      mimeType: booking.mimeType,
      fileUrl: booking.fileUrl,
      storageKey: booking.storageKey,
    });
    await Booking.findByIdAndUpdate(booking._id, {
      extractedData: extracted,
      documentType: extracted.documentType || 'other',
      status: 'extracted',
      errorMessage: undefined,
    });
  } catch (err) {
    await Booking.findByIdAndUpdate(booking._id, {
      status: 'failed',
      errorMessage: err.message,
    });
  }
}

router.post('/:id/retry', async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  await Booking.findByIdAndUpdate(booking._id, { status: 'processing', errorMessage: undefined });
  if (isServerless) {
    await processBooking(booking);
    const updated = await Booking.findById(booking._id);
    return res.json(updated);
  }

  res.json({ message: 'Reprocessing started' });
  processBooking(booking).catch(console.error);
});

router.get('/:id', async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
});

router.delete('/:id', async (req, res) => {
  const booking = await Booking.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json({ message: 'Deleted' });
});

export default router;
