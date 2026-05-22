import app from './app.js';
import { connectDB } from './config/db.js';
import { isServerless } from './config/runtime.js';

const PORT = process.env.PORT || 5000;

async function start() {
  if (isServerless) {
    console.error('Use Vercel serverless entry (api/index.js), not src/index.js');
    process.exit(1);
  }

  await connectDB();

  try {
    const Booking = (await import('./models/Booking.js')).default;
    const result = await Booking.updateMany(
      { status: 'processing' },
      { status: 'failed', errorMessage: 'Interrupted by server restart' }
    );
    if (result.modifiedCount > 0) {
      console.log(`Reset ${result.modifiedCount} stuck processing bookings.`);
    }
  } catch (err) {
    console.error('Failed to clean up stuck bookings:', err);
  }

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
