const mongoose = require('mongoose');

// Doctor's "Case Vault" — before/after clinical transformations
const caseStudySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    category: {
      type: String,
      required: true,
      enum: ['Full Mouth Rehabilitation', 'Teeth Whitening', 'Aligners', 'Veneers', 'Implants', 'Other'],
      default: 'Other',
    },
    description: { type: String, maxlength: 1000 },
    beforeImage: { url: { type: String, required: true }, publicId: String },
    afterImage: { url: { type: String, required: true }, publicId: String },
    treatmentDuration: String, // e.g. "3 months"
    isApproved: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    deletedAt: Date, // soft delete
  },
  { timestamps: true }
);

caseStudySchema.index({ isApproved: 1, displayOrder: 1 });

module.exports = mongoose.model('CaseStudy', caseStudySchema);
