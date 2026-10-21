# Syncner

A learning platform with a Gemini-backed career mentor. React and TypeScript on the front end, an Express and MongoDB API behind it, and separate surfaces for students, staff and admins.

**[Live demo](https://syncner-test.netlify.app)** · Built by [Pranava Holla](https://github.com/Pranava77) at [WEBFIXUS](https://webfixus.com)

`React 18 · TypeScript · Redux Toolkit · Tailwind · Express · MongoDB · JWT · Gemini`

---

## What it does

Students pick one of four career tracks (Full Stack, AI/ML, UI/UX, Data Science) and work through levels. Each level has three parts, and each part gates the next:

1. **Learn**: lesson content, with progress tracked as you go.
2. **Test**: unlocks after the Learn section. The pass mark is 60%, with three attempts.
3. **Exercise**: unlocks when the test is passed.

Progress feeds a generated portfolio with a public share link (`/portfolio/public/:studentId`) and a leaderboard for staff. Students also get an AI mentor to chat with.

| Role | Can do |
|---|---|
| **Student** | Learning path, tests and exercises, portfolio, AI mentor |
| **Staff** | Track students, view each student's learning timeline and portfolio, leaderboard |
| **Admin** | Manage users, staff and curriculum; platform analytics; system settings, including the Gemini key |

## How it's built

The front end is a fairly standard React app. The interesting half is the API.

- **Accounts and roles.** JWT auth, with `authorize(role)` guarding staff and admin routes. Public signup only creates students; staff and admin accounts are created by an admin through `POST /api/admin/users`, so the role field on signup can't be used to escalate.
- **Validation at the edge.** Auth routes validate and normalise input with `express-validator` before a controller runs.
- **The model key lives in settings.** The Gemini key is read from the admin settings document first and falls back to `GEMINI_API_KEY`. Rotating a key is a settings change rather than a redeploy. Calls go through the API (`POST /api/ai/chat`, authenticated), so the key never reaches the browser.
- **Attendance without a check-in button.** Any authenticated request marks the student present for that day. In production, a nightly job (01:00 UTC) marks everyone who didn't show up as absent.
- **A leaderboard that rewards showing up.** Each student's score weights learning progress at 40%, attendance at 25%, streak at 20% and time spent learning at 15%.
- **Production hardening.** `helmet`, response compression, and a rate limit of 100 requests per 15 minutes per IP on `/api` when `NODE_ENV=production`.

## Running it locally

**You'll need** Node.js 20.19+ (required by Vite 7) and MongoDB 6+, either installed locally or on [MongoDB Atlas](https://www.mongodb.com/atlas).

```bash
git clone https://github.com/Pranava77/syncner-test.git
cd syncner-test
npm install
npm --prefix backend install
```

**Configure the backend.** Copy the example file, then set at least `MONGODB_URI` and a fresh `JWT_SECRET` (for example from `openssl rand -hex 32`):

```bash
cp backend/.env.example backend/.env
```

On macOS, port 5000 is taken by AirPlay Receiver, so set `PORT=5001` in `backend/.env`.

**Point the front end at it.** Create `.env` in the project root. The value must end in `/api`:

```env
VITE_API_URL=http://localhost:5001/api
```

> If `VITE_API_URL` isn't set, the front end falls back to the **production** API, and anything you do locally will write to the live database.

**Start both servers** in separate terminals:

```bash
npm --prefix backend run dev   # API on http://localhost:5001
npm run dev                    # app on http://localhost:5173
```

The API's CORS settings allow `localhost:5173` and `localhost:3000`, so keep the front end on one of those ports.

**Add curriculum and an admin.** The seed script needs at least one user to exist, so register through the app first, then run it. It replaces all existing curriculum:

```bash
cd backend && node seedData.js
```

Signup only creates students. To get your first admin, change that user's role directly in the database:

```bash
mongosh "mongodb://127.0.0.1:27017/Syncner-test" --eval 'db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })'
```

### Environment variables

Backend (`backend/.env`):

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signs auth tokens. Use a long random value |
| `PORT` | No | API port (default `5000`) |
| `JWT_EXPIRE` | No | Token lifetime (default `7d`) |
| `GEMINI_API_KEY` | No | Fallback when no key is saved in admin settings |
| `NODE_ENV` | No | `production` turns on rate limiting and the nightly attendance job |
| `DIAGNOSTICS_BASE_URL` | No | Base URL the admin diagnostics endpoint uses to call the API's health checks |

The backend refuses to start without `MONGODB_URI` and `JWT_SECRET`, and logs which one is missing.

Front end (`.env`):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL, including `/api`. Falls back to the production API |

## Deployment

| Part | Where | Notes |
|---|---|---|
| Front end | Netlify | `public/_redirects` proxies `/api/*` to the Render API and serves `index.html` for client-side routes |
| API | Render | Set the backend variables above, with `NODE_ENV=production` |
| Database | MongoDB Atlas | Allow connections from Render under Network Access |

`vercel.json` files are also included if you'd rather deploy either half to Vercel.

## Project layout

```
src/
  pages/            Student and admin screens; staff screens in pages/staff/
  redux/slices/     Auth, curriculum, learning journey, portfolio, staff, analytics, settings, theme, ...
  services/         API client (api.ts) and portfolio/timeline helpers
backend/
  routes/           Express routers, one per area (auth, admin, curriculum, progress, ...)
  controllers/      Request handlers
  models/           Mongoose schemas: User, Curriculum, UserProgress, Attendance, Track, Settings
  middleware/       JWT auth, activity tracking, validation, error handling
  services/         Gemini client, leaderboard scoring, scheduled jobs
  migrations/       One-off data fixes
docs/               Architecture, API, schema, setup and deployment guides
```

## Documentation

The [`docs/`](docs) folder has the longer-form material:

- **Design:** [high-level design](docs/HLD.pdf), [low-level design](docs/LLD.pdf), [technical architecture](docs/TECHNICAL_ARCHITECTURE.pdf), [application flow](docs/APPLICATION_FLOW_DIAGRAM.html)
- **API:** [API reference](docs/API.pdf), [complete endpoint list](docs/COMPLETE_API_ENDPOINTS.pdf), [endpoint summary](docs/API_ENDPOINTS_SUMMARY.html)
- **Data:** [database schema](docs/DATABASE_SCHEMA.pdf), [schema diagrams](docs/SCHEMA_DIAGRAMS.html)
- **Operations:** [setup guide](docs/SETUP_GUIDE.md), [deployment](docs/DEPLOYMENT.pdf), [troubleshooting](docs/TROUBLESHOOTING.pdf), [user manual](docs/USER_MANUAL.pdf)

## Author

**Pranava Holla**, full-stack AI engineer in Bangalore, running [WEBFIXUS](https://webfixus.com).
[GitHub](https://github.com/Pranava77) · [pranavarholla@gmail.com](mailto:pranavarholla@gmail.com)

## License

Proprietary. All rights reserved.
