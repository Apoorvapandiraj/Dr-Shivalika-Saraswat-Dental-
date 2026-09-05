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

## Key API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Health check (reports Mongo status) |
| POST | `/api/auth/register` \| `/login` \| `/refresh` | — | Auth (JWT access 15m + refresh 7d) |
| POST | `/api/auth/send-otp` \| `/verify-otp` | — | OTP via email (Gmail) or SMS (Twilio) |
| GET | `/api/profile` | — | Public doctor profile + services |
| PUT | `/api/profile` | admin | Update profile (`manage_profile`) |
| GET | `/api/bookings/availability?date=` | — | Real-time slot availability |
| POST | `/api/bookings` | — | Create booking (OTP-verified, rate-limited) |
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
- OTPs are logged to the server console in dev mode — check the terminal when testing the booking flow.
- Razorpay/Cloudinary integrations are stubbed in `models/Payment.js` / upload middleware; wire them via `ENV_CONFIG_AND_DEPLOYMENT.md` in `files/`.
- A React Three Fiber hero variant is available in `files/frontend_components.jsx`.
