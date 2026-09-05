const Review = require('../models/Review');
const Testimonial = require('../models/Testimonial');
const DoctorProfile = require('../models/DoctorProfile');
const { AppError, asyncHandler } = require('../middleware/error');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VIDEO_MIMES = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
const REELS_DIR = path.join(__dirname, '..', 'uploads', 'testimonials');

// Save an uploaded reel to local disk with a randomized name (never trust client filenames).
// Swap this for a Cloudinary stream upload in production (see files/ENV_CONFIG_AND_DEPLOYMENT.md).
const saveReelFile = (file) => {
  fs.mkdirSync(REELS_DIR, { recursive: true });
  const ext = VIDEO_MIMES[file.mimetype];
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(REELS_DIR, filename);
  fs.writeFileSync(filepath, file.buffer);
  return { url: `/uploads/testimonials/${filename}`, publicId: filename, format: ext };
};

const deleteReelFile = (publicId) => {
  if (!publicId) return;
  const filepath = path.join(REELS_DIR, path.basename(publicId)); // basename: block path traversal
  fs.promises.unlink(filepath).catch(() => {});
};

const recalcDoctorRating = async (doctorId) => {
  const [approvedReviews, approvedTestimonials] = await Promise.all([
    Review.find({ doctorId, isApproved: true, deletedAt: null }).select('rating'),
    Testimonial.find({ doctorId, isApproved: true, deletedAt: null }).select('rating'),
  ]);

  const approved = [...approvedReviews, ...approvedTestimonials];
  const avg = approved.length ? approved.reduce((sum, item) => sum + Number(item.rating || 0), 0) / approved.length : 0;

  await DoctorProfile.findByIdAndUpdate(doctorId, {
    rating: Math.round(avg * 10) / 10,
    totalReviews: approved.length,
  });
};

// GET /api/reviews/doctor/:doctorId — approved reviews (public)
exports.getApprovedReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, rating } = req.query;
  const filter = { doctorId: req.params.doctorId, isApproved: true, deletedAt: null };
  if (rating) filter.rating = Number(rating);

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit),
    Review.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
  });
});

// POST /api/reviews — submit review (goes to moderation)
exports.submitReview = asyncHandler(async (req, res) => {
  const { doctorId, patientName, patientEmail, rating, comment } = req.body;
  if (!doctorId || !patientName || !patientEmail || !rating || !comment) {
    throw new AppError('All review fields are required', 400);
  }

  const doctor = await DoctorProfile.findOne({ _id: doctorId, deletedAt: null });
  if (!doctor) throw new AppError('Doctor profile not found', 404);

  const review = await Review.create({
    doctorId,
    patientName: patientName.trim(),
    patientEmail: patientEmail.toLowerCase(),
    rating: Number(rating),
    comment: comment.trim(),
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully. It will be visible after approval.',
    data: review,
  });
});

// GET /api/reviews/pending (admin)
exports.getPendingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ moderationStatus: 'pending', deletedAt: null }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: reviews });
});

// PUT /api/reviews/:id/approve (admin)
exports.approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, moderationStatus: 'approved', moderatedBy: req.userId, moderatedAt: new Date() },
    { new: true }
  );
  if (!review) throw new AppError('Review not found', 404);
  await recalcDoctorRating(review.doctorId);
  res.json({ success: true, message: 'Review approved', data: review });
});

// PUT /api/reviews/:id/reject (admin)
exports.rejectReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      isApproved: false,
      moderationStatus: 'rejected',
      moderatedBy: req.userId,
      moderatedAt: new Date(),
      rejectionReason: req.body.reason || 'Does not meet guidelines',
    },
    { new: true }
  );
  if (!review) throw new AppError('Review not found', 404);
  await recalcDoctorRating(review.doctorId);
  res.json({ success: true, message: 'Review rejected', data: review });
});

// ============ TESTIMONIALS ============

// GET /api/reviews/testimonials — all approved testimonials (public)
exports.getAllApprovedTestimonials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { isApproved: true, deletedAt: null };

  const [testimonials, total] = await Promise.all([
    Testimonial.find(filter).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).select('-patientEmail -patientPhone'),
    Testimonial.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: testimonials,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
  });
});

// GET /api/reviews/testimonials/pending (admin)
exports.getPendingTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ moderationStatus: 'pending', deletedAt: null })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('-patientEmail -patientPhone');
  res.json({ success: true, data: testimonials });
});

// GET /api/testimonials/doctor/:doctorId — approved (public)
exports.getApprovedTestimonials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { doctorId: req.params.doctorId, isApproved: true, deletedAt: null };

  const [testimonials, total] = await Promise.all([
    Testimonial.find(filter).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit),
    Testimonial.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: testimonials,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
  });
});

// POST /api/reviews/testimonials — submit reel or text testimonial (multipart; goes to moderation)
exports.submitTestimonial = asyncHandler(async (req, res) => {
  // Multipart: fields arrive in req.body, video in req.file
  const { doctorId, patientName, patientEmail, patientPhone, title, description, rating, treatment } = req.body;
  if (!doctorId || !patientName || !patientEmail || !rating) {
    throw new AppError('Name, email and rating are required', 400);
  }
  // A reel needs at least a caption OR a description
  if (!req.file && !description) {
    throw new AppError('Please add a caption or description for your testimonial', 400);
  }

  const doctor = await DoctorProfile.findOne({ _id: doctorId, deletedAt: null });
  if (!doctor) throw new AppError('Doctor profile not found', 404);

  const testimonial = await Testimonial.create({
    doctorId,
    patientName: patientName.trim(),
    patientEmail: patientEmail.toLowerCase(),
    patientPhone,
    title: (title || 'Patient Story').trim().slice(0, 150),
    description: (description || title || 'Video testimonial').trim().slice(0, 3000),
    rating: parseInt(rating, 10),
    treatment: treatment || 'General Treatment',
    videoFile: req.file ? saveReelFile(req.file) : undefined,
    videoFormat: req.file ? 'Reel' : 'Testimonial',
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your story was received and will be visible after moderation.',
    data: { _id: testimonial._id, hasVideo: Boolean(req.file) },
  });
});

// PUT /api/testimonials/:id/approve (admin)
exports.approveTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, moderationStatus: 'approved', moderatedBy: req.userId, moderatedAt: new Date() },
    { new: true }
  );
  if (!testimonial) throw new AppError('Testimonial not found', 404);
  await recalcDoctorRating(testimonial.doctorId);
  res.json({ success: true, message: 'Testimonial approved', data: testimonial });
});

// PUT /api/testimonials/:id/reject (admin) — also deletes the video file (privacy)
exports.rejectTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { isApproved: false, moderationStatus: 'rejected', moderatedBy: req.userId, moderatedAt: new Date() },
    { new: true }
  );
  if (!testimonial) throw new AppError('Testimonial not found', 404);
  await recalcDoctorRating(testimonial.doctorId);
  if (testimonial.videoFile?.publicId) deleteReelFile(testimonial.videoFile.publicId);
  res.json({ success: true, message: 'Testimonial rejected and video removed', data: testimonial });
});
