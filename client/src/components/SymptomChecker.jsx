import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, ArrowRight, RotateCcw } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'concern',
    text: 'What is your main concern today?',
    options: [
      { label: 'Tooth pain or sensitivity', score: { 'Root Canal Therapy': 2, 'Dental Consultation': 1 } },
      { label: 'Missing tooth / gap', score: { 'Dental Implants': 2, 'Dental Consultation': 1 } },
      { label: 'Want a brighter / straighter smile', score: { 'Teeth Whitening': 2, 'Invisible Aligners': 1 } },
      { label: 'Crooked or uneven teeth', score: { 'Invisible Aligners': 2, 'Porcelain Veneers': 1 } },
      { label: 'Bleeding or receding gums', score: { 'Laser Gingivoplasty': 2, 'Teeth Cleaning & Polishing': 1 } },
    ],
  },
  {
    id: 'duration',
    text: 'How long have you noticed this?',
    options: [
      { label: 'Just started (days)', score: { 'Dental Consultation': 1 } },
      { label: 'A few weeks', score: { 'Dental Consultation': 1 } },
      { label: 'Several months or more', score: { 'Dental Consultation': 2 } },
    ],
  },
  {
    id: 'severity',
    text: 'How much does it affect your daily life?',
    options: [
      { label: 'Barely noticeable', score: { 'Teeth Cleaning & Polishing': 1 } },
      { label: 'Occasional discomfort', score: { 'Dental Consultation': 1 } },
      { label: 'Significant pain / affects eating or confidence', score: { 'Root Canal Therapy': 1, 'Dental Consultation': 1 } },
    ],
  },
];

export default function SymptomChecker({ onResult }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({});
  const [done, setDone] = useState(false);

  const answer = (option) => {
    const next = { ...scores };
    Object.entries(option.score).forEach(([svc, pts]) => {
      next[svc] = (next[svc] || 0) + pts;
    });
    setScores(next);
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setDone(true);
      const top = Object.entries(next).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Dental Consultation';
      onResult?.(top);
    }
  };

  const restart = () => { setStep(0); setScores({}); setDone(false); };
  const recommendation = done ? Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] : null;

  return (
    <section id="symptom-checker" className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(211,54,22,0.12),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(207,137,118,0.14),transparent_26%)]" />
      <div className="absolute left-[10%] top-16 h-52 w-52 rounded-full bg-[#D33616]/10 blur-[100px]" />
      <div className="absolute right-[12%] bottom-12 h-56 w-56 rounded-full bg-[#CF8976]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-10 text-center"
        >
          <div className="section-kicker mb-4">
            <Stethoscope size={15} /> Smart Triage
          </div>
          <h2 className="section-heading mb-4 text-[#690A01]">Not Sure What You Need?</h2>
          <p className="mx-auto max-w-2xl text-base text-[#6E6D7A]">
            Answer 3 quick questions and we'll point you to the right treatment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="glass relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-4 shadow-[0_30px_70px_rgba(105,10,1,0.08)] backdrop-blur-2xl md:p-8"
        >
          <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-[#D33616]/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#CF8976]/10 blur-3xl" />

          <div className="relative">
            <AnimatePresence mode="wait">
              {!done ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6 flex gap-2">
                    {QUESTIONS.map((_, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-[#D33616] to-[#CF8976]' : 'bg-[#E8DAD5]'}`} />
                    ))}
                  </div>

                  <h3 className="mb-6 text-xl font-bold tracking-[-0.04em] text-[#690A01] md:text-2xl">
                    {step + 1}. {QUESTIONS[step].text}
                  </h3>

                  <div className="space-y-3">
                    {QUESTIONS[step].options.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => answer(opt)}
                        className="group flex w-full items-center justify-between gap-4 rounded-[1.35rem] border border-[#F0E3DF] bg-white/80 p-4 text-left text-[#403E45] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D33616]/40 hover:bg-[linear-gradient(135deg,rgba(255,249,247,1),rgba(255,239,233,0.9))] hover:shadow-[0_16px_30px_rgba(105,10,1,0.06)]"
                      >
                        <span className="text-[15px] font-medium leading-6 text-[#1C1B1F]">{opt.label}</span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEAE5] text-[#D33616] transition-all group-hover:translate-x-1 group-hover:bg-[#D33616] group-hover:text-white">
                          <ArrowRight size={16} />
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#B5210A] text-5xl shadow-[0_18px_35px_rgba(211,54,22,0.25)]">🦷</div>
                  <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-[#D33616]">Recommended starting point</p>
                  <h3 className="mb-5 text-3xl font-black tracking-[-0.06em] text-[#690A01]">{recommendation}</h3>
                  <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-[#6E6D7A]">
                    This is a preliminary guide, not a diagnosis. A clinical consultation will confirm the right treatment plan for you.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('booking:prefill', { detail: { service: recommendation } }));
                        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="btn-primary"
                    >
                      Book {recommendation}
                    </button>
                    <button onClick={restart} className="btn-ghost inline-flex items-center gap-2">
                      <RotateCcw size={15} /> Start Over
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
