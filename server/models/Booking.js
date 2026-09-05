const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: { type: String, unique: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    patientName: { type: String, required: [true, 'Patient name is required'], trim: true },
    patientEmail: {
      type: String,
      required: [true, 'Patient email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    patientPhone: { type: String, required: [true, 'Patient phone is required'], match: [/^[0-9]{10}$/, 'Phone must be 10 digits'] },

    service: {
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      duration: { type: Number, default: 30 },
    },
    appointmentDate: { type: Date, required: [true, 'Appointment date is required'], index: true },
    timeSlot: { type: String, required: [true, 'Time slot is required'] }, // "HH:mm"
    notes: String,

    isPhoneVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
      index: true,
    },

    payment: {
      provider: { type: String, enum: ['razorpay', 'manual', 'none'], default: 'none' },
      orderId: String,
      paymentId: String,
      signature: String,
      amount: Number,
      currency: { type: String, default: 'INR' },
      status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
    },

    cancelledAt: Date,
    cancellationReason: String,
    deletedAt: Date, // soft delete
  },
  { timestamps: true }
);

// Prevent double-booking of an active slot. NOTE: MongoDB's partialFilterExpression
// does not support $in, so we create one equality-filtered unique index per active status.
bookingSchema.index(
  { doctorId: 1, appointmentDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' }, name: 'unique_active_slot_pending' }
);
bookingSchema.index(
  { doctorId: 1, appointmentDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' }, name: 'unique_active_slot_confirmed' }
);
bookingSchema.index({ patientEmail: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
