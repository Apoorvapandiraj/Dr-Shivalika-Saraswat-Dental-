# Environment Configuration & Deployment Guide

## 🔐 Environment Variables Setup

### Backend `.env` File

```bash
# Database Configuration
DB_USER=shivalika
DB_PASSWORD=dentalone
DB_CLUSTER=cluster0.oxxm6.mongodb.net
DB_APPNAME=Cluster0

# Full MongoDB URI (alternative)
# MONGODB_URI=mongodb+srv://shivalika:dentalone@cluster0.oxxm6.mongodb.net/?appName=Cluster0

# Security Keys
JWT_SECRET=your-super-secret-key-minimum-32-characters-random-string-here
JWT_EXPIRE=15m
REFRESH_TOKEN_SECRET=refresh-token-secret-minimum-32-characters-random-string
OTP_SECRET=otp-secret-key-random-32-chars
ENCRYPTION_KEY=encryption-key-random-32-chars

# Server Configuration
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Frontend URLs
CLIENT_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com

# Cloudinary Configuration (Image/Video Hosting)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
GMAIL_FROM_NAME=Dr. Shivalika Saraswat

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Logging & Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn-url

# Google Places API
GOOGLE_PLACES_API_KEY=your-google-places-api-key

# Redis (for token blacklist & caching)
REDIS_URL=redis://default:password@localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend `.env` File

```bash
# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_API_TIMEOUT=30000

# Google API
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
REACT_APP_GOOGLE_REVIEWS_PLACE_ID=your-google-place-id

# Razorpay
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx

# Sentry Error Tracking
REACT_APP_SENTRY_DSN=your-sentry-dsn-url

# Environment
REACT_APP_ENV=production
```

### Admin Dashboard `.env` File

```bash
# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com

# Admin Settings
REACT_APP_ADMIN_BRAND=Dr. Shivalika Saraswat
REACT_APP_ITEMS_PER_PAGE=10

# Chart Settings
REACT_APP_CHART_THEME=dark
```

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 16+ and npm/yarn
- MongoDB Atlas account
- Cloudinary account for media hosting
- Twilio account for SMS
- Gmail App Password (not Google account password)
- Razorpay business account
- Domain with SSL certificate

### Step 1: MongoDB Atlas Setup

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Whitelist your IP address
4. Create database user with username: `shivalika`, password: `dentalone`
5. Get connection string:
   ```
   mongodb+srv://shivalika:dentalone@cluster0.oxxm6.mongodb.net/?appName=Cluster0
   ```

### Step 2: Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Note your Cloud Name, API Key, and API Secret
4. Create upload preset for videos (allow unsigned uploads)

### Step 3: Twilio Setup

1. Create account at [Twilio](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Rent a phone number
4. Create a Messaging Service

### Step 4: Gmail Setup

1. Enable 2-factor authentication in Google Account
2. Generate App Password:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select Mail and Windows Computer
   - Copy the 16-character password

### Step 5: Razorpay Setup

1. Create account at [Razorpay](https://razorpay.com)
2. Get API Key and API Secret from Settings
3. Setup webhook for payment notifications

---

## 📦 Backend Deployment (Heroku/Railway/Render)

### Using Render.com (Recommended)

```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Connect to Render
# - Go to render.com
# - Connect GitHub repository
# - Create new Web Service
# - Set environment variables
# - Deploy

# 3. Set up automatic deployments
# In Render dashboard: Enable auto-deploy on git push
```

### Using Heroku

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login to Heroku
heroku login

# 3. Create app
heroku create dr-shivalika-api

# 4. Set environment variables
heroku config:set DB_USER=shivalika
heroku config:set DB_PASSWORD=dentalone
# ... set all env vars

# 5. Deploy
git push heroku main

# 6. Monitor logs
heroku logs --tail
```

### Using DigitalOcean App Platform

```bash
# 1. Create GitHub repository
# 2. Go to DigitalOcean > App Platform
# 3. Connect GitHub
# 4. Select repository
# 5. Configure:
#    - Runtime: Node.js
#    - Build Command: npm install
#    - Run Command: npm start
# 6. Add environment variables
# 7. Deploy
```

---

## 🎨 Frontend Deployment (Vercel/Netlify)

### Using Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy from project directory
vercel

# 3. Follow prompts to connect GitHub
# 4. Set environment variables in Vercel Dashboard
# 5. Enable automatic deployments

