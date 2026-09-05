const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, index: true }, // email or phone
    purpose: { type: String, enum: ['booking', 'verification', 'login'], default: 'booking' },
    hashedOtp: { type: String, required: true },
    attempts: { type: Number, default: 0, max: 5 },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL: documents auto-delete 1 hour after expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('Otp', otpSchema);
