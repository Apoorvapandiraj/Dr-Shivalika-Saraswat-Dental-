import React from 'react';
import { motion } from 'framer-motion';
import DoctorCard from './DoctorCard.jsx';

export default function ToothHero3D() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section id="top" className="relative isolate w-full min-h-screen overflow-hidden pt-2">
      <header className="premium-nav">
        <div className="premium-nav-inner">
          <a href="#top" className="logo-mark">
            <span className="dot" /> Dr. Shivalika Saraswat
          </a>

          <nav className="premium-nav-links" aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#treatment-plans">Treatments</a>
            <a href="#stories">Stories</a>
            <a href="#case-vault">Real Transformations</a>
          </nav>

          <button type="button" onClick={() => scrollTo('booking')} className="btn-primary">
            Book Consultation
          </button>
        </div>
      </header>

      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute left-[18%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-[#D33616]/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[22rem] w-[22rem] rounded-full bg-[#CF8976]/10 blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.08fr_0.92fr] gap-14 items-center py-20 md:py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          <div className="section-kicker mb-7">Next-Gen Dental Platform</div>

          <h1 className="text-5xl md:text-6xl lg:text-[4.2rem] font-extrabold leading-[0.95] tracking-[-0.07em] text-[#690A01]">
            Redefining Trust In <span className="neon-text block">Modern Dental Care</span>
          </h1>

          <p className="max-w-xl text-[1.08rem] leading-[1.8] text-[#6E6D7A] mt-6">
            Bridging advanced biomaterial technology with clinical excellence. Experience painless implant procedures, predictable results, and transparent journeys.
          </p>

          <div className="flex gap-4 mt-8 flex-wrap">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo('treatment-plans')} className="btn-primary">
              Explore Treatments
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo('booking')} className="btn-ghost">
              Book Consultation
            </motion.button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
            {[['12', 'Years'], ['5,000+', 'Smiles'], ['4.9★', 'Rating']].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-[#F0DDCF] bg-white/45 px-4 py-4 shadow-[0_10px_25px_rgba(105,10,1,0.04)]">
                <div className="text-2xl font-bold text-[#690A01]">{v}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6E6D7A]">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.25 }}
          className="relative mx-auto w-full max-w-[32rem]"
        >
          <div className="float-card top-[10%] right-[0%] w-[15.5rem] animate-[pulseGlow_4s_ease-in-out_infinite]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D33616]/10 text-xl text-[#D33616]">✦</div>
              <div>
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#6E6D7A]">Precision Rate</div>
                <div className="mt-1 text-lg font-bold text-[#690A01]">99.8% Accuracy</div>
              </div>
            </div>
          </div>

          <div className="float-card bottom-[18%] left-[3%] max-w-[15.5rem] border-[#F3E7E1]">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#6E6D7A]">Biocompatible Enamel</div>
            <div className="mt-2 text-sm leading-6 text-[#6E6D7A]">
              Ultra-realistic micro-ceramic crown rendering.
            </div>
          </div>

          <DoctorCard />
        </motion.div>
      </div>
    </section>
  );
}