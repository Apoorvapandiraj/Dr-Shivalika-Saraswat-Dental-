const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
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
        'cancel_booking',
      ],
    },
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    changes: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
  },
  {
    timestamps: true,
    // Auto-delete after 90 days (TTL index set below)
  }
);

auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
