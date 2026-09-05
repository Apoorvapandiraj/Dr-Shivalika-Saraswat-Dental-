/**
 * Smoke tests — run against an in-memory MongoDB.
 * Usage: cd server && npm test
 */
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongos;
let app;

beforeAll(async () => {
  mongos = await MongoMemoryServer.create();
  await mongoose.connect(mongos.getUri());
  app = require('../server').app;
  // Ensure unique indexes (e.g. double-booking guard) are fully built before tests run
  await mongoose.syncIndexes();
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongos.stop();
});

describe('Health & Public API', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mongodb).toBe('connected');
  });

  test('GET /api/profile returns 404 before seeding', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(404);
  });

  test('Unknown route returns 404 JSON', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Auth flow', () => {
  let adminToken;

  test('register + login as admin works', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'Password@123',
      role: 'patient',
    });

    await mongoose.model('User').updateOne({ email: 'admin@test.com' }, { role: 'admin' });
    // Mirror config/seed.js: every admin gets an AdminAccess record
    const adminUser = await mongoose.model('User').findOne({ email: 'admin@test.com' });
    await mongoose.model('AdminAccess').create({
      userId: adminUser._id,
      role: 'super_admin',
      permissions: ['manage_profile', 'manage_bookings', 'moderate_reviews', 'manage_users', 'view_analytics', 'manage_admin_access', 'manage_payments'],
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'Password@123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    adminToken = res.body.data.accessToken;
  });

  test('admin can access analytics with token', async () => {
    const res = await request(app)
      .get('/api/profile/analytics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalBookings');
  });

  test('analytics blocked without token', async () => {
    const res = await request(app).get('/api/profile/analytics');
    expect(res.status).toBe(401);
  });
});

describe('Booking flow', () => {
  let doctorId;

  beforeAll(async () => {
    const doctor = await mongoose.model('DoctorProfile').create({
      firstName: 'Shivalika',
      lastName: 'Saraswat',
      email: 'dr@test.com',
      phone: '9876543210',
      specialization: 'Dentistry',
      experience: 10,
      bookingAdvanceNotice: 1,
      services: [{ name: 'Consultation', price: 500, duration: 30 }],
      workingHours: { start: '09:00', end: '18:00' },
    });
    doctorId = doctor._id.toString();
  });

  test('availability returns slots', async () => {
    const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const res = await request(app).get(`/api/bookings/availability?date=${date}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slots.length).toBeGreaterThan(0);
  });

  test('booking fails with missing required fields', async () => {
    const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const res = await request(app).post('/api/bookings').send({
      doctorId,
      patientName: 'Test Patient',
      patientEmail: 'patient@test.com',
      patientPhone: '9876543211',
      service: 'Consultation',
      appointmentDate: date,
      // timeSlot omitted → should be rejected
    });
    expect(res.status).toBe(400);
  });

  test('full booking flow succeeds instantly and blocks double-booking', async () => {
    const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const payload = {
      doctorId,
      patientName: 'Second Patient',
      patientEmail: 'patient2@test.com',
      patientPhone: '9876543212',
      service: 'Consultation',
      appointmentDate: date,
      timeSlot: '11:00',
    };

    const res = await request(app).post('/api/bookings').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.data.bookingReference).toMatch(/^BK-/);

    // Same slot again → duplicate key error surfaces as 400/500
    const res2 = await request(app)
      .post('/api/bookings')
      .send({ ...payload, patientEmail: 'patient3@test.com', patientPhone: '9876543213' });
    expect([400, 500]).toContain(res2.status);
  });
});

describe('Review moderation flow', () => {
  let adminToken;
  let reviewId;

  beforeAll(async () => {
    const login = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'Password@123' });
    adminToken = login.body.data.accessToken;
    const doctor = await mongoose.model('DoctorProfile').findOne({});
    const res = await request(app).post('/api/reviews').send({
      doctorId: doctor._id.toString(),
      patientName: 'Reviewer',
      patientEmail: 'reviewer@test.com',
      rating: 5,
      comment: 'Excellent care!',
    });
    reviewId = res.body.data._id;
  });

  test('review starts pending and is hidden from public', async () => {
    const doctor = await mongoose.model('DoctorProfile').findOne({});
    const res = await request(app).get(`/api/reviews/doctor/${doctor._id}`);
    expect(res.body.data.length).toBe(0);
  });

  test('admin approves review, then it becomes public', async () => {
    const approve = await request(app)
      .put(`/api/reviews/${reviewId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approve.status).toBe(200);

    const doctor = await mongoose.model('DoctorProfile').findOne({});
    const res = await request(app).get(`/api/reviews/doctor/${doctor._id}`);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].comment).toBe('Excellent care!');
  });

  test('approved testimonials are included in the doctor aggregate rating', async () => {
    const doctor = await mongoose.model('DoctorProfile').findOne({});

    const testimonialRes = await request(app)
      .post('/api/reviews/testimonials')
      .field('doctorId', doctor._id.toString())
      .field('patientName', 'Video Patient')
      .field('patientEmail', 'videopatient@test.com')
      .field('rating', '4')
      .field('title', 'Smile refreshed')
      .field('description', 'Amazing transformation!')
      .field('treatment', 'Teeth whitening');

    expect(testimonialRes.status).toBe(201);

    const testimonialId = testimonialRes.body.data._id;
    const approval = await request(app)
      .put(`/api/reviews/testimonials/${testimonialId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(approval.status).toBe(200);

    const updatedDoctor = await mongoose.model('DoctorProfile').findById(doctor._id);
    expect(updatedDoctor.totalReviews).toBe(2);
    expect(updatedDoctor.rating).toBe(4.5);
  });
});
