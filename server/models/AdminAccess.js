const mongoose = require('mongoose');

const adminAccessSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    role: { type: String, enum: ['super_admin', 'admin', 'moderator'], default: 'admin' },
    permissions: [
      {
        type: String,
        enum: [
          'manage_profile',
          'manage_bookings',
          'moderate_reviews',
          'manage_users',
          'view_analytics',
          'manage_admin_access',
          'manage_payments',
        ],
      },
    ],
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    lastActivityAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminAccess', adminAccessSchema);
