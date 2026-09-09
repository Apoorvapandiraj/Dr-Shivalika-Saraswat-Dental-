require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const connectDatabase = require('./config/db');
const { errorHandler, notFound } = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimiter');

// ===== Startup security validation =====
const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  const missing = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'MONGODB_URI'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`❌ FATAL: missing required production env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (String(process.env.JWT_SECRET).length < 32 || String(process.env.REFRESH_TOKEN_SECRET).length < 32) {
    console.error('❌ FATAL: JWT_SECRET / REFRESH_TOKEN_SECRET must each be ≥ 32 chars in production');
    process.exit(1);
  }
} else if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  console.warn('⚠️  JWT secrets not set in server/.env — insecure dev fallbacks are in use. Set JWT_SECRET & REFRESH_TOKEN_SECRET.');
}

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://drshivalikasaraswatdental.netlify.app',
  'https://admindr-shivalika.netlify.app',
  ...configuredOrigins,
]);

// ===== Security middleware =====
app.set('trust proxy', 1); // behind reverse proxies (Render/Heroku)
app.use(
  helmet({
    // Strict CSP only in production — dev needs Vite HMR (ws:) & react-refresh (inline)
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            fontSrc: ["'self'", 'https:', 'data:'],
            styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
            scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
            connectSrc: ["'self'", 'https://api.razorpay.com'],
            frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'self'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
  })
);
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ===== Body parser =====
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ===== Request logging =====
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ===== Static: approved patient reels (video files) =====
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(path.join(uploadsDir, 'testimonials'), { recursive: true });
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '7d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.mp4') || filePath.endsWith('.webm') || filePath.endsWith('.mov')) {
        res.setHeader('Accept-Ranges', 'bytes'); // enables video seeking
      }
    },
  })
);

// ===== Routes =====
app.use('/api/health', require('./routes/health.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/leads', require('./routes/lead.routes'));
app.use('/api/admin', apiLimiter, require('./routes/admin.routes'));

// ===== 404 + error handling (must be last) =====
app.use(notFound);
app.use(errorHandler);

// ===== Server bootstrap =====
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Only auto-start when run directly (allows testing via supertest)
if (require.main === module) {
  startServer();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

module.exports = { app, server, startServer };
