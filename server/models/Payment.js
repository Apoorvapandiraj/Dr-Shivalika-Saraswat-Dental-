const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    provider: { type: String, enum: ['razorpay', 'manual'], default: 'razorpay' },
    orderId: { type: String, index: true },
    paymentId: String,
    signature: String,
    amount: { type: Number, required: true, min: 0 }, // in paise
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created', index: true },
    receipt: String,
    notes: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
