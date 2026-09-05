# EXPERT MERN STACK PROJECT GUIDE
## Dr. Shivalika Saraswat Professional Platform

---

## 🏗️ PROJECT ARCHITECTURE OVERVIEW

```
dr-shivalika-platform/
├── client/                          # Frontend React Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── admin/                           # Admin CRM Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── server/                          # Backend Express API
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── server.js
└── .env.example
```

---

## 🔐 SECURITY BEST PRACTICES

### Environment Variables (Backend)
```
MONGODB_URI=mongodb+srv://shivalika:dentalone@cluster0.oxxm6.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-key-min-32-chars-random
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=refresh-token-secret-min-32-chars
OTP_SECRET=otp-secret-key
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

---

## 📦 DEPENDENCIES & TECH STACK

### Frontend Client
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "framer-motion": "^10.x",
    "three": "^r160.x",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x",
    "react-query": "^3.x",
    "zustand": "^4.x",
    "tailwindcss": "^3.x",
    "react-hook-form": "^7.x",
    "react-toastify": "^9.x",
    "lottie-react": "^2.x",
    "swiper": "^10.x",
    "react-video-thumbnail": "^1.x"
  }
}
```

### Admin Dashboard
```json
{
  "dependencies": {
    "react-admin": "^4.x",
    "recharts": "^2.x",
    "@mui/material": "^5.x",
    "@tanstack/react-table": "^8.x",
    "date-fns": "^2.x"
  }
}
```

### Backend Server
```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^7.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "dotenv": "^16.x",
    "cors": "^2.x",
    "helmet": "^7.x",
    "express-validator": "^7.x",
    "multer": "^1.x",
    "cloudinary": "^1.x",
    "nodemailer": "^6.x",
    "twilio": "^3.x",
    "razorpay": "^2.x",
    "socket.io": "^4.x",
    "express-rate-limit": "^7.x",
    "compression": "^1.x"
  }
}
```

---

## 🎯 EXPERT PROMPTS FOR IMPLEMENTATION

### PROMPT 1: Database Schema & Security
```
You are an expert MongoDB database architect for healthcare platforms.
Create comprehensive Mongoose schemas for:
1. User/Doctor Profile with encryption for sensitive data
2. Patient Testimonials with moderation flags
3. Reviews & Ratings with spam detection
4. Booking Slots with timezone support
5. OTP Verification records
6. Admin Access Control with role-based permissions

Requirements:
- Use bcryptjs for password hashing
- Implement field-level encryption for PHI (Protected Health Information)
- Add soft delete support
- Include audit logs for compliance
- Timestamp all records (createdAt, updatedAt)
- Implement TTL indexes for OTP expiry
- Add indexes for performance-critical queries
```

### PROMPT 2: Authentication & Authorization
```
Design a production-grade JWT authentication system for this platform:
1. JWT token strategy with access + refresh tokens
2. OTP verification flow (email/SMS)
3. Role-based access control (Doctor, Patient, Admin)
4. Session management with token blacklisting
5. Rate limiting on auth endpoints
6. Secure password reset flow

Implementation details:
- 15-min access token, 7-day refresh token
- Blacklist tokens on logout
- Validate OTP with rate limiting
- Implement CSRF protection
- Use httpOnly cookies for token storage
- Log all auth attempts
```

### PROMPT 3: File Upload & Media Management
```
Create a secure file upload system for Reels/Videos:
1. Client-side validation (size, type, duration)
2. Server-side virus scanning
3. Cloudinary integration for video hosting
4. Thumbnail generation for videos
5. Progress tracking for uploads
6. Automatic compression
7. CDN caching strategy

Requirements:
- Max video size: 100MB
- Supported formats: MP4, MOV, WebM
- Auto-generate thumbnails
- Watermark option for testimonials
- Delete original after CDN upload
- Track upload metrics
```

### PROMPT 4: Booking System with Real-time Updates
```
Design a professional appointment booking system:
1. Real-time slot availability (Socket.io)
2. Timezone-aware scheduling
3. Automatic reminder emails (24h, 1h before)
4. SMS reminders via Twilio
5. Calendar integration (Google Calendar)
6. No-show tracking
7. Reschedule/cancellation policy
8. Razorpay payment integration

Details:
- Prevent double booking
- Buffer time between appointments
- Breaktime management
- Holiday management
- Recurring slot templates
```

### PROMPT 5: Reviews & Testimonials Moderation
```
Build a complete review management system:
1. Auto-moderation pipeline (spam, profanity detection)
2. Manual review queue for flagged content
3. Rating analytics dashboard
4. Response workflow for negative reviews
5. Fake review detection (pattern analysis)
6. Star rating visualization
7. Review filtering & sorting
8. Compliance tracking

Features:
- Duplicate review detection
- Sentiment analysis
- Verified purchase badge
- Time decay for review ranking
- Response threads
```

