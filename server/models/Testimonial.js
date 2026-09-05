const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true, index: true },
    patientName: { type: String, required: [true, 'Patient name is required'], trim: true },
    patientEmail: {
      type: String,
      required: [true, 'Patient email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    patientPhone: { type: String, match: [/^[0-9]{10}$/, 'Phone must be 10 digits'] },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 3000 },
    rating: { type: Number, required: true, min: 1, max: 5 },

    videoFile: { url: String, publicId: String, format: String }, // Cloudinary
    videoFormat: { type: String, default: 'Testimonial' },
    instagramReelsLink: String,
    treatment: { type: String, default: 'General Treatment' },

    isApproved: { type: Boolean, default: false },
    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date,

    deletedAt: Date, // soft delete
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
