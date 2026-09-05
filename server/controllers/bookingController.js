const crypto = require('crypto');
const DoctorProfile = require('../models/DoctorProfile');
const Booking = require('../models/Booking');
const { AppError, asyncHandler } = require('../middleware/error');

const SLOT_STEP_MINUTES = 30;

// GET /api/bookings/availability?date=YYYY-MM-DD
exports.getAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) throw new AppError('Date query parameter is required (YYYY-MM-DD)', 400);

  const doctor = await DoctorProfile.findOne({ deletedAt: null, bookingEnabled: true });
  if (!doctor) throw new AppError('Booking is currently unavailable', 503);

  const dayStart = new Date(`${date}T00:00:00`);
  if (Number.isNaN(dayStart.getTime())) throw new AppError('Invalid date format', 400);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  // Respect advance notice
  const minBookingTime = new Date(Date.now() + doctor.bookingAdvanceNotice * 60 * 60 * 1000);

  const [startH, startM] = (doctor.workingHours?.start || '09:00').split(':').map(Number);
  const [endH, endM] = (doctor.workingHours?.end || '18:00').split(':').map(Number);

  const allSlots = [];
  for (let minutes = startH * 60 + startM; minutes < endH * 60 + endM; minutes += SLOT_STEP_MINUTES) {
    allSlots.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }

  const bookings = await Booking.find({
    doctorId: doctor._id,
    appointmentDate: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ['pending', 'confirmed'] },
  }).select('timeSlot');

  const takenSlots = new Set(bookings.map((b) => b.timeSlot));

  const slots = allSlots.map((slot) => {
    const slotTime = new Date(`${date}T${slot}:00`);
    const available = !takenSlots.has(slot) && slotTime >= minBookingTime;
    return { slot, available };
  });

  res.json({
    success: true,
    data: { date, bookingOpen: doctor.bookingEnabled, advanceNoticeHours: doctor.bookingAdvanceNotice, slots },
  });
});

// POST /api/bookings — create booking (instant confirmation, no OTP)
exports.createBooking = asyncHandler(async (req, res) => {
  const { doctorId, patientName, patientEmail, patientPhone, service, appointmentDate, timeSlot, notes } = req.body;

  if (!patientName || !patientEmail || !patientPhone || !appointmentDate || !timeSlot) {
    throw new AppError('Missing required booking fields', 400);
  }
  if (!/^[0-9]{10}$/.test(patientPhone)) throw new AppError('Phone must be 10 digits', 400);
  if (!/^\S+@\S+\.\S+$/.test(patientEmail)) throw new AppError('A valid email is required', 400);

  // Single-doctor platform: fall back to the only active profile if no id given
  const doctor = doctorId
    ? await DoctorProfile.findOne({ _id: doctorId, deletedAt: null })
    : await DoctorProfile.findOne({ deletedAt: null });
  if (!doctor) throw new AppError('Doctor profile not found', 404);
  if (!doctor.bookingEnabled) throw new AppError('Booking is currently disabled', 503);

  const svc = doctor.services.find((s) => s.name === service);
  if (!svc) throw new AppError('Selected service is not available', 400);

  const booking = await Booking.create({
    bookingReference: `BK-${Date.now()}-${crypto.randomInt(100, 999)}`,
    doctorId: doctor._id,
    patientName: patientName.trim(),
    patientEmail: patientEmail.toLowerCase(),
    patientPhone,
    service: { name: svc.name, price: svc.price, duration: svc.duration },
    appointmentDate: new Date(`${appointmentDate}T00:00:00`),
    timeSlot,
    notes,
    isPhoneVerified: true,
    status: 'confirmed',
  });

  doctor.totalBookings += 1;
  await doctor.save({ validateBeforeSave: false });

  res.status(201).json({ success: true, message: 'Booking confirmed', data: booking });
});

// GET /api/bookings — admin list
exports.getBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { deletedAt: null };
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('doctorId', 'firstName lastName'),
    Booking.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: bookings,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total },
  });
});

// PATCH /api/bookings/:id — cancel / reschedule / status change (admin)
exports.updateBooking = asyncHandler(async (req, res) => {
  const { status, appointmentDate, timeSlot, cancellationReason } = req.body;
  const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null });
  if (!booking) throw new AppError('Booking not found', 404);

  if (status) {
    if (status === 'cancelled') {
      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      booking.cancellationReason = cancellationReason || 'Cancelled by admin';
    } else if (['pending', 'confirmed', 'completed', 'no_show'].includes(status)) {
      booking.status = status;
    } else {
      throw new AppError('Invalid status value', 400);
    }
  }
  if (appointmentDate) booking.appointmentDate = new Date(`${appointmentDate}T00:00:00`);
  if (timeSlot) booking.timeSlot = timeSlot;

  await booking.save();
  res.json({ success: true, message: 'Booking updated', data: booking });
});

// GET /api/bookings/:reference — public lookup by reference + email
exports.getBookingByReference = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    bookingReference: req.params.reference,
    patientEmail: (req.query.email || '').toLowerCase(),
    deletedAt: null,
  });
  if (!booking) throw new AppError('Booking not found', 404);
  res.json({ success: true, data: booking });
});
