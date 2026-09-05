// ================================================
// BACKEND SERVER SETUP & CONFIGURATION
// ================================================

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// ================================================
// 1. DATABASE CONNECTION
// ================================================

const connectDatabase = async () => {
  try {
    const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?appName=${process.env.DB_APPNAME}`;
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Models require proper connection
    console.log('📊 Creating database indexes...');
    // Indexes are created in model definitions
  } catch (error) {
    console.error('Index creation failed:', error);
  }
};

// ================================================
// 2. MIDDLEWARE SETUP
// ================================================

const {
  securityMiddleware,
  errorHandler,
  auditLogger
} = require('./backend_auth_middleware');

// Apply security middleware
app.use(...securityMiddleware);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Audit logging
app.use(auditLogger);

// ================================================
// 3. ROUTES SETUP
// ================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/testimonials', require('./routes/testimonials.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ================================================
// 4. SERVER INITIALIZATION
// ================================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  🚀 Server Started Successfully                  ║
║                                                   ║
║  Environment: ${NODE_ENV}                        ║
║  Port: ${PORT}                                     ║
║  URL: http://localhost:${PORT}                   ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close();
        process.exit(0);
      });
    });

    // Unhandled promise rejection
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, connectDatabase };


// ================================================
// 5. API ROUTE EXAMPLES
// ================================================

// FILE: routes/bookings.routes.js

const bookingRoutes = `
const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  otpLimiter,
  bookingLimiter,
  validateRequest,
  validators,
  OTPManager,
  TokenManager,
  AppError
} = require('../backend_auth_middleware');

const Booking = require('../models/Booking');
const DoctorProfile = require('../models/DoctorProfile');
const OTP = require('../models/OTP');

// Send OTP for booking
router.post('/send-otp', otpLimiter, validateRequest, async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    // Validate input
    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone are required'
      });
    }

    // Generate OTP
    const otp = OTPManager.generateOTP();
    const hashedOTP = OTPManager.hashOTP(otp);

    // Save OTP to database
    const otpRecord = await OTP.create({
      email: email.toLowerCase(),
      phone,
      otp: hashedOTP,
      purpose: 'booking_confirmation'
    });

    // Send OTP via email
    await OTPManager.sendOTPEmail(email, otp, 'booking confirmation');

    // Send OTP via SMS
    await OTPManager.sendOTPSMS(phone, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully to email and phone',
      otpId: otpRecord._id
    });
  } catch (error) {
    next(error);
  }
});

// Verify OTP and create booking
router.post('/create', bookingLimiter, validateRequest, async (req, res, next) => {
  try {
    const {
      doctorId,
      service,
      date,
      time,
      name,
      email,
      phone,
      otp
    } = req.body;

    // Validate OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: 'booking_confirmation'
    }).select('+otp');

    if (!otpRecord || !OTPManager.verifyOTP(otp, otpRecord.otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP attempts. Please request a new OTP'
      });
    }

    // Check doctor availability
    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor || !doctor.bookingEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available for booking'
      });
    }

    // Check for slot conflicts
    const appointmentDateTime = new Date(\`\${date}T\${time}\`);
    const existingBooking = await Booking.findOne({
      doctorId,
      appointmentDate: {
        \$gte: new Date(appointmentDateTime.getTime() - 30 * 60000),
        \$lt: new Date(appointmentDateTime.getTime() + 30 * 60000)
      },
      status: { \$in: ['confirmed', 'completed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Slot not available. Please choose another time'
      });
    }

    // Create booking
    const booking = await Booking.create({
      doctorId,
      serviceId: service,
      patientName: name,
      patientEmail: email.toLowerCase(),
      patientPhone: phone,
      appointmentDate: appointmentDateTime,
      appointmentTime: time,
      status: 'confirmed',
      otpVerified: true,
      otpVerifiedAt: new Date()
    });

    // Mark OTP as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    // Send confirmation email
    // await sendBookingConfirmationEmail(email, booking);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// Get booking details
router.get('/:bookingId', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('doctorId', 'firstName lastName profileImage specialization');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.put('/:bookingId/cancel', authMiddleware, async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      {
        status: 'cancelled',
        cancelledAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
`;

// FILE: routes/testimonials.routes.js

const testimonialsRoutes = `
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const {
  authMiddleware,
  validateRequest,
  validators,
  upload
} = require('../backend_auth_middleware');

const Testimonial = require('../models/Testimonial');
const DoctorProfile = require('../models/DoctorProfile');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Submit testimonial with video
router.post('/submit', upload.single('video'), validateRequest, async (req, res, next) => {
  try {
    const {
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      title,
      description,
      rating,
      treatment,
      videoFormat,
      instagramReelsLink
    } = req.body;

    // Upload video to Cloudinary if provided
    let videoData = null;
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'testimonials',
          public_id: \`\${Date.now()}-\${patientEmail}\`
        },
        async (error, result) => {
          if (error) throw error;

          // Generate thumbnail
          const thumbnail = cloudinary.url(result.public_id, {
            resource_type: 'video',
            format: 'jpg',
            time: '0%'
          });

          videoData = {
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
            thumbnail
          };

          // Create testimonial
          const testimonial = await Testimonial.create({
            doctorId,
            patientName: patientName.trim(),
            patientEmail: patientEmail.toLowerCase(),
            patientPhone,
            title: title.trim(),
            description: description.trim(),
            rating: parseInt(rating),
            videoFile: videoData,
            videoFormat: videoFormat || 'Testimonial',
            instagramReelsLink,
            treatment: treatment || 'General Treatment'
          });

          res.status(201).json({
            success: true,
            message: 'Testimonial submitted successfully. It will be visible after approval.',
            data: testimonial
          });
        }
      );

      req.file.stream.pipe(uploadStream);
    } else {
      // Submit without video
      const testimonial = await Testimonial.create({
        doctorId,
        patientName: patientName.trim(),
        patientEmail: patientEmail.toLowerCase(),
        patientPhone,
        title: title.trim(),
        description: description.trim(),
        rating: parseInt(rating),
        treatment: treatment || 'General Treatment'
      });

      res.status(201).json({
        success: true,
        message: 'Testimonial submitted successfully. It will be visible after approval.',
        data: testimonial
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get approved testimonials for doctor
router.get('/doctor/:doctorId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const testimonials = await Testimonial.find({
      doctorId: req.params.doctorId,
      isApproved: true,
      deletedAt: null
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Testimonial.countDocuments({
      doctorId: req.params.doctorId,
      isApproved: true,
      deletedAt: null
    });

    res.json({
      success: true,
      data: testimonials,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Approve testimonial
router.put('/:testimonialId/approve', authMiddleware, async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.testimonialId,
      {
        isApproved: true,
        moderationStatus: 'approved',
        moderatedBy: req.userId,
        moderatedAt: new Date()
      },
      { new: true }
    );

    // Update doctor's rating
    const allTestimonials = await Testimonial.find({
      doctorId: testimonial.doctorId,
      isApproved: true
    });

    const avgRating = allTestimonials.reduce((sum, t) => sum + t.rating, 0) / allTestimonials.length;

    await DoctorProfile.findByIdAndUpdate(
      testimonial.doctorId,
      {
        rating: avgRating,
        totalReviews: allTestimonials.length
      }
    );

    res.json({
      success: true,
      message: 'Testimonial approved',
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
`;

console.log('📚 API Routes structure created');
console.log('✅ Booking Routes:', bookingRoutes.substring(0, 100) + '...');
console.log('✅ Testimonials Routes:', testimonialsRoutes.substring(0, 100) + '...');

module.exports = { app, startServer };
