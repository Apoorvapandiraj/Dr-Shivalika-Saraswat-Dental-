const router = require('express').Router();
const c = require('../controllers/bookingController');
const { authMiddleware, checkPermission } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimiter');

// Public
router.get('/availability', c.getAvailability);
router.post('/', bookingLimiter, c.createBooking);
router.get('/:reference', c.getBookingByReference);

// Admin
router.get('/', authMiddleware, checkPermission('manage_bookings'), c.getBookings);
router.patch('/:id', authMiddleware, checkPermission('manage_bookings'), c.updateBooking);

module.exports = router;
