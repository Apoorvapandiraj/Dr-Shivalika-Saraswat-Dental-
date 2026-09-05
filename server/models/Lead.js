const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    phone: { type: String, required: [true, 'Phone is required'], match: [/^[0-9]{10}$/, 'Phone must be 10 digits'] },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true },
    interest: { type: String, default: '', maxlength: 120 },
    note: { type: String, default: '', maxlength: 1000 },
    source: { type: String, default: 'website_chat' },
    status: { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new' },
    deletedAt: Date, // soft delete
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('Lead', leadSchema);