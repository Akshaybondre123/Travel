import express from 'express';
import Itinerary from '../models/Itinerary.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';
import { generateItinerary } from '../services/gemini.js';
import { fallbackItinerary } from '../services/fallbackAi.js';

const router = express.Router();

function normalizeDays(days) {
  if (!Array.isArray(days)) return [];
  return days.map((day) => {
    let activities = day.activities;
    if (typeof activities === 'string') {
      try {
        activities = JSON.parse(activities.replace(/'/g, '"'));
      } catch {
        activities = [];
      }
    }
    if (!Array.isArray(activities)) activities = [];

    return {
      date: String(day.date || ''),
      title: String(day.title || ''),
      activities: activities.map((a) => ({
        time: String(a?.time || ''),
        title: String(a?.title || ''),
        description: String(a?.description || ''),
        location: String(a?.location || ''),
        type: String(a?.type || 'other'),
      })),
    };
  });
}

router.get('/share/:shareId', async (req, res) => {
  const itinerary = await Itinerary.findOne({
    shareId: req.params.shareId,
    isPublic: true,
  }).populate('user', 'name');
  if (!itinerary) return res.status(404).json({ message: 'Shared itinerary not found' });
  res.json(itinerary);
});

router.use(protect);

router.get('/', async (req, res) => {
  const itineraries = await Itinerary.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('bookings');
  res.json(itineraries);
});

router.get('/:id', async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('bookings');
  if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
  res.json(itinerary);
});

router.post('/generate', async (req, res) => {
  try {
    const { bookingIds } = req.body;
    if (!bookingIds?.length) {
      return res.status(400).json({ message: 'Select at least one booking' });
    }

    const bookings = await Booking.find({
      _id: { $in: bookingIds },
      user: req.user._id,
      status: 'extracted',
    });

    if (!bookings.length) {
      return res.status(400).json({
        message: 'No extracted bookings found. Wait for processing to finish.',
      });
    }

    const ai = await generateItinerary(bookings);
    let days = normalizeDays(ai.days);
    const valid =
      days.length > 0 &&
      days.every((d) => d.activities.length > 0 && d.activities.every((a) => a.title));
    if (!valid) days = normalizeDays(fallbackItinerary(bookings).days);

    const itinerary = await Itinerary.create({
      user: req.user._id,
      title: ai.title || 'My Trip',
      destination: ai.destination,
      startDate: ai.startDate ? new Date(ai.startDate) : undefined,
      endDate: ai.endDate ? new Date(ai.endDate) : undefined,
      summary: ai.summary,
      days,
      tips: ai.tips || [],
      rawContent: ai,
      bookings: bookings.map((b) => b._id),
    });

    res.status(201).json(itinerary);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Itinerary generation failed' });
  }
});

router.patch('/:id/share', async (req, res) => {
  const { isPublic } = req.body;
  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isPublic: isPublic !== false },
    { new: true }
  );
  if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
  res.json(itinerary);
});

router.delete('/:id', async (req, res) => {
  const itinerary = await Itinerary.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
  res.json({ message: 'Deleted' });
});

export default router;
