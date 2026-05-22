# TripForge

Upload travel tickets (PDF or images). The app reads them with AI and turns them into a day-by-day itinerary you can share.

**Live:** frontend on Vercel · API at `https://travel-forge11.vercel.app`

## Run locally

**API**

```bash
cd server
npm install
cp .env.example .env
# add MongoDB, JWT, Gemini, AWS keys
npm run dev
```

**Web app**

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

By default the client uses the deployed API. For a local API, create `client/.env.local`:

```
VITE_API_URL=http://localhost:5000/api
```

## Deploy on Vercel

| | Frontend | Backend |
|---|----------|---------|
| Root folder | repo root (or `client`) | `server` |
| Build | `npm run build --prefix client` | `npm run build` |
| Output | `client/dist` | `public` |

Backend env: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`, `AWS_*`  
Frontend env: `VITE_API_URL=https://your-api.vercel.app/api`

Do not commit `.env` files.
