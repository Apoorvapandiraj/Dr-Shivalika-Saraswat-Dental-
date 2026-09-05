const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true, index: true },
    patientName: { type: String, required: [true, 'Name is required'], trim: true },
    patientEmail: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    rating: { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
    comment: { type: String, required: [true, 'Review comment is required'], maxlength: 2000, trim: true },

    moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    isApproved: { type: Boolean, default: false },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date,
    rejectionReason: String,

    deletedAt: Date, // soft delete
  },
  { timestamps: true }
);

reviewSchema.index({ doctorId: 1, moderationStatus: 1 });

module.exports = mongoose.model('Review', reviewSchema);
