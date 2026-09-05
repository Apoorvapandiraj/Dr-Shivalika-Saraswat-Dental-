import React, { lazy, Suspense, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, BadgeCheck, Star } from 'lucide-react';

const ToothScene = lazy(() => import('./three/ToothScene.jsx'));

export function MagneticButton({ children, className = '', onClick }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14 });
  const sy = useSpring(y, { stiffness: 180, damping: 14 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.3);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(211,54,22,0.12),transparent_28%),linear-gradient(180deg,#fffaf8_0%,#f7f1ee_100%)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-24 h-[480px] w-[480px] rounded-full bg-[#D33616]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[#CF8976]/12 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-6 pb-16 pt-24 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-[#D33616]">
            <Sparkles size={14} />
            12 Years · 5,000+ Smiles Restored
          </div>

          <h1 className="mb-4 text-5xl font-bold leading-tight md:text-6xl">
            Dr. Shivalika
            <br />
            <span className="neon-text">Saraswat</span>
          </h1>

          <p className="mb-2 text-lg text-[#6E6D7A]">BDS · Senior Dental Surgeon & Implantologist</p>
          <p className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6E6D7A]">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#D33616]" /> KSDC Reg. 39683-A</span>
            <span className="inline-flex items-center gap-1.5"><Star size={14} className="fill-[#C98A3A] text-[#C98A3A]" /> 4.9 Patient Rating</span>
          </p>

          <div className="flex flex-wrap gap-4">
            <MagneticButton className="btn-primary" onClick={() => scrollTo('booking')}>
              Book Appointment
            </MagneticButton>
            <MagneticButton className="btn-ghost" onClick={() => scrollTo('calculator')}>
              Estimate Treatment Cost
            </MagneticButton>
          </div>

          <div className="mt-12 flex gap-8">
            {[['5,000+', 'Smiles Restored'], ['4.9★', 'Patient Rating'], ['12', 'Years Experience']].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold text-[#690A01]">{v}</div>
                <div className="mt-0.5 text-xs uppercase tracking-[0.2em] text-[#6E6D7A]">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[520px] lg:h-[620px]"
        >
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-14 w-14 animate-spin rounded-full border-2 border-[#D33616]/30 border-t-[#D33616]" />
              </div>
            }
          >
            <ToothScene />
          </Suspense>
          <p className="absolute bottom-16 w-full text-center text-xs text-[#6E6D7A]">
            Click hotspots to explore procedures · toggle anatomical layers
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <div className="flex h-10 w-6 justify-center rounded-full border border-[#D33616]/40 pt-2">
          <div className="h-2 w-1 rounded-full bg-[#D33616]" />
        </div>
      </motion.div>
    </section>
  );
}
