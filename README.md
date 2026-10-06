# Dr. Shivalika Saraswat Healthcare Platform

Full MERN stack booking & review platform: public landing page with real-time appointment booking (OTP-verified), review/testimonial submission with moderation, and an admin dashboard with analytics.

## Structure

```
├── server/   Express + MongoDB API (JWT auth, OTP, bookings, reviews, admin, analytics)
├── client/   React (Vite) + Tailwind public site (hero, timeline, testimonials, booking, reviews)
├── admin/    React (Vite) + Tailwind + Recharts admin dashboard
└── files/    Original reference documentation
```

## Quick Start

### 1. Backend
```bash
cd server
npm install
cp .env.example .env        # fill in MONGODB_URI, JWT secrets, etc.
npm run seed                # creates doctor profile + admin user
npm run dev                 # http://localhost:5050 (port 5050 avoids the macOS AirPlay clash on 5000)
```

Default seeded admin: `admin@drshivalika.com` / `ChangeMe@123` (override via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars). **Change it before production.**

### 2. Public client
```bash
cd client
npm install
cp .env.example .env
npm run dev                 # http://localhost:3000 (proxies /api → :5050)
```

### 3. Admin dashboard
```bash
cd admin
npm install
cp .env.example .env
npm run dev                 # http://localhost:3001
```

## Production deployment (Vercel + Render)

- Deploy the public site from the `client` directory on Vercel. Set `VITE_API_URL` to `https://dr-shivalika-saraswat-dental-1.onrender.com` (origin only, no trailing slash or `/api`). Vite variables are embedded at build time: redeploy after changing the value.
- Deploy the API from the `server` directory on Render with `npm install` as the build command and `npm start` as the start command. Set `NODE_ENV=production`, `MONGODB_URI` (or `MONGO_URI`), `JWT_SECRET`, `REFRESH_TOKEN_SECRET` (both secrets must be at least 32 characters), and `FRONTEND_URL=https://dr-shivalika-saraswat-dental.vercel.app`. Render supplies `PORT`; the server listens on `0.0.0.0`. If MongoDB Atlas is used, allow Render connections in Atlas Network Access and percent-encode special characters in URI usernames/passwords.
- For booking confirmation email, set either `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM`, or Gmail's `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `EMAIL_FROM`. Set `CORS_ORIGIN` to the exact deployed frontend origin when using a custom domain.
- Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in Render before accepting image or video uploads. Production uploads intentionally return an error when Cloudinary is missing because Render's local filesystem is ephemeral. Existing media that was previously stored only on Render must be restored from a backup or uploaded again.
- Set `VITE_RAZORPAY_KEY_ID` on Vercel for the public payment button and configure the corresponding Razorpay server credentials on Render if payment verification is enabled.

## Key API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Health check (`status: "ok"` and Mongo status) |
| POST | `/api/auth/register` \| `/login` \| `/refresh` | — | Auth (JWT access 15m + refresh 7d) |
| POST | `/api/auth/send-otp` \| `/verify-otp` | — | OTP via email (Gmail) or SMS (Twilio) |
| GET | `/api/profile` | — | Public doctor profile + services |
| PUT | `/api/profile` | admin | Update profile (`manage_profile`) |
| GET | `/api/bookings/availability?date=` | — | Real-time slot availability |
| POST | `/api/bookings` | — | Create a booking (rate-limited, idempotency protected, email confirmation when configured) |
| GET/PATCH | `/api/bookings` | admin | List / update bookings (`manage_bookings`) |
| GET | `/api/reviews/doctor/:id` | — | Approved reviews |
| POST | `/api/reviews` | — | Submit review (pending moderation) |
| PUT | `/api/reviews/:id/approve` \| `/reject` | admin | Moderate reviews (`moderate_reviews`) |
| GET | `/api/reviews/testimonials` | — | Approved testimonials |
| GET | `/api/profile/analytics` | admin | Dashboard stats + monthly revenue |

## Security Features

- JWT access tokens (15 min) + refresh tokens (7 days) with blacklist on logout
- SHA-256 hashed OTPs with expiry, attempt limits (5) and TTL auto-cleanup
- Role-based access control + granular admin permissions (AdminAccess model)
- Rate limiters: login (10/15m), OTP (5/10m), booking (20/hr), general API (300/15m)
- Helmet security headers, CORS whitelist, compression
- Soft deletes everywhere; audit logging with 90-day TTL retention
- Unique partial index prevents double-booking of the same slot

## Testing

```bash
cd server && npm test       # smoke tests run against in-memory MongoDB
```

## Notes

- Email/SMS providers fall back to console logging when credentials aren't configured (dev mode).
- Render's free tier may sleep; the frontend waits up to 90 seconds and safely retries a timed-out booking once using an idempotency key.
- OTPs are logged to the server console in dev mode — check the terminal when testing the booking flow.
- Media uploads use Cloudinary in production; local disk is only used for development.
- A React Three Fiber hero variant is available in `files/frontend_components.jsx`.
