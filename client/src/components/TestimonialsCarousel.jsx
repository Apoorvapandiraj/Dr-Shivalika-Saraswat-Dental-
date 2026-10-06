import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Stars = ({ rating }) => {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className="text-[#C98A3A]" aria-label={`${safe} out of 5 stars`}>
      {'★'.repeat(safe)}
      {'☆'.repeat(5 - safe)}
    </span>
  );
};

export default function TestimonialsCarousel({ testimonials = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  useEffect(() => {
    // Keep the cursor valid when the list shrinks (e.g. refetch returns fewer)
    setIndex((i) => (testimonials.length ? Math.min(i, testimonials.length - 1) : 0));
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;
  const current = testimonials[Math.min(index, testimonials.length - 1)] || {};

  return (
    <section className="py-20 bg-gradient-to-b from-[#F7F1ED] to-[#F1E8E3]">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-12 text-4xl font-bold text-[#690A01]">Patient Stories</h2>
        <AnimatePresence mode="wait">
          <motion.figure
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#E8DAD5] bg-white/70 p-10 shadow-[0_16px_40px_rgba(105,10,1,0.06)] backdrop-blur-xl"
          >
            <Stars rating={current.rating} />
            <h3 className="mt-4 mb-3 text-xl font-semibold text-[#690A01]">{current.title || 'Patient Story'}</h3>
            <blockquote className="text-lg leading-relaxed text-[#403E45]">“{current.description || current.comment || ''}”</blockquote>
            <figcaption className="mt-6 font-medium text-[#D33616]">— {current.patientName || 'Verified Patient'}</figcaption>
          </motion.figure>
        </AnimatePresence>

        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${i === index ? 'bg-[#D33616]' : 'bg-[#E8DAD5]'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
