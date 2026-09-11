import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ShieldCheck } from 'lucide-react';

/**
 * Treatment Plans showcase — visual cards with imagery, "from" pricing,
 * and an Enquire button that routes the patient into the booking flow
 * with the treatment pre-selected (via the `booking:prefill` event).
 */

// Curated clinical imagery per known treatment (Unsplash CDN, free to hotlink)
const SERVICE_IMAGES = {
  'Root Canal Treatment': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80',
  'Root Canal Therapy': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80',
  'Dental Implants': 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80',
  'Porcelain Veneers': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80',
  'Teeth Whitening': 'https://images.unsplash.com/photo-1601289686796-9d145b5e4b8d?w=900&q=80',
  'Invisible Aligners': 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=900&q=80',
  'Teeth Cleaning & Polishing': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80',
  'Dental Consultation': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80',
  'Laser Gingivoplasty': 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80',
};
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900&q=80';
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://dr-shivalika-saraswat-dental-1.onrender.com/api').replace(/\/api\/?$/, '');
const mediaUrl = (url) => (url?.startsWith('http') ? url : url ? `${API_ORIGIN}${url}` : '');

// Short benefit line shown on each card
const SERVICE_BLURBS = {
  'Root Canal Treatment': 'Painless single-visit endodontics that saves your natural tooth.',
  'Root Canal Therapy': 'Painless single-visit endodontics that saves your natural tooth.',
  'Dental Implants': 'Permanent titanium roots with natural-looking zirconia crowns.',
  'Porcelain Veneers': 'Hand-crafted porcelain shells for a flawless smile design.',
  'Teeth Whitening': 'Laser-activated whitening — several shades brighter in one visit.',
  'Invisible Aligners': 'Clear, removable aligners that gently straighten your smile.',
  'Teeth Cleaning & Polishing': 'Ultrasonic scaling and polish for healthy gums and fresh breath.',
  'Dental Consultation': 'Complete digital assessment with a personalised treatment plan.',
  'Laser Gingivoplasty': 'Precise, near-bloodless gum contouring with laser technology.',
};

