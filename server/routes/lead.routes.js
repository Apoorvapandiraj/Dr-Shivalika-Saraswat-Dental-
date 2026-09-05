const router = require('express').Router();
const { createLead } = require('../controllers/leadController');
const { asyncHandler } = require('../middleware/error');
const { authMiddleware } = require('../middleware/auth');
const { leadLimiter } = require('../middleware/rateLimiter');

// Public — website chat widget
router.post('/', leadLimiter, asyncHandler(createLead));

// Admin list (all methods below require auth)
router.use(authMiddleware);
router.get('/', require('../controllers/leadController').getLeads);

module.exports = router;