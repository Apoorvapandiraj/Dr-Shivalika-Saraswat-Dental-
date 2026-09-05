const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { loginLimiter, otpLimiter, registerLimiter, refreshLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');

const passwordRules = body('password')
  .isLength({ min: 8, max: 72 }).withMessage('Password must be 8–72 characters')
  .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
  .matches(/[0-9]/).withMessage('Password must contain a number');

router.post(
  '/register',
  registerLimiter,
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  passwordRules,
  validate,
  c.register
);
router.post('/login', loginLimiter, c.login);
router.post('/refresh', refreshLimiter, c.refresh);
router.post('/logout', authMiddleware, c.logout);
router.post('/send-otp', otpLimiter, c.sendOTP);
router.post('/verify-otp', otpLimiter, c.verifyOTP);
router.get('/me', authMiddleware, c.getMe);

module.exports = router;
