import React from 'react';
import { motion } from 'framer-motion';

const FALLBACK_TIMELINE = [
  {
    year: 2012,
    chapter: '01',
    title: 'BDS — Government Dental College',
    description: 'Graduated with honors in dental surgery, laying the foundation for a career driven by precision, empathy, and technical discipline.',
  },
  {
    year: 2015,
    chapter: '02',
    title: 'MDS — AIIMS New Delhi',
    description: 'Advanced training in conservative dentistry and endodontics sharpened a deeper focus on preserving natural function and beauty.',
  },
  {
    year: 2018,
    chapter: '03',
    title: 'Senior Consultant',
    description: 'Led a multi-specialty dental department, mentoring teams and delivering complex care with a patient-first, multidisciplinary approach.',
  },
  {
    year: 2022,
    chapter: '04',
    title: 'Private Practice',
    description: 'Established an independent practice centered on thoughtful diagnosis, elevated aesthetics, and honest, long-term patient relationships.',
  },
];

export default function TimelineSection({ items = FALLBACK_TIMELINE }) {
  return (
    <section id="experience" className="relative isolate overflow-hidden py-24">
      <div className="absolute inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_top_left,rgba(211,54,22,0.14),transparent_18%),radial-gradient(circle_at_70%_80%,rgba(207,137,118,0.14),transparent_30%),linear-gradient(180deg,#fffaf8_0%,#f9f3f0_35%,#f7f1ee_100%)]" />
      <div className="absolute inset-0 pointer-events-none z-[1] backdrop-blur-[2px]" />

      <motion.div
        className="pointer-events-none absolute inset-0 z-[2]"
        initial={{ opacity: 0.35 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute left-[8%] top-[10%] h-72 w-72 rounded-full bg-[#D33616]/12 blur-[120px]"
          animate={{ x: [0, 30, -20, 0], y: [0, -18, 12, 0], scale: [1, 1.12, 0.96, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[8%] top-[22%] h-80 w-80 rounded-full bg-[#CF8976]/12 blur-[130px]"
          animate={{ x: [0, -26, 18, 0], y: [0, 28, -16, 0], scale: [1.06, 0.92, 1.16, 1.06] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[6%] left-[38%] h-64 w-64 rounded-full bg-[#f3b7a7]/10 blur-[110px]"
          animate={{ x: [0, 20, -18, 0], y: [0, -12, 18, 0], scale: [1, 1.1, 0.94, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-[38%] border border-white/40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.75),rgba(255,255,255,0.12)_20%,rgba(211,54,22,0.08)_48%,rgba(255,255,255,0.02)_100%)] shadow-[0_0_80px_rgba(211,54,22,0.1)] backdrop-blur-[6px]"
          animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.06, 0.98, 1], x: [-10, 18, -12, -10], y: [0, -18, 12, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'perspective(1200px) rotateX(60deg) rotateY(-14deg)' }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-[45%] border border-[#CF8976]/40 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.62),rgba(207,137,118,0.18)_30%,rgba(255,255,255,0.04)_72%)] shadow-[0_0_70px_rgba(207,137,118,0.12)]"
          animate={{ rotate: [10, -16, 12, 10], scale: [1.04, 0.96, 1.08, 1.04], x: [8, -12, 10, 8], y: [-12, 10, -16, -12] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'perspective(1200px) rotateX(62deg) rotateY(18deg)' }}
        />
      </motion.div>

      <div className="absolute left-1/2 top-6 h-[84%] w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(211,54,22,0.05),rgba(211,54,22,0.9),rgba(211,54,22,0.05))]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mb-16 text-center"
        >
          <div className="section-kicker mx-auto">Experience & Education</div>
          <h2 className="section-heading mt-6 text-4xl md:text-5xl">A journey defined by craft, care, and clinical precision.</h2>
          <p className="section-copy mx-auto mt-4 text-base md:text-lg">
            Every year added a layer of skill, patience, and purpose — shaping a practice built around confidence, comfort, and long-term oral wellness.
          </p>
        </motion.div>

        <div className="relative">
          {items.map((item, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isLeft ? -44 : 44, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: 'easeOut' }}
                className={`relative mb-8 md:mb-12 ${isLeft ? 'md:pr-12' : 'md:ml-auto md:pl-12'} md:w-1/2 pl-12 md:pl-0`}
              >
                <div
                  className={`absolute top-10 left-0 h-4 w-4 rounded-full border-4 border-[#fffaf8] bg-[#D33616] shadow-[0_0_24px_rgba(211,54,22,0.42)] ${
                    isLeft ? 'md:left-auto md:-right-2' : 'md:-left-2'
                  }`}
                />

                <motion.article
                  whileHover={{ y: -8, x: isLeft ? -2 : 2, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="glass premium-story-card overflow-hidden rounded-[1.8rem] p-6 md:p-7 shadow-[0_20px_48px_rgba(105,10,1,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="story-badge">Chapter {item.chapter}</span>
                    <span className="story-year">{item.year}</span>
                  </div>

                  <h3 className="text-xl font-bold leading-tight text-[#690A01] md:text-2xl">{item.title}</h3>
                  <p className="mt-3 text-[0.98rem] leading-7 text-[#6E6D7A]">{item.description}</p>
                </motion.article>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
