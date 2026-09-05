import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';

const PORTRAIT = '/images/98697D3C-C3F5-40FB-8FD8-28B958043CF9.png';

export default function DoctorCard() {
  const cardRef = useRef(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(my, [0, 1], [18, -18]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-18, 18]), { stiffness: 220, damping: 22 });
  const scale = useSpring(useTransform(mx, [0, 1], [1.01, 1.09]), { stiffness: 180, damping: 18 });
  const liftY = useSpring(useTransform(my, [0, 1], [0, -10]), { stiffness: 150, damping: 18 });
  const floatY = useSpring(useTransform(my, [0, 1], [0, -6]), { stiffness: 120, damping: 16 });

  const glareX = useTransform(mx, [0, 1], ['12%', '88%']);
  const glareY = useTransform(my, [0, 1], ['8%', '92%']);
  const glowBg = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgba(211,54,22,0.1), rgba(230,159,130,0.05) 32%, transparent 70%)`;
  const shineX = useTransform(mx, [0, 1], ['-18%', '118%']);
  const shineY = useTransform(my, [0, 1], ['-12%', '112%']);
  const shineBg = useMotionTemplate`linear-gradient(120deg, transparent 22%, rgba(255,255,255,0.22) 45%, transparent 60%)`;
  const auraX = useTransform(mx, [0, 1], ['20%', '80%']);
  const auraY = useTransform(my, [0, 1], ['18%', '82%']);
  const auraBg = useMotionTemplate`radial-gradient(300px circle at ${auraX} ${auraY}, rgba(255,255,255,0.22), rgba(211,54,22,0.04) 30%, transparent 62%)`;

  const onMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div style={{ perspective: 1500 }} className="relative">
      <motion.div
        className="absolute -inset-[2.8rem] rounded-[3.2rem] bg-[radial-gradient(circle_at_center,rgba(211,54,22,0.18),rgba(211,54,22,0.06)_32%,transparent_68%)] blur-[56px]"
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{
            rotateX,
            rotateY,
            scale,
            y: liftY,
            transformStyle: 'preserve-3d',
          }}
          className="relative overflow-hidden rounded-[2.6rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(245,226,214,0.42)_48%,rgba(255,255,255,0.58))] p-3 shadow-[0_36px_110px_rgba(85,18,8,0.24)] backdrop-blur-2xl"
        >
          <motion.div
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-[#C98A3A]/20"
            animate={{ rotate: [0, 360], scale: [0.94, 1.04, 0.94] }}
            transition={{ rotate: { duration: 24, repeat: Infinity, ease: 'linear' }, scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
          />
          <div className="absolute inset-[8px] rounded-[2rem] border border-white/80 bg-white/30 backdrop-blur-sm" />
          <div className="absolute inset-[20px] rounded-[1.7rem] border border-white/80 bg-white/22 backdrop-blur-sm" />
          <div className="absolute inset-[30px] rounded-[1.5rem] border border-[#F5E4DF]/80 bg-white/10" />

          <motion.div
            className="absolute inset-0 rounded-[2.4rem]"
            style={{ background: auraBg }}
            animate={{ opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <a href="#profile" className="group relative block overflow-hidden rounded-[1.8rem] border border-[#FFF8F2]/80 bg-[#32100C] p-1 shadow-[inset_0_0_0_1px_rgba(201,138,58,0.2),0_18px_45px_rgba(64,12,4,0.2)]">
            <div className="pointer-events-none absolute inset-2 z-40 rounded-[1.45rem] border border-[#F2C988]/45" />
            <div className="pointer-events-none absolute left-6 top-6 z-40 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.28em] text-[#FFF2DE]">
              <span className="h-px w-7 bg-[#EBC27B]" />
              Signature care
            </div>
            <div className="pointer-events-none absolute right-6 top-6 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/10 text-[#F7D69A] backdrop-blur-sm">
              <span className="text-sm">✦</span>
            </div>
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_32%)]" />
            <motion.div className="absolute inset-0 z-10" style={{ transformOrigin: 'center bottom' }}>
              {/* Animated depth vignette — warm, layered, breathing */}
              <motion.div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(125% 95% at 50% 104%, rgba(38,10,6,0.32) 0%, rgba(96,28,12,0.12) 42%, transparent 70%)' }}
                animate={{ opacity: [0.62, 1, 0.62] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Slow warm glow rising from the base */}
              <motion.div
                className="absolute inset-x-0 bottom-0"
                style={{ height: '58%', background: 'linear-gradient(180deg, transparent 0%, rgba(211,54,22,0.08) 58%, rgba(38,10,6,0.14) 100%)' }}
                animate={{ opacity: [0.45, 0.95, 0.45], scaleY: [0.96, 1.03, 0.96] }}
                transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
              {/* Soft edge light at the bottom rim */}
              <motion.div
                className="absolute inset-x-0 bottom-0 h-14"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(255,214,193,0.16) 70%, rgba(255,214,193,0.22))' }}
                animate={{ opacity: [0.35, 0.75, 0.35] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
            </motion.div>

            <motion.img
              src={PORTRAIT}
              alt="Dr. Shivalika Saraswat — BDS, Senior Dental Surgeon & Implantologist"
              className="relative z-0 h-[380px] w-full scale-[1.08] object-cover object-[center_22%] saturate-[1.02] contrast-[1.04] brightness-[1.02] transition-transform duration-1000 group-hover:scale-[1.13] md:h-[420px] md:object-[center_18%]"
              style={{ objectPosition: 'center 22%', y: floatY, filter: 'drop-shadow(0 12px 22px rgba(76,14,5,0.08))' }}
              loading="eager"
            />

            <motion.div className="pointer-events-none absolute inset-0 z-20" style={{ background: glowBg }} />
            <motion.div
              className="pointer-events-none absolute inset-0 z-30 opacity-80"
              style={{
                background: shineBg,
                transform: `translate(${shineX}px, ${shineY}px) rotate(12deg) scale(1.06)`,
                mixBlendMode: 'screen',
              }}
            />

            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 z-30 h-20 bg-gradient-to-b from-white/25 via-white/5 to-transparent"
              animate={{ opacity: [0.12, 0.26, 0.12] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              className="pointer-events-none absolute bottom-20 left-6 z-40 h-px w-16 bg-[#F2C988]"
              animate={{ scaleX: [0.55, 1, 0.55], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: 'left' }}
            />

            <div className="absolute left-6 top-14 z-40 flex items-center gap-1.5 rounded-full border border-white/25 bg-[#2E100C]/45 px-3 py-1.5 text-[10px] font-semibold text-[#FFF6E9] shadow-[0_8px_22px_rgba(0,0,0,0.12)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>
              Accepting Consultations
            </div>

            <div className="absolute bottom-5 left-6 right-6 z-40 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7D69A]">Dr. Shivalika Saraswat</p>
                <p className="mt-1 text-[11px] text-white/75">BDS · Implantology · Aesthetic Dentistry</p>
              </div>
              <p className="text-right text-[10px] font-semibold text-white/80">KSDC<br />39683-A</p>
            </div>
          </a>

          <div className="relative z-40 flex items-center justify-between px-2 pb-1 pt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C98A3A]">The signature edit</p>
              <p className="mt-1 text-sm font-semibold text-[#690A01]">Precision with a personal touch</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#C98A3A]">★ 4.9 / 5</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#6E6D7A]">5,000+ smiles</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}