import React, { useEffect, useState } from 'react';
import ToothHero3D from '../components/ToothHero3D.jsx';
import TimelineSection from '../components/TimelineSection.jsx';
import TestimonialsCarousel from '../components/TestimonialsCarousel.jsx';
import BookingWidget from '../components/BookingWidget.jsx';
import ReelsSection from '../components/ReelsSection.jsx';
import TreatmentPlans from '../components/TreatmentPlans.jsx';
import BeforeAfterSlider from '../components/BeforeAfterSlider.jsx';
import SymptomChecker from '../components/SymptomChecker.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import api from '../services/api.js';

const SPECIALIZATIONS = [
  ['🦷', 'Advanced Implantology'],
  ['✨', 'Cosmetic Dentistry & Smile Designing'],
  ['🔬', 'Restorative Endodontics'],
  ['🧸', 'Gentle Pediatric Care'],
  ['⚡', 'Laser Gingivoplasty'],
];

const DEMO_CASES = [
  {
    _id: 'demo-1',
    category: 'Full Mouth Rehabilitation',
    title: 'Complete Smile Restoration',
    treatmentDuration: '4 months',
    description: 'Full-arch rehabilitation with zirconia crowns and implants, restoring both function and aesthetics.',
    beforeImage: { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80' },
    afterImage: { url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    _id: 'demo-2',
    category: 'Teeth Whitening',
    title: 'Professional Laser Whitening',
    treatmentDuration: 'Single visit',
    description: 'In-office laser whitening — several shades brighter in under an hour, with zero enamel damage.',
    beforeImage: { url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80' },
    afterImage: { url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    _id: 'demo-3',
    category: 'Smile Design',
    title: 'Smile Makeover',
    treatmentDuration: '6 weeks',
    description: 'Digital smile design and minimally invasive veneers for a balanced, brighter, camera-ready smile.',
    beforeImage: { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80' },
    afterImage: { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    _id: 'demo-4',
    category: 'Clear Aligners',
    title: 'Spacing & Alignment Refinement',
    treatmentDuration: '10 months',
    description: 'Precise aligner sequence to improve bite alignment, symmetry and confident smiling without brackets.',
    beforeImage: { url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80' },
    afterImage: { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    _id: 'demo-5',
    category: 'Implant Dentistry',
    title: 'Single-Tooth Implant Renewal',
    treatmentDuration: '8 weeks',
    description: 'Aesthetic implant placement and crown reconstruction that blends naturally with the surrounding smile.',
    beforeImage: { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80' },
    afterImage: { url: 'https://images.unsplash.com/photo-1598256989800-fe5cb7c5c93f?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    _id: 'demo-6',
    category: 'Cosmetic Bonding',
    title: 'Fracture & Chipped Tooth Repair',
    treatmentDuration: '2 visits',
    description: 'Comfort-first bonding and contouring to restore proportion, balance and a natural-looking finish.',
    beforeImage: { url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=1200&q=80' },
    afterImage: { url: 'https://images.unsplash.com/photo-1521590832167-7e9d7a1e6142?auto=format&fit=crop&w=1200&q=80' },
  },
];

export default function HomePage() {
  const [profile, setProfile] = useState(null);
  const [cases, setCases] = useState(DEMO_CASES);

  useEffect(() => {
    api.get('/profile').then(({ data }) => setProfile(data.data)).catch(() => {});
    // Real Case Vault from the API; fall back to demo showcase if empty/unavailable
    api.get('/profile/case-vault')
      .then(({ data }) => {
        if (data.data?.length) setCases(data.data);
      })
      .catch(() => {});
  }, []);

  const stats = profile
    ? [
        { label: 'Years Experience', value: `${profile.experience}+` },
        { label: 'Happy Patients', value: '5,000+' },
        { label: 'Google Rating', value: `★ ${profile.avgGoogleRating || 4.9}` },
      ]
    : [];

  return (
    <div>
      <ToothHero3D />

      <ScrollReveal className="luxury-section py-24">
        <section id="about" className="max-w-5xl mx-auto px-6 text-center">
          <div className="section-kicker">About the Doctor</div>
          <h2 className="section-heading mb-4">Dr. Shivalika Saraswat</h2>
          <p className="text-[#6E6D7A] text-sm mb-4">BDS — Bangalore Institute of Dental Sciences · KSDC Reg. 39683-A</p>
          <p className="text-[#403E45] max-w-2xl mx-auto mb-12 text-lg leading-8">
            {profile?.bio || 'Senior Dental Surgeon & Implantologist committed to precision, aesthetics and gentle patient-first care.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {stats.map((s) => (
              <div key={s.label} className="glass glass-hover p-8">
                <div className="text-4xl font-bold neon-text">{s.value}</div>
                <div className="text-[#6E6D7A] mt-2 text-sm uppercase tracking-[0.2em]">{s.label}</div>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-semibold text-[#690A01] mb-6">Areas of Excellence</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {SPECIALIZATIONS.map(([icon, label]) => (
              <div key={label} className="glass glass-hover px-5 py-3 flex items-center gap-2.5 text-[#403E45] text-sm font-medium">
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <div id="technology" />
      <TreatmentPlans profile={profile} />
      <TimelineSection />
      <BeforeAfterSlider cases={cases} />
      <TestimonialsCarousel />
      <SymptomChecker />
      <BookingWidget />
      <ReelsSection profile={profile} />

      <footer className="border-t border-[#E8D7D1] bg-[#FBF9F8] py-10 text-center text-[#6E6D7A] text-sm">
        <p>© {new Date().getFullYear()} Dr. Shivalika Saraswat. All rights reserved.</p>
        <p className="mt-2">For appointments: +91 98765 43210 · dr.shivalika@example.com</p>
      </footer>
    </div>
  );
}
