const router = require('express').Router();
const {
  getProfile, updateProfile, getAnalytics,
  estimateTreatmentCost, getCaseVault, createCaseStudy, updateCaseStudy, deleteCaseStudy,
} = require('../controllers/profileController');
const { authMiddleware, checkPermission } = require('../middleware/auth');
const { auditLogger } = require('../middleware/audit');

// Public
router.get('/', getProfile);
router.get('/case-vault', getCaseVault);
router.post('/estimate', estimateTreatmentCost);

// Admin — tag the audit action before the audit logger runs
router.put(
  '/',
  (req, res, next) => {
    req.auditAction = 'update_profile';
    req.auditEntity = 'DoctorProfile';
    next();
  },
  auditLogger,
  authMiddleware,
  checkPermission('manage_profile'),
  updateProfile
);

// Case Vault management (admin)
router.post('/case-vault', authMiddleware, checkPermission('manage_profile'), auditLogger, createCaseStudy);
router.put('/case-vault/:id', authMiddleware, checkPermission('manage_profile'), auditLogger, updateCaseStudy);
router.delete('/case-vault/:id', authMiddleware, checkPermission('manage_profile'), auditLogger, deleteCaseStudy);

router.get('/analytics', authMiddleware, checkPermission('view_analytics'), getAnalytics);

module.exports = router;
