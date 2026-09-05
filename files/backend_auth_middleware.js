// ================================================
// AUTHENTICATION & SECURITY MIDDLEWARE
// ================================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// ================================================
// 1. JWT TOKEN MANAGEMENT
// ================================================

class TokenManager {
  static generateAccessToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  static generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Token blacklist for logout (use Redis in production)
  static tokenBlacklist = new Set();

  static blacklistToken(token) {
    this.tokenBlacklist.add(token);
  }

  static isTokenBlacklisted(token) {
    return this.tokenBlacklist.has(token);
  }
}

// ================================================
// 2. OTP MANAGEMENT & VERIFICATION
// ================================================

class OTPManager {
  // Generate 6-digit OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash OTP for storage
  static hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  // Verify OTP
  static verifyOTP(enteredOTP, hashedOTP) {
    return this.hashOTP(enteredOTP) === hashedOTP;
  }

  // Send OTP via Email
  static async sendOTPEmail(email, otp, purpose = 'verification') {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Your OTP for ${purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verification Code</h2>
          <p>Your OTP for ${purpose} is:</p>
          <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in 15 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  }

  // Send OTP via SMS (Twilio)
  static async sendOTPSMS(phone, otp) {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: `Your verification OTP is ${otp}. Valid for 15 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`
    });

    return message.sid;
  }
}

// ================================================
// 3. AUTHENTICATION MIDDLEWARE
// ================================================

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // Check if token is blacklisted
    if (TokenManager.isTokenBlacklisted(token)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has been revoked' 
      });
    }

    // Verify token
    const decoded = TokenManager.verifyAccessToken(token);
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error.message 
    });
  }
};

// ================================================
// 4. ROLE-BASED ACCESS CONTROL
// ================================================

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    next();
  };
};

const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const adminAccess = await AdminAccess.findOne({ userId: req.userId });
      
      if (!adminAccess || !adminAccess.permissions) {
        return res.status(403).json({ 
          success: false, 
          message: 'No permissions assigned' 
        });
      }

      const hasPermission = requiredPermissions.every(
        perm => adminAccess.permissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Permission check failed',
        error: error.message 
      });
    }
  };
};

// ================================================
// 5. RATE LIMITING
// ================================================

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many OTP requests, please try again later'
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many booking requests, please try again later'
});

// ================================================
// 6. INPUT VALIDATION MIDDLEWARE
// ================================================

const { validationResult, body, param, query } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Common validators
const validators = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must contain letters, numbers, and special characters'),
  
  phone: body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be 10 digits'),
  
  otp: body('otp')
    .matches(/^[0-9]{6}$/)
    .withMessage('OTP must be 6 digits'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  
  rating: body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  bookingDate: body('appointmentDate')
    .isISO8601()
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    })
};

// ================================================
// 7. ERROR HANDLING MIDDLEWARE
// ================================================

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong JWT token
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token';
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Token has expired';
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    err.statusCode = 400;
    err.message = `${field} already exists`;
  }

  // Log error
  console.error('Error:', {
    timestamp: new Date().toISOString(),
    statusCode: err.statusCode,
    message: err.message,
    stack: err.stack
  });

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// ================================================
// 8. SECURITY HEADERS MIDDLEWARE
// ================================================

const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const securityMiddleware = [
  helmet(), // Set security HTTP headers
  compression(), // Gzip compression
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
];

// ================================================
// 9. AUDIT LOGGING MIDDLEWARE
// ================================================

const auditLogger = async (req, res, next) => {
  // Log after response is sent
  const originalJson = res.json;
  
  res.json = function(data) {
    if (req.userId && req.body) {
      const auditLog = {
        userId: req.userId,
        action: req.body.action || req.method,
        entityType: req.baseUrl.split('/')[2],
        entityId: req.body.entityId || req.params.id,
        changes: req.body,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: data.success ? 'success' : 'failure'
      };

      AuditLog.create(auditLog).catch(err => {
        console.error('Audit log failed:', err);
      });
    }
    return originalJson.call(this, data);
  };

  next();
};

// ================================================
// 10. UPLOAD VALIDATION MIDDLEWARE
// ================================================

const multer = require('multer');

const uploadConfig = {
  storage: multer.memoryStorage(), // Use memory storage, upload to Cloudinary
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = {
      video: ['video/mp4', 'video/quicktime', 'video/webm'],
      image: ['image/jpeg', 'image/png', 'image/webp']
    };

    const type = req.body.uploadType || 'image';
    
    if (allowedMimes[type].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid ${type} format`));
    }
  }
};

const upload = multer(uploadConfig);

// ================================================
// EXPORTS
// ================================================

module.exports = {
  TokenManager,
  OTPManager,
  authMiddleware,
  authorizeRoles,
  checkPermission,
  loginLimiter,
  otpLimiter,
  bookingLimiter,
  validateRequest,
  validators,
  AppError,
  errorHandler,
  securityMiddleware,
  auditLogger,
  upload
};
