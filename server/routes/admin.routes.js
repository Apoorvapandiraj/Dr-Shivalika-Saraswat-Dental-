const router = require('express').Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { asyncHandler, AppError } = require('../middleware/error');
const {
  getContentDashboard,
  updateProfileContent,
  uploadContentImage,
  createCaseStudyForAdmin,
  updateCaseStudyForAdmin,
  deleteCaseStudyForAdmin,
  adminUploadMiddleware,
} = require('../controllers/adminContentController');

// All admin routes require an authenticated admin user
router.use(authMiddleware, authorizeRoles('admin'));

// GET /api/admin/users
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await User.find({ deletedAt: null }).select('-password');
    res.json({ success: true, data: users });
  })
);

// GET /api/admin/audit-logs
router.get(
  '/audit-logs',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const [logs, total] = await Promise.all([
      AuditLog.find({})
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('userId', 'name email'),
      AuditLog.countDocuments({}),
    ]);
    res.json({
      success: true,
      data: logs,
      pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
    });
  })
);

// DELETE /api/admin/users/:id — soft delete
router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (String(req.params.id) === String(req.userId)) throw new AppError('You cannot delete your own account', 400);
    const user = await User.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, message: 'User deactivated', data: { id: user._id } });
  })
);

// Content management dashboard
router.get('/content', getContentDashboard);
router.put('/content/profile', updateProfileContent);
router.post('/content/upload-image', adminUploadMiddleware, uploadContentImage);
router.post('/content/case-study', createCaseStudyForAdmin);
router.put('/content/case-study/:id', updateCaseStudyForAdmin);
router.delete('/content/case-study/:id', deleteCaseStudyForAdmin);

// Chat-lead management (leads captured by the public website chatbot)
const leadController = require('../controllers/leadController');
router.get('/leads', leadController.getLeads);
router.patch('/leads/:id', leadController.updateLeadStatus);
router.delete('/leads/:id', leadController.deleteLead);

module.exports = router;
