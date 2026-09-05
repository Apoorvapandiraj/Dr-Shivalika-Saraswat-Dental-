const router = require('express').Router();
const c = require('../controllers/reviewController');
const { authMiddleware, checkPermission } = require('../middleware/auth');
const { videoUpload } = require('../middleware/upload');
const rateLimiter = require('../middleware/rateLimiter');

// Public
router.get('/doctor/:doctorId', c.getApprovedReviews);
router.post('/', c.submitReview);
router.get('/testimonials', c.getAllApprovedTestimonials);
router.get('/testimonials/pending', authMiddleware, checkPermission('moderate_reviews'), c.getPendingTestimonials);
router.get('/testimonials/doctor/:doctorId', c.getApprovedTestimonials);
// Reel submission: 50MB multipart, rate-limited (10 uploads / 30 min / IP)
router.post('/testimonials', rateLimiter.uploadLimiter, videoUpload.single('video'), c.submitTestimonial);

// Admin
router.get('/pending', authMiddleware, checkPermission('moderate_reviews'), c.getPendingReviews);
router.put('/:id/approve', authMiddleware, checkPermission('moderate_reviews'), c.approveReview);
router.put('/:id/reject', authMiddleware, checkPermission('moderate_reviews'), c.rejectReview);
router.put('/testimonials/:id/approve', authMiddleware, checkPermission('moderate_reviews'), c.approveTestimonial);
router.put('/testimonials/:id/reject', authMiddleware, checkPermission('moderate_reviews'), c.rejectTestimonial);

module.exports = router;