export default function TreatmentPlans({ profile }) {
  const services = profile?.services || [];

  const enquire = (serviceName) => {
    window.dispatchEvent(new CustomEvent('booking:prefill', { detail: { service: serviceName } }));
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const storySteps = [
    { title: 'Consultation', detail: 'Clinical assessment & diagnosis' },
    { title: 'Personal plan', detail: 'Transparent treatment roadmap' },
    { title: 'Confident smile', detail: 'A brighter, healthier finish' },
  ];

  return (
    <section id="treatment-plans" className="relative isolate overflow-hidden py-24">
      <div className="absolute inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_top_left,rgba(211,54,22,0.12),transparent_20%),radial-gradient(circle_at_top_right,rgba(207,137,118,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(247,196,182,0.16),transparent_30%),linear-gradient(180deg,#fffaf8_0%,#f8f2ef_40%,#f9f4f1_100%)]" />

      <motion.div
        className="pointer-events-none absolute inset-0 z-[2]"
        initial={{ opacity: 0.4 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute left-[6%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-[#D33616]/12 blur-[120px]"
          animate={{ x: [0, 20, -18, 0], y: [0, -14, 18, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[8%] top-[14%] h-[22rem] w-[22rem] rounded-full bg-[#CF8976]/14 blur-[110px]"
          animate={{ x: [0, -20, 18, 0], y: [0, 18, -20, 0], scale: [1.03, 0.94, 1.12, 1.03] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[6%] left-[22%] h-[18rem] w-[18rem] rounded-full bg-[#F6CFCB]/22 blur-[120px]"
          animate={{ x: [0, 16, -12, 0], y: [0, -16, 14, 0], scale: [1, 1.06, 0.97, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-[38%] border border-white/40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7),rgba(255,255,255,0.12)_22%,rgba(211,54,22,0.10)_52%,rgba(255,255,255,0.02)_100%)] shadow-[0_0_80px_rgba(211,54,22,0.1)] backdrop-blur-[6px]"
          animate={{ rotate: [0, 12, -10, 0], x: [-8, 12, -10, -8], y: [0, -12, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'perspective(1200px) rotateX(62deg) rotateY(-12deg)' }}
        />
      </motion.div>

      <div className="treatment-3d-scene pointer-events-none absolute inset-0 z-[3]" aria-hidden="true">
        <motion.div
          className="treatment-3d-orb"
          animate={{ y: [0, -22, 0], rotate: [0, 8, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="treatment-orb-core" />
          <div className="treatment-orb-ring treatment-orb-ring-one" />
          <div className="treatment-orb-ring treatment-orb-ring-two" />
          <div className="treatment-orb-ring treatment-orb-ring-three" />
        </motion.div>
        <motion.div
          className="treatment-3d-prism"
          animate={{ rotateX: [0, 360], rotateY: [0, 180], y: [0, 16, 0] }}
          transition={{ rotateX: { duration: 24, repeat: Infinity, ease: 'linear' }, rotateY: { duration: 18, repeat: Infinity, ease: 'linear' }, y: { duration: 9, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </motion.div>
        <div className="treatment-3d-grid" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <div className="section-kicker mx-auto inline-flex items-center gap-2">
            <ShieldCheck size={15} /> Treatment Plans
          </div>
          <h2 className="section-heading mt-6 text-4xl md:text-5xl">Choose Your Path to a Perfect Smile</h2>
          <p className="section-copy mx-auto mt-3 max-w-2xl text-base md:text-lg">
            Transparent, fixed-quote treatment plans — every journey starts with a clinical consultation and ends with a more confident smile.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mb-10 grid gap-4 md:grid-cols-3"
        >
          {storySteps.map((step, index) => (
            <div key={step.title} className="glass glass-hover rounded-[1.4rem] p-4 text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D33616]/10 text-sm font-bold text-[#D33616]">
                  0{index + 1}
                </span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#D33616]">Step</div>
                  <div className="text-base font-semibold text-[#690A01]">{step.title}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-[#6E6D7A]">{step.detail}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc, i) => {
            const img = mediaUrl(svc.image?.url) || SERVICE_IMAGES[svc.name] || FALLBACK_IMAGE;
            return (
              <motion.article
                key={svc.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                whileHover={{ y: -10, scale: 1.012, rotateX: 1.5, rotateY: i % 2 ? -1.5 : 1.5 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: (i % 3) * 0.08 }}
                className="premium-treatment-card glass glass-hover relative flex flex-col overflow-hidden rounded-[1.6rem] group"
              >
                <div className="premium-image-frame relative h-52 overflow-hidden">
                  <img
                    src={img}
                    alt={svc.name}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.12] group-hover:saturate-[1.18]"
                  />
                  <div className="pointer-events-none absolute inset-3 rounded-[1rem] border border-white/35" />
                  <div className="premium-scanline pointer-events-none absolute inset-x-5 top-1/2 h-px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B1F]/80 via-[#1C1B1F]/25 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-semibold text-white leading-snug">{svc.name}</h3>
                  </div>
                  <div className="absolute right-3 top-3 rounded-full border border-[#F2C988]/35 bg-[#32100C]/75 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#F7D69A] backdrop-blur-sm">
                    from ₹{svc.price.toLocaleString('en-IN')}
                  </div>
                  <div className="absolute left-3 top-3 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                    0{i + 1}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="flex-1 text-sm leading-relaxed text-[#5E5B64]">
                    {svc.description || SERVICE_BLURBS[svc.name] || 'Personalised care with the latest dental technology.'}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F1D9D0] pt-4 text-xs text-[#6E6D7A]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={13} className="text-[#D33616]" />
                      {svc.duration ? `${svc.duration} min` : '30 min'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-[#C98A3A]" /> Fixed quote
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => enquire(svc.name)}
                    className="btn-primary mt-5 w-full"
                  >
                    Enquire <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.article>
            );
          })}
        </div>

        {!services.length && (
          <p className="text-center text-slate-500">Loading treatment plans…</p>
        )}
      </div>
    </section>
  );
}
