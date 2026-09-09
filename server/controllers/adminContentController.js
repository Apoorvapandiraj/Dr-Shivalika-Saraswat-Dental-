const DoctorProfile = require('../models/DoctorProfile');
const CaseStudy = require('../models/CaseStudy');
const { AppError, asyncHandler } = require('../middleware/error');
const { upload } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CONTENT_DIR = path.join(__dirname, '..', 'uploads', 'content');

const saveImageFile = (file, req) => {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  const ext = file.mimetype.includes('png') ? 'png' : file.mimetype.includes('webp') ? 'webp' : 'jpg';
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filepath = path.join(CONTENT_DIR, filename);
  fs.writeFileSync(filepath, file.buffer);
  const origin = `${req.protocol}://${req.get('host')}`;
  return { url: `${origin}/uploads/content/${filename}`, publicId: filename };
};

exports.getContentDashboard = asyncHandler(async (req, res) => {
  const [profile, caseStudies] = await Promise.all([
    DoctorProfile.findOne({ deletedAt: null }).lean(),
    CaseStudy.find({ deletedAt: null }).sort({ displayOrder: 1, createdAt: -1 }).lean(),
  ]);

  if (!profile) {
    throw new AppError('Doctor profile not found', 404);
  }

  res.json({
    success: true,
    data: {
      profile,
      caseStudies,
    },
  });
});

exports.updateProfileContent = asyncHandler(async (req, res) => {
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

  const profile = await DoctorProfile.findOneAndUpdate({ deletedAt: null }, updates, {
    new: true,
    runValidators: true,
    omitUndefined: true,
  });

  if (!profile) throw new AppError('Doctor profile not found', 404);

  res.json({ success: true, message: 'Content saved', data: profile });
});

exports.uploadContentImage = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new AppError('Image file is required', 400);
  if (!IMAGE_TYPES.includes(file.mimetype)) throw new AppError('Only JPG, PNG and WEBP images are allowed', 400);

  const image = saveImageFile(file, req);
  res.status(201).json({ success: true, message: 'Image uploaded', data: image });
});

exports.createCaseStudyForAdmin = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (!payload.title) throw new AppError('Case study title is required', 400);
  if (!payload.beforeImage?.url || !payload.afterImage?.url) {
    throw new AppError('Before and after images are required', 400);
  }

  const caseStudy = await CaseStudy.create({
    title: payload.title,
    category: payload.category || 'Other',
    description: payload.description || '',
    beforeImage: { url: payload.beforeImage.url, publicId: payload.beforeImage.publicId || undefined },
    afterImage: { url: payload.afterImage.url, publicId: payload.afterImage.publicId || undefined },
    treatmentDuration: payload.treatmentDuration || '',
    displayOrder: Number(payload.displayOrder) || 0,
    isApproved: payload.isApproved !== undefined ? Boolean(payload.isApproved) : true,
  });

  res.status(201).json({ success: true, message: 'Case study created', data: caseStudy });
});

exports.updateCaseStudyForAdmin = asyncHandler(async (req, res) => {
  const allowed = ['title', 'category', 'description', 'beforeImage', 'afterImage', 'treatmentDuration', 'displayOrder', 'isApproved'];
  const updates = {};

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const caseStudy = await CaseStudy.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, updates, {
    new: true,
    runValidators: true,
    omitUndefined: true,
  });

  if (!caseStudy) throw new AppError('Case study not found', 404);

  res.json({ success: true, message: 'Case study updated', data: caseStudy });
});

exports.deleteCaseStudyForAdmin = asyncHandler(async (req, res) => {
  const caseStudy = await CaseStudy.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!caseStudy) throw new AppError('Case study not found', 404);

  res.json({ success: true, message: 'Case study removed', data: caseStudy });
});

exports.adminUploadMiddleware = upload.single('image');
