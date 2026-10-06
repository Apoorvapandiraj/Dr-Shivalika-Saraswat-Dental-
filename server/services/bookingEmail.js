const nodemailer = require('nodemailer');

const sendBookingConfirmation = async (booking) => {
  if (process.env.NODE_ENV === 'test') return false;

  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const password = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  if (!user || !password) {
    console.warn('Booking email not sent: configure SMTP_USER and SMTP_PASS (or GMAIL_USER and GMAIL_APP_PASSWORD).');
    return false;
  }

  const transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth: { user, pass: password },
      })
    : nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass: password },
      });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || user,
    to: booking.patientEmail,
    subject: `Appointment confirmed — ${booking.bookingReference}`,
    text: [
      `Hello ${booking.patientName},`,
      '',
      'Your dental appointment is confirmed.',
      `Reference: ${booking.bookingReference}`,
      `Service: ${booking.service.name}`,
      `Date: ${booking.appointmentDate.toISOString().slice(0, 10)}`,
      `Time: ${booking.timeSlot} (Asia/Kolkata)`,
      '',
      'Please arrive 10 minutes early.',
    ].join('\n'),
  });

  return true;
};

module.exports = sendBookingConfirmation;
