import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import itineraryRoutes from './routes/itineraries.js';
import { isServerless } from './config/runtime.js';

const app = express();

const staticOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
].filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (staticOrigins.includes(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (/^https:\/\/[\w-]+(-[\w-]+)*\.vercel\.app$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (isOriginAllowed(origin)) {
        return callback(null, origin);
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err);
    res.status(503).json({ message: 'Database unavailable' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    serverless: isServerless,
    storage: process.env.AWS_S3_BUCKET ? 's3' : 'local',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/itineraries', itineraryRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;
