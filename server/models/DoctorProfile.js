const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'], trim: true, minlength: 2 },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    phone: { type: String, required: [true, 'Phone is required'], unique: true, match: [/^[0-9]{10}$/, 'Phone must be 10 digits'] },
    profileImage: { url: String, publicId: String }, // Cloudinary

    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      enum: ['Dentistry', 'General Medicine', 'Cardiology', 'Dermatology', 'Orthopedics', 'Other'],
    },
    qualifications: [
      {
        degree: String,
        institute: String,
        year: Number,
        certificate: { url: String, publicId: String },
      },
    ],
    experience: { type: Number, required: [true, 'Experience years is required'], min: 0 },
    bio: { type: String, maxlength: 1000 },

    linkedinUrl: { type: String, match: [/^(https?:\/\/)?(www\.)?linkedin\.com\/.*/, 'Invalid LinkedIn URL'] },
    websiteUrl: String,

    services: [
      {
        name: { type: String, required: true },
        description: String,
        price: { type: Number, required: true, min: 0 },
        duration: { type: Number, default: 30 }, // minutes
        image: { url: String, publicId: String }, // treatment card image (uploaded via admin)
      },
    ],

    // Treatment cost estimator configuration (luxury calculator)
    pricingConfig: {
      // Services priced per tooth (estimate multiplies by tooth count)
      perToothServices: { type: [String], default: [] },
      // Extra tooth beyond the first costs a fraction of the base price
      additionalToothFactor: { type: Number, default: 0.6, min: 0, max: 1 },
      materials: [
        {
          name: { type: String, required: true },
          multiplier: { type: Number, default: 1, min: 0.1 }, // × base price
          description: String,
        },
      ],
      sedation: [
        {
          name: { type: String, required: true },
          price: { type: Number, default: 0, min: 0 }, // flat add-on
        },
      ],
    },

    // Case Vault (before/after showcase) is stored in the CaseStudy collection

    // Working hours (24h "HH:mm" strings) used to generate bookable slots
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
    },

    // Google Reviews
    googleReviewsUrl: String,
    googlePlaceId: String,
    avgGoogleRating: { type: Number, default: 0, min: 0, max: 5 },

    // Booking settings
    bookingEnabled: { type: Boolean, default: true },
    bookingAdvanceNotice: { type: Number, default: 24, min: 1 }, // hours
    bufferBetweenAppointments: { type: Number, default: 15, min: 0 }, // minutes

    // Metadata
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },

    deletedAt: Date, // soft delete
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

doctorProfileSchema.index({ specialization: 1 });
doctorProfileSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