### PROMPT 6: Admin CRM Dashboard
```
Create a professional admin panel with:
1. Doctor Profile Management
   - Edit profile, credentials, qualifications
   - Manage services and pricing
   - View analytics and metrics
   
2. Booking Management
   - View all appointments
   - Manage slots and availability
   - Track no-shows and cancellations
   
3. Patient Management
   - Patient database
   - Testimonials approval workflow
   - Review management
   
4. Analytics Dashboard
   - Revenue tracking
   - Appointment metrics
   - Patient satisfaction scores
   - Google review sentiment
   
5. Content Management
   - Reels management
   - Blog/Articles
   - Media library
   
6. Access Control
   - Role management
   - User permissions
   - Audit logs

Tech Stack:
- React + React Router
- Recharts for analytics
- React Hook Form for forms
- TanStack React Table for data grids
- RTK Query for state management
```

### PROMPT 7: Frontend Landing Page with 3D Effects
```
Create a stunning landing page with:
1. Hero Section with 3D animated elements
   - Threejs + React Three Fiber
   - Smooth scroll animations
   - Parallax effects
   - Gradient backgrounds

2. Professional Sections:
   - About Dr. Shivalika
   - Services/Specializations
   - Experience Timeline (Story-style)
   - Statistics/Achievements
   
3. Google Reviews Widget
   - Embedded Google reviews
   - Star rating display
   - Filter by rating
   - Load more functionality
   
4. Patient Testimonials Section
   - Carousel of video testimonials
   - Play/pause controls
   - Rating display
   - "Add Review" CTA
   
5. Booking Section
   - Calendar picker with available slots
   - Time zone selector
   - Service selection dropdown
   - OTP verification
   - Confirmation page

Animations:
- Framer Motion for smooth transitions
- Lottie animations for micro-interactions
- CSS transforms for 3D effects
- Lazy loading for performance
```

### PROMPT 8: Performance & Optimization
```
Optimize the application for production:
1. Code Splitting Strategy
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports for heavy libraries
   
2. Caching Strategy
   - HTTP caching headers
   - Browser caching with Service Workers
   - CDN caching for static assets
   - React Query caching
   
3. Database Optimization
   - Query optimization
   - Indexing strategy
   - Pagination implementation
   - Connection pooling
   
4. Frontend Performance
   - Image optimization (WebP)
   - Video lazy loading
   - Minification and compression
   - Tree shaking
   
5. Monitoring
   - Error tracking (Sentry)
   - Performance monitoring (Google Analytics)
   - Server monitoring
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1: Project Setup (Week 1)
- [ ] Initialize MERN project structure
- [ ] Setup MongoDB Atlas connection
- [ ] Configure environment variables
- [ ] Setup Git repository with .gitignore
- [ ] Configure ESLint and Prettier
- [ ] Setup CI/CD pipeline

### Phase 2: Backend Foundation (Week 2-3)
- [ ] Database schemas (Doctor, Patient, Booking, Reviews)
- [ ] Authentication system (JWT + OTP)
- [ ] Authorization middleware (RBAC)
- [ ] CRUD operations for all models
- [ ] Error handling and logging
- [ ] Rate limiting and security headers

### Phase 3: Frontend Setup (Week 3)
- [ ] React project setup with Vite
- [ ] Tailwind CSS configuration
- [ ] Routing structure
- [ ] State management (Zustand/React Query)
- [ ] API integration setup
- [ ] Authentication pages

### Phase 4: Core Features (Week 4-6)
- [ ] Landing page with 3D effects
- [ ] Doctor profile page
- [ ] Google reviews integration
- [ ] Testimonials carousel (video support)
- [ ] Booking system with calendar
- [ ] OTP verification flow
- [ ] Review submission form

### Phase 5: Admin Dashboard (Week 6-7)
- [ ] Admin authentication
- [ ] Profile management
- [ ] Booking management
- [ ] Review moderation
- [ ] Analytics dashboard
- [ ] User management

### Phase 6: Testing & Deployment (Week 7-8)
- [ ] Unit tests (Jest + React Testing Library)
- [ ] Integration tests
- [ ] E2E tests (Cypress)
- [ ] Security audit
- [ ] Performance testing
- [ ] Deploy to production

---

## 🚀 DEPLOYMENT CHECKLIST

### Frontend Deployment
- [ ] Build optimization
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Cache headers configured
- [ ] Deploy to Vercel/Netlify
- [ ] Setup CI/CD

### Backend Deployment
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Error monitoring setup
- [ ] Rate limiting configured
- [ ] Deploy to Heroku/AWS/DigitalOcean
- [ ] Setup health checks

### Security Checklist
- [ ] HTTPS everywhere
- [ ] CORS configured properly
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Rate limiting active
- [ ] Helmet.js headers
- [ ] Data encryption at rest
- [ ] Secure password storage
- [ ] Input validation everywhere

