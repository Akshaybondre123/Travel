/**
 * Vercel serverless entry — do not use src/index.js on Vercel.
 * All HTTP traffic is rewritten here; Express app handles /api/* routes.
 */
import app from '../src/app.js';

export default app;
