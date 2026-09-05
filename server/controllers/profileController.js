const DoctorProfile = require('../models/DoctorProfile');
const CaseStudy = require('../models/CaseStudy');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/error');

// Default pricing config used when a profile has none yet (graceful degradation)
const DEFAULT_PRICING = {
  perToothServices: ['Dental Implants', 'Porcelain Veneers', 'Teeth Whitening'],
  additionalToothFactor: 0.6,
  materials: [
    { name: 'Ceramic', multiplier: 0.85 },
    { name: 'Zirconia', multiplier: 1 },
    { name: 'Titanium', multiplier: 1.15 },
  ],
  sedation: [
    { name: 'None', price: 0 },
    { name: 'Local Anesthesia', price: 500 },
    { name: 'Conscious Sedation', price: 3500 },
  ],
};

// GET /api/profile — public doctor profile
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await DoctorProfile.findOne({ deletedAt: null }).select('-__v');
  if (!profile) throw new AppError('Profile not found', 404);
  res.json({ success: true, data: profile });
});

// PUT /api/profile — update (admin, permission: manage_profile)
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'firstName', 'lastName', 'email', 'phone', 'specialization', 'qualifications',
    'experience', 'bio', 'linkedinUrl', 'websiteUrl', 'services', 'workingHours',
    'googleReviewsUrl', 'googlePlaceId', 'avgGoogleRating', 'bookingEnabled',
    'bookingAdvanceNotice', 'bufferBetweenAppointments', 'profileImage', 'pricingConfig',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const profile = await DoctorProfile.findOneAndUpdate(
    { deletedAt: null },
    { ...updates, req_user: undefined },
    { new: true, runValidators: true, omitUndefined: true }
  );
  if (!profile) throw new AppError('Profile not found', 404);

  res.json({ success: true, message: 'Profile updated', data: profile });
});

// GET /api/admin/analytics — dashboard stats (admin, permission: view_analytics)
exports.getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalBookings, pendingBookings, completedBookings, cancelledBookings, pendingReviews, totalPatients] =
    await Promise.all([
      Booking.countDocuments({ deletedAt: null }),
      Booking.countDocuments({ status: 'pending', deletedAt: null }),
      Booking.countDocuments({ status: 'completed', deletedAt: null }),
      Booking.countDocuments({ status: 'cancelled', deletedAt: null }),
      Review.countDocuments({ moderationStatus: 'pending', deletedAt: null }),
      User.countDocuments({ role: 'patient', deletedAt: null }),
    ]);

  // Revenue from confirmed/completed bookings this month
  const monthBookings = await Booking.find({
    deletedAt: null,
    status: { $in: ['confirmed', 'completed'] },
    createdAt: { $gte: monthStart },
  }).select('service.price');

  const monthlyRevenue = monthBookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);

  res.json({
    success: true,
    data: {
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      pendingReviews,
      totalPatients,
      monthlyRevenue,
    },
  });
});

// POST /api/profile/estimate — treatment cost estimator (public, no persistence)
exports.estimateTreatmentCost = asyncHandler(async (req, res) => {
  const { service, teeth = 1, material, sedation } = req.body || {};

  const profile = await DoctorProfile.findOne({ deletedAt: null }).select('services pricingConfig');
  if (!profile) throw new AppError('Profile not found', 404);

  const svc = profile.services.find((s) => s.name === service);
  if (!svc) {
    const names = profile.services.map((s) => s.name).join(', ');
    throw new AppError(`Unknown service "${service}". Available: ${names}`, 400);
  }

  // Merge profile config over defaults — but fall back to defaults when the
  // profile's arrays are empty (e.g. seeded before pricingConfig existed)
  const pc = profile.pricingConfig?.toObject?.() || profile.pricingConfig || {};
  const cfg = {
    perToothServices: pc.perToothServices?.length ? pc.perToothServices : DEFAULT_PRICING.perToothServices,
    additionalToothFactor: pc.additionalToothFactor ?? DEFAULT_PRICING.additionalToothFactor,
    materials: pc.materials?.length ? pc.materials : DEFAULT_PRICING.materials,
    sedation: pc.sedation?.length ? pc.sedation : DEFAULT_PRICING.sedation,
  };
  const toothCount = Math.max(1, Math.min(32, Number(teeth) || 1));
  const isPerTooth = cfg.perToothServices?.includes(service) || false;

  // Base: per-tooth services scale as 1 + (n-1)*factor; flat services are flat
  const basePrice = isPerTooth
    ? svc.price * (1 + (toothCount - 1) * (cfg.additionalToothFactor ?? 0.6))
    : svc.price;

  const mat = cfg.materials?.find((m) => m.name === material);
  const sed = cfg.sedation?.find((s) => s.name === sedation);
  const materialMultiplier = mat?.multiplier ?? 1;
  const sedationPrice = sed?.price ?? 0;

  const total = Math.round(basePrice * materialMultiplier + sedationPrice);

  res.json({
    success: true,
    data: {
      service: svc.name,
      teeth: isPerTooth ? toothCount : null,
      pricedPerTooth: isPerTooth,
      material: mat ? mat.name : null,
      sedation: sed ? sed.name : null,
      breakdown: {
        basePrice: Math.round(basePrice),
        materialMultiplier,
        sedationPrice,
      },
      estimatedTotal: total,
      currency: 'INR',
      note: 'Indicative estimate only — final quote after clinical examination.',
    },
  });
});

// ── Case Vault (before/after showcase) ─────────────────────────────

// GET /api/profile/case-vault — public, approved cases
exports.getCaseVault = asyncHandler(async (req, res) => {
  const cases = await CaseStudy.find({ isApproved: true, deletedAt: null })
    .sort({ displayOrder: 1, createdAt: -1 })
    .select('-deletedAt -__v');
  res.json({ success: true, data: cases });
});

// POST /api/profile/case-vault — create (admin, manage_profile)
exports.createCaseStudy = asyncHandler(async (req, res) => {
  const cs = await CaseStudy.create(req.body);
  res.status(201).json({ success: true, message: 'Case study created', data: cs });
});

// PUT /api/profile/case-vault/:id — update (admin, manage_profile)
exports.updateCaseStudy = asyncHandler(async (req, res) => {
  const allowed = ['title', 'category', 'description', 'beforeImage', 'afterImage', 'treatmentDuration', 'isApproved', 'displayOrder'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const cs = await CaseStudy.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, updates, {
    new: true, runValidators: true,
  });
  if (!cs) throw new AppError('Case study not found', 404);
  res.json({ success: true, message: 'Case study updated', data: cs });
});

// DELETE /api/profile/case-vault/:id — soft delete (admin, manage_profile)
exports.deleteCaseStudy = asyncHandler(async (req, res) => {
  const cs = await CaseStudy.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!cs) throw new AppError('Case study not found', 404);
  res.json({ success: true, message: 'Case study deleted' });
});
