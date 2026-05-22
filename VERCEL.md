# Vercel deployment — TripForge monorepo

Use **two separate Vercel projects**. Do not use frontend build settings on the backend project.

## Repo layout

```
Travel/
├── package.json          # dev scripts only (not used by Vercel backend)
├── vercel.json           # FRONTEND only (root = repo root)
├── client/
│   ├── package.json      # React + Vite
│   ├── vercel.json       # optional if root = client
│   └── src/
└── server/
    ├── package.json      # Express API
    ├── vercel.json       # BACKEND only (root = server)
    ├── api/
    │   └── index.js      # Vercel serverless entry → exports Express app
    └── src/
        ├── app.js        # Express app (no listen)
        └── index.js      # local dev only (node src/index.js)
```

---

## Project 1 — Frontend

| Vercel setting | Value |
|----------------|--------|
| **Root Directory** | `.` (repository root) **or** `client` |
| **Framework** | Other |
| **Install Command** | `npm install --prefix client` |
| **Build Command** | `npm run build --prefix client` |
| **Output Directory** | `client/dist` |

**Environment variables:**

| Name | Example |
|------|---------|
| `VITE_API_URL` | `https://your-api.vercel.app/api` |

---

## Project 2 — Backend (Express serverless)

| Vercel setting | Value |
|----------------|--------|
| **Root Directory** | `server` |
| **Framework** | Other |
| **Install Command** | `npm install` |
| **Build Command** | *(leave empty)* |
| **Output Directory** | *(leave empty — never `client/dist`)* |

**Do not use** on this project:

- `npm run build --prefix client`
- `client/dist`
- `npm install --prefix client`

**Environment variables** (from `server/.env.example`):

| Name | Required |
|------|----------|
| `MONGODB_URI` | Yes |
| `JWT_SECRET` | Yes |
| `GEMINI_API_KEY` | Yes |
| `CLIENT_URL` | Your frontend URL |
| `AWS_ACCESS_KEY_ID` | Yes (S3 required on Vercel) |
| `AWS_SECRET_ACCESS_KEY` | Yes |
| `AWS_REGION` | `us-east-1` |
| `AWS_S3_BUCKET` | Your bucket name |

**Test after deploy:**

```
GET https://your-api.vercel.app/api/health
```

Expected: `{ "status": "ok", "serverless": true, "storage": "s3" }`

---

## How the backend runs on Vercel

1. `server/api/index.js` exports the Express app from `src/app.js`.
2. `server/vercel.json` rewrites all routes to that function.
3. No `app.listen()` — Vercel invokes the app per request.
4. MongoDB uses cached connection (`src/config/db.js`).
5. Uploads go to **S3 only** (no local `uploads/` folder).

## Local development

```powershell
cd server
npm run dev
```

```powershell
cd client
npm run dev
```

## Re-import backend on Vercel

1. New Project → Import repo.
2. Set **Root Directory** = `server`.
3. Clear **Output Directory** and **Build Command**.
4. Add environment variables.
5. Deploy.
