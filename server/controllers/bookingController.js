const crypto = require('crypto');
const DoctorProfile = require('../models/DoctorProfile');
const Booking = require('../models/Booking');
const { AppError, asyncHandler } = require('../middleware/error');
const sendBookingConfirmation = require('../services/bookingEmail');

const SLOT_STEP_MINUTES = 30;
const KOLKATA_OFFSET_MINUTES = 5 * 60 + 30;

const parseDateOnly = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError('Date must use YYYY-MM-DD format', 400);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new AppError('Invalid date', 400);
  }
  return date;
};

const clockMinutes = (value) => {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new AppError('Time must use HH:mm format', 400);
  }
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const clinicInstant = (date, minutes) => new Date(
  date.getTime() + (minutes - KOLKATA_OFFSET_MINUTES) * 60 * 1000
);

const dateEnd = (date) => new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1);

const overlapsBooking = (start, duration, booking, buffer) => {
  const bookingStart = clockMinutes(booking.timeSlot);
  const bookingDuration = Number(booking.service?.duration) || 30;
  const end = start + duration;
  const bookingEnd = bookingStart + bookingDuration;
  return start < bookingEnd + buffer && end + buffer > bookingStart;
};

// GET /api/bookings/availability?date=YYYY-MM-DD
exports.getAvailability = asyncHandler(async (req, res) => {
  const { date, service } = req.query;
  if (!date) throw new AppError('Date query parameter is required (YYYY-MM-DD)', 400);

  const doctor = await DoctorProfile.findOne({ deletedAt: null, bookingEnabled: true });
  if (!doctor) throw new AppError('Booking is currently unavailable', 503);

  const dayStart = parseDateOnly(date);
  const dayEnd = dateEnd(dayStart);
  const selectedService = service ? doctor.services.find((item) => item.name === service) : null;
  if (service && !selectedService) throw new AppError('Selected service is not available', 400);
  const duration = Number(selectedService?.duration) || 30;

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
  }).select('timeSlot service.duration');

  const slots = allSlots.map((slot) => {
    const start = clockMinutes(slot);
    const withinWorkingHours = start >= startH * 60 + startM && start + duration <= endH * 60 + endM;
    const slotTime = clinicInstant(dayStart, start);
    const conflicts = bookings.some((booking) => overlapsBooking(
      start,
      duration,
      booking,
      doctor.bufferBetweenAppointments || 0
    ));
    const available = withinWorkingHours && !conflicts && slotTime >= minBookingTime;
    return { slot, available };
  });

  res.json({
    success: true,
    data: { date, bookingOpen: doctor.bookingEnabled, advanceNoticeHours: doctor.bookingAdvanceNotice, slots },
  });
});

// POST /api/bookings — create booking (instant confirmation, no OTP)
exports.createBooking = asyncHandler(async (req, res) => {
  const {
    doctorId, patientName, patientEmail, patientPhone, service,
    appointmentDate, timeSlot, notes, idempotencyKey,
  } = req.body;

  if (!patientName || !patientEmail || !patientPhone || !appointmentDate || !timeSlot) {
    throw new AppError('Missing required booking fields', 400);
  }
  if (idempotencyKey && (typeof idempotencyKey !== 'string' || !/^[\w-]{16,100}$/.test(idempotencyKey))) {
    throw new AppError('Invalid idempotency key', 400);
  }
  if (!/^[0-9]{10}$/.test(patientPhone)) throw new AppError('Phone must be 10 digits', 400);
  if (!/^\S+@\S+\.\S+$/.test(patientEmail)) throw new AppError('A valid email is required', 400);
  if (idempotencyKey) {
    const existingRequest = await Booking.findOne({ idempotencyKey });
    if (existingRequest) {
      return res.status(200).json({
        success: true,
        message: 'Booking already confirmed',
        data: { ...existingRequest.toObject(), emailSent: existingRequest.confirmationEmailSent },
      });
    }
  }
  const dayStart = parseDateOnly(appointmentDate);
  const requestedTime = clockMinutes(timeSlot);

  // Single-doctor platform: fall back to the only active profile if no id given
  const doctor = doctorId
    ? await DoctorProfile.findOne({ _id: doctorId, deletedAt: null })
    : await DoctorProfile.findOne({ deletedAt: null });
  if (!doctor) throw new AppError('Doctor profile not found', 404);
  if (!doctor.bookingEnabled) throw new AppError('Booking is currently disabled', 503);

  const svc = doctor.services.find((s) => s.name === service);
  if (!svc) throw new AppError('Selected service is not available', 400);

  const [startH, startM] = (doctor.workingHours?.start || '09:00').split(':').map(Number);
  const [endH, endM] = (doctor.workingHours?.end || '18:00').split(':').map(Number);
  const duration = Number(svc.duration) || 30;
  const startOfDay = startH * 60 + startM;
  const endOfDay = endH * 60 + endM;
  if (
    requestedTime < startOfDay
    || requestedTime + duration > endOfDay
    || (requestedTime - startOfDay) % SLOT_STEP_MINUTES !== 0
  ) {
    throw new AppError('Selected time is outside the available appointment slots', 400);
  }
  if (clinicInstant(dayStart, requestedTime) < new Date(Date.now() + doctor.bookingAdvanceNotice * 60 * 60 * 1000)) {
    throw new AppError('Selected time does not meet the clinic advance-notice requirement', 400);
  }

  const existingBookings = await Booking.find({
    doctorId: doctor._id,
    appointmentDate: { $gte: dayStart, $lte: dateEnd(dayStart) },
    status: { $in: ['pending', 'confirmed'] },
  }).select('timeSlot service.duration');
  if (existingBookings.some((booking) => overlapsBooking(
    requestedTime,
    duration,
    booking,
    doctor.bufferBetweenAppointments || 0
  ))) {
    throw new AppError('This appointment time is no longer available. Please choose another slot.', 409);
  }

  let booking;
  try {
    booking = await Booking.create({
      bookingReference: `BK-${Date.now()}-${crypto.randomInt(100, 999)}`,
      idempotencyKey,
      doctorId: doctor._id,
      patientName: patientName.trim(),
      patientEmail: patientEmail.toLowerCase(),
      patientPhone,
      service: { name: svc.name, price: svc.price, duration: svc.duration },
      appointmentDate: dayStart,
      timeSlot,
      notes,
      isPhoneVerified: true,
      status: 'confirmed',
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
    if (idempotencyKey) {
      const existingRequest = await Booking.findOne({ idempotencyKey });
      if (existingRequest) {
        return res.status(200).json({
          success: true,
          message: 'Booking already confirmed',
          data: { ...existingRequest.toObject(), emailSent: existingRequest.confirmationEmailSent },
        });
      }
    }
    throw new AppError('This appointment time was just booked. Please choose another slot.', 409);
  }

  doctor.totalBookings += 1;
  await doctor.save({ validateBeforeSave: false });

  let emailSent = false;
  try {
    emailSent = await sendBookingConfirmation(booking);
    if (emailSent) {
      booking.confirmationEmailSent = true;
      await booking.save();
    }
  } catch (error) {
    console.error('Booking was saved, but confirmation email failed:', error);
  }

  res.status(201).json({
  success: true,
  message: 'Booking confirmed',
  data: { ...booking.toObject(), emailSent },
  });
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
  if (appointmentDate) booking.appointmentDate = parseDateOnly(appointmentDate);
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
