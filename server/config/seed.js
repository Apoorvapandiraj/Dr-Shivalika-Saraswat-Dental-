/**
 * Seed script — creates the doctor profile and an admin user.
 * Usage: cd server && npm run seed
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDatabase = require('./db');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const AdminAccess = require('../models/AdminAccess');
const CaseStudy = require('../models/CaseStudy');

const seed = async () => {
  await connectDatabase();

  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@drshivalika.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({ name: 'Platform Admin', email: adminEmail, password: adminPassword, role: 'admin' });
    await AdminAccess.create({
      userId: admin._id,
      role: 'super_admin',
      permissions: [
        'manage_profile',
        'manage_bookings',
        'moderate_reviews',
        'manage_users',
        'view_analytics',
        'manage_admin_access',
        'manage_payments',
      ],
    });
    console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
  }

  // Doctor profile
  const existingProfile = await DoctorProfile.findOne({ deletedAt: null });
  if (!existingProfile) {
    await DoctorProfile.create({
      firstName: 'Shivalika',
      lastName: 'Saraswat',
      email: 'dr.shivalika@example.com',
      phone: '9876543210',
      specialization: 'Dentistry',
      experience: 12,
      bio: 'Senior Dental Surgeon & Implantologist — 8+ years of clinical excellence, 5,000+ happy smiles restored. Registered Dental Practitioner (KSDC Reg. 39683-A).',
      qualifications: [
        { degree: 'BDS', institute: 'Bangalore Institute of Dental Sciences', year: 2016 },
        { degree: 'Certified Implantologist', institute: 'Indian Society of Oral Implantologists', year: 2019 },
      ],
      services: [
        { name: 'Dental Consultation', description: 'Comprehensive oral examination and digital treatment plan', price: 500, duration: 30, image: { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80', publicId: 'seed-dental-consultation' } },
        { name: 'Teeth Cleaning & Polishing', description: 'Ultrasonic scaling and polishing', price: 1200, duration: 45, image: { url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80', publicId: 'seed-teeth-cleaning' } },
        { name: 'Root Canal Therapy', description: 'Single-sitting RCT with modern rotary endodontics', price: 4500, duration: 90, image: { url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80', publicId: 'seed-root-canal' } },
        { name: 'Dental Implants', description: 'Titanium implant with zirconia crown', price: 25000, duration: 120, image: { url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80', publicId: 'seed-dental-implants' } },
        { name: 'Porcelain Veneers', description: 'Hand-crafted porcelain smile design', price: 12000, duration: 90, image: { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80', publicId: 'seed-porcelain-veneers' } },
        { name: 'Teeth Whitening', description: 'In-office professional laser whitening', price: 6000, duration: 60, image: { url: 'https://images.unsplash.com/photo-1601289686796-9d145b5e4b8d?w=900&q=80', publicId: 'seed-teeth-whitening' } },
      ],
      pricingConfig: {
        perToothServices: ['Dental Implants', 'Porcelain Veneers', 'Teeth Whitening', 'Root Canal Therapy'],
        additionalToothFactor: 0.6,
        materials: [
          { name: 'Ceramic', multiplier: 0.85, description: 'Premium aesthetic ceramic' },
          { name: 'Zirconia', multiplier: 1, description: 'Gold standard — strength + aesthetics' },
          { name: 'Titanium', multiplier: 1.15, description: 'Implant-grade titanium' },
        ],
        sedation: [
          { name: 'None', price: 0 },
          { name: 'Local Anesthesia', price: 500 },
          { name: 'Conscious Sedation', price: 3500 },
        ],
      },
      workingHours: { start: '09:00', end: '20:00' },
      bookingEnabled: true,
      bookingAdvanceNotice: 24,
      bufferBetweenAppointments: 15,
    });
    console.log('✅ Doctor profile created');
  } else {
    console.log('ℹ️  Doctor profile already exists');
  }

  // Case Vault — before/after showcase (placeholder images via picsum)
  const caseCount = await CaseStudy.countDocuments({ deletedAt: null });
  if (caseCount === 0) {
    await CaseStudy.create([
      {
        title: 'Full Mouth Rehabilitation',
        category: 'Full Mouth Rehabilitation',
        description: 'Complete reconstruction with zirconia crowns and implants over a 4-month treatment plan.',
        beforeImage: { url: 'https://picsum.photos/seed/case-before-1/640/420' },
        afterImage: { url: 'https://picsum.photos/seed/case-after-1/640/420' },
        treatmentDuration: '4 months',
        displayOrder: 1,
      },
      {
        title: 'Laser Teeth Whitening',
        category: 'Teeth Whitening',
        description: 'Single-session in-office laser whitening — 6 shades brighter.',
        beforeImage: { url: 'https://picsum.photos/seed/case-before-2/640/420' },
        afterImage: { url: 'https://picsum.photos/seed/case-after-2/640/420' },
        treatmentDuration: '1 session',
        displayOrder: 2,
      },
      {
        title: 'Smile Design with Porcelain Veneers',
        category: 'Veneers',
        description: '8 hand-layered porcelain veneers for a natural, harmonious smile line.',
        beforeImage: { url: 'https://picsum.photos/seed/case-before-3/640/420' },
        afterImage: { url: 'https://picsum.photos/seed/case-after-3/640/420' },
        treatmentDuration: '3 weeks',
        displayOrder: 3,
      },
      {
        title: 'Invisible Aligner Therapy',
        category: 'Aligners',
        description: '18-month clear aligner treatment correcting crowding without braces.',
        beforeImage: { url: 'https://picsum.photos/seed/case-before-4/640/420' },
        afterImage: { url: 'https://picsum.photos/seed/case-after-4/640/420' },
        treatmentDuration: '18 months',
        displayOrder: 4,
      },
    ]);
    console.log('✅ Case Vault seeded (4 case studies)');
  }

  await mongoose.connection.close();
  console.log('✅ Seed complete');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
