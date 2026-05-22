import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // No /api proxy — requests go to VITE_API_URL (Vercel backend)
  },
});
