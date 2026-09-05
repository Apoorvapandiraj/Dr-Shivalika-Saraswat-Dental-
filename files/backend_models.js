// ============================================
// MONGODB MONGOOSE SCHEMAS - PRODUCTION LEVEL
// ============================================

// 1. DOCTOR/PROFESSIONAL PROFILE MODEL
const doctorProfileSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
  },
  profileImage: {
    url: String,
    publicId: String // Cloudinary ID for deletion
  },
  
  // Professional Information
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: ['Dentistry', 'General Medicine', 'Cardiology', 'Dermatology', 'Orthopedics', 'Other']
  },
  qualifications: [{
    degree: String,
    institute: String,
    year: Number,
    certificate: {
      url: String,
      publicId: String
    }
  }],
  experience: {
    type: Number,
    required: [true, 'Experience years is required'],
    min: 0
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  
  // Professional Links
  linkedinUrl: {
    type: String,
    match: [/^(https?:\/\/)?(www\.)?linkedin\.com\/.*/, 'Invalid LinkedIn URL']
  },
  websiteUrl: String,
  
  // Services & Pricing
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number, // in minutes
      default: 30
    }
  }],
  
  // Google Reviews
  googleReviewsUrl: String,
  googlePlaceId: String,
  avgGoogleRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // Booking Settings
  bookingEnabled: {
    type: Boolean,
    default: true
  },
  bookingAdvanceNotice: {
    type: Number,
    default: 24, // hours
    min: 1
  },
  bufferBetweenAppointments: {
    type: Number,
    default: 15, // minutes
    min: 0
  },
  
  // Credentials & Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String, // URLs to verify qualifications
    url: String,
    publicId: String
  }],
  
  // Metadata
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date // Soft delete
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
doctorProfileSchema.index({ email: 1, isVerified: 1 });
doctorProfileSchema.index({ specialization: 1, rating: -1 });
doctorProfileSchema.index({ createdAt: -1 });

// Pre-save middleware for updatedAt
doctorProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports.DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

// ============================================
// 2. PATIENT TESTIMONIAL MODEL
// ============================================

const testimonialSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  
  // Patient Information
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  patientEmail: {
    type: String,
    required: [true, 'Patient email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  patientPhone: {
    type: String,
    required: [true, 'Patient phone is required'],
    match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
  },
  
  // Review Content
  title: {
    type: String,
    required: [true, 'Review title is required'],
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Review description is required'],
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    enum: [1, 2, 3, 4, 5],
    set: Math.round
  },
  
  // Media
  videoFile: {
    url: String,
    publicId: String, // Cloudinary ID
    duration: Number, // in seconds
    thumbnail: String
  },
  videoFormat: {
    type: String,
    enum: ['Reels', 'Short Video', 'Testimonial'],
    default: 'Testimonial'
  },
  instagramReelsLink: String,
  
  // Moderation
  isApproved: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  flagReason: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  moderatedAt: Date,
  
  // Spam Detection
  spamScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isFakeReview: {
    type: Boolean,
    default: false
  },
  
  // Engagement
  views: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  
  // Metadata
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  treatment: String, // Type of treatment/service
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date // Soft delete
}, {
  timestamps: true
});

// Indexes
testimonialSchema.index({ doctorId: 1, isApproved: 1, createdAt: -1 });
testimonialSchema.index({ rating: -1, isApproved: 1 });
testimonialSchema.index({ moderationStatus: 1, spamScore: -1 });

module.exports.Testimonial = mongoose.model('Testimonial', testimonialSchema);

// ============================================
// 3. GOOGLE REVIEWS MODEL
// ============================================

const googleReviewSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true,
    index: true
  },
  
  googleReviewId: {
    type: String,
    unique: true
  },
  
  authorName: String,
  authorImage: String,
  
  rating: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5]
  },
  
  text: String,
  
  publishedAt: Date,
  updatedAt: Date,
  
  // Sentiment Analysis
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  sentimentScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  
  // Metrics
  likes: {
    type: Number,
    default: 0
  },
  
  // Last synced from Google
  syncedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

googleReviewSchema.index({ doctorId: 1, rating: -1, publishedAt: -1 });

module.exports.GoogleReview = mongoose.model('GoogleReview', googleReviewSchema);

// ============================================
// 4. BOOKING/APPOINTMENT MODEL
// ============================================

const bookingSchema = new mongoose.Schema({
  // IDs
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    sparse: true // Can be null for unauthenticated bookings
  },
  
  // Patient Details
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  patientEmail: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  patientPhone: {
    type: String,
    required: [true, 'Phone is required'],
    match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
  },
  
  // Appointment Details
  serviceId: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Appointment date must be in the future'
    }
  },
  appointmentTime: {
    type: String,
    required: true, // HH:MM format
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  
  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
    index: true
  },
  
  // OTP Verification
  otpSent: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false // Don't return OTP by default
  },
  otpExpires: Date,
  otpVerified: {
    type: Boolean,
    default: false
  },
  otpVerifiedAt: Date,
  
  // Payment
  payment: {
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: Date
  },
  
  // Notes
  notes: String,
  
  // Notifications
  emailReminderSent: {
    type: Boolean,
    default: false
  },
  smsReminderSent: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: Date,
  confirmedAt: Date,
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

// Indexes for queries
bookingSchema.index({ doctorId: 1, appointmentDate: 1, status: 1 });
bookingSchema.index({ patientEmail: 1 });
bookingSchema.index({ appointmentDate: 1, status: 1 });

module.exports.Booking = mongoose.model('Booking', bookingSchema);

// ============================================
// 5. OTP VERIFICATION MODEL
// ============================================

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: String,
  otp: {
    type: String,
    required: true,
    select: false
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'booking_confirmation', 'password_reset'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Auto-delete after 15 minutes
    expires: 900 // 15 minutes in seconds
  }
});

module.exports.OTP = mongoose.model('OTP', otpSchema);

// ============================================
// 6. USER/PATIENT MODEL
// ============================================

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    url: String,
    publicId: String
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  deletedAt: Date // Soft delete
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ email: 1, role: 1 });

module.exports.User = mongoose.model('User', userSchema);

// ============================================
// 7. ADMIN ACCESS CONTROL MODEL
// ============================================

const adminAccessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_profile',
      'manage_bookings',
      'moderate_reviews',
      'manage_users',
      'view_analytics',
      'manage_admin_access',
      'manage_payments'
    ]
  }],
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastActivityAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports.AdminAccess = mongoose.model('AdminAccess', adminAccessSchema);

// ============================================
// 8. AUDIT LOG MODEL (Compliance)
// ============================================

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'create_profile',
      'update_profile',
      'delete_profile',
      'approve_review',
      'reject_review',
      'create_booking',
      'update_booking',
      'cancel_booking'
    ]
  },
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  changes: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    // Auto-delete after 90 days
    expires: 7776000 // 90 days in seconds
  }
});

module.exports.AuditLog = mongoose.model('AuditLog', auditLogSchema);
