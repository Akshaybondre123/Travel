# TripForge — AI Travel Itinerary (MERN)

MERN stack application for uploading travel booking documents (PDF/images), extracting details with **Google Gemini**, and generating shareable AI-powered day-by-day itineraries.

## Features

- JWT authentication (register / login)
- Drag-and-drop document upload (flight, hotel, train, etc.)
- AI data extraction from PDFs and images (Gemini)
- AI itinerary generation from multiple bookings
- MongoDB storage with itinerary history
- Public share links (`/share/:shareId`)
- AWS S3 file storage (with local fallback)
- Responsive React UI

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React, Vite, React Router, Axios    |
| Backend  | Node.js, Express                    |
| Database | MongoDB, Mongoose                   |
| Auth     | JWT, bcrypt                         |
| AI       | Google Gemini 1.5 Flash             |
| Storage  | AWS S3 (optional local fallback)    |

## Prerequisites

- Node.js 18+
- MongoDB running locally or [MongoDB Atlas](https://www.mongodb.com/atlas)
- Gemini API key
- (Optional) AWS S3 bucket for uploads

## Setup

### 1. Clone and install

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Server environment

Copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/travel-itinerary
JWT_SECRET=your-long-secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your-gemini-key
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

**AWS S3:** Create a bucket and enable public read on uploaded objects (or use presigned URLs in production). If S3 is not configured, files are stored locally in `server/uploads/`.

### 3. Run locally

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open http://localhost:5173

## API Overview

| Method | Endpoint                      | Auth | Description              |
| ------ | ----------------------------- | ---- | ------------------------ |
| POST   | `/api/auth/register`          | No   | Register user            |
| POST   | `/api/auth/login`             | No   | Login                    |
| GET    | `/api/bookings`               | Yes  | List user bookings       |
| POST   | `/api/bookings/upload`        | Yes  | Upload document          |
| GET    | `/api/itineraries`            | Yes  | List itineraries         |
| POST   | `/api/itineraries/generate`   | Yes  | Generate from bookings   |
| GET    | `/api/itineraries/share/:id`  | No   | Public shared view       |

## Deployment

### Backend (Render / Railway / etc.)

- Set all env vars from `.env`
- Use MongoDB Atlas connection string
- Set `CLIENT_URL` to your frontend URL

### Frontend (Vercel / Netlify)

```bash
cd client && npm run build
```

Set `VITE_API_URL` if needed, or proxy `/api` to backend.

### S3 CORS

Allow your frontend origin on the bucket CORS policy for direct uploads if applicable.

## Project Structure

```
Travel/
├── client/          # React frontend
│   └── src/
│       ├── pages/
│       ├── components/
│       └── context/
├── server/          # Express API
│   └── src/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── middleware/
└── README.md
```

## Submission Checklist

- [ ] GitHub repository (do not commit `.env`)
- [ ] Live deployed backend + frontend URLs
- [ ] Demo: register → upload PDF/image → wait for extraction → generate itinerary → share link

## Security Note

Never commit API keys or AWS credentials. Rotate any keys that were shared in chat or email.

## License

MIT — built for Orbitra Technologies interview assignment.