# Or use GitHub integration:
# - Push code to GitHub
# - Go to vercel.com
# - Import project from GitHub
# - Set env vars
# - Auto-deploys on push
```

### Using Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Connect and deploy
netlify deploy --prod

# Or use GitHub integration:
# - Push to GitHub
# - Go to netlify.com
# - New site from Git
# - Select repository
# - Set build settings:
#   - Build command: npm run build
#   - Publish directory: build
# - Set environment variables
# - Deploy
```

---

## 🔐 Security Checklist

### Database Security
- [ ] Enable IP Whitelist in MongoDB Atlas
- [ ] Use strong passwords (minimum 12 characters)
- [ ] Enable encryption at rest
- [ ] Regular backups enabled
- [ ] Database monitoring active

### API Security
- [ ] HTTPS/SSL enabled on all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection via helmet.js
- [ ] CSRF tokens implemented
- [ ] Sensitive data not logged

### Application Security
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens with expiration
- [ ] Refresh token rotation
- [ ] OTP verification implemented
- [ ] File upload validation
- [ ] Malware scanning for uploads
- [ ] API key rotation scheduled
- [ ] Secrets in environment variables only

### Infrastructure Security
- [ ] SSL/TLS certificates (Let's Encrypt)
- [ ] DDoS protection enabled
- [ ] WAF (Web Application Firewall) active
- [ ] VPN for admin access
- [ ] Backup strategy in place
- [ ] Disaster recovery plan

---

## 📊 Performance Optimization

### Backend Optimization

```javascript
// Use connection pooling
mongoose.connect(url, {
  maxPoolSize: 10,
  minPoolSize: 5
});

// Implement caching
const redis = require('redis');
const cache = redis.createClient();

// Pagination
const skip = (page - 1) * limit;
const data = await Model.find().skip(skip).limit(limit);

// Index frequently queried fields
schema.index({ doctorId: 1, isApproved: 1 });
```

### Frontend Optimization

```javascript
// Code splitting with React.lazy
const BookingComponent = React.lazy(() => import('./components/Booking'));

// Image optimization with Next.js Image
import Image from 'next/image';

// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// Use service workers for PWA
// Use Lighthouse to audit performance
```

### CDN Configuration

```bash
# CloudFront (AWS)
# - Enable gzip compression
# - Set cache headers
# - Enable query string caching
# - Use origin shield

# Vercel/Netlify
# - Automatic CDN
# - Edge functions for dynamic content
# - Automatic optimization
```

---

## 🛠️ Database Maintenance

### Regular Tasks

```bash
# Monthly: Review slow queries
db.system.profile.find({ millis: { $gt: 100 } }).limit(10)

# Weekly: Monitor database size
db.stats()

# Monthly: Clean up old OTP records
db.otps.deleteMany({ createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } })

# Quarterly: Analyze indexes
db.testimonials.aggregate([{ $indexStats: {} }])
```

### Backup Strategy

```bash
# Daily automated backups in MongoDB Atlas
# Manual backup before major changes:
mongodump --uri="mongodb+srv://..." --out=./backup

# Restore from backup:
mongorestore --uri="mongodb+srv://..." ./backup
```

---

## 📈 Monitoring & Alerts

### Setup Sentry for Error Tracking

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Capture exceptions
Sentry.captureException(error);
```

### Setup Google Analytics

```javascript
// For frontend
import ReactGA from 'react-ga4';
ReactGA.initialize('G-XXXXXXXXXX');

// Track page views
ReactGA.send({ hitType: "pageview", page: window.location.pathname });
```

### Status Page

```bash
# Use Status.io or Statuspage.io
# Monitor:
# - API response times
# - Database connectivity
# - File upload functionality
# - Payment gateway status
```

---

## 🚨 Troubleshooting

### Common Issues

**MongoDB Connection Fails**
```bash
# Check IP whitelist in Atlas
# Verify credentials
# Check network connectivity
# Use connection string validator
```

**Cloudinary Upload Fails**
```bash
# Verify API credentials
# Check upload preset
# Verify file size limits
# Check file format support
```

**Email Not Sending**
```bash
# Enable Gmail App Password (not account password)
# Check "Less secure app access" settings
# Verify SMTP server settings
# Check spam folder
```

**OTP Not Received**
```bash
# Verify Twilio credentials
# Check phone number format
# Verify account has credits
# Check rate limiting
```

---

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database backups active
- [ ] SSL certificate installed
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Error monitoring (Sentry) active
- [ ] Analytics configured
- [ ] Performance monitoring active
- [ ] Automated tests passing
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team trained on deployment
- [ ] Disaster recovery plan in place
- [ ] Uptime monitoring configured

