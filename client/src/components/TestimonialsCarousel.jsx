import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api.js';

const Stars = ({ rating }) => (
  <span className="text-[#C98A3A]" aria-label={`${rating} out of 5 stars`}>
    {'★'.repeat(rating)}
    {'☆'.repeat(5 - rating)}
  </span>
);

export default function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reviews/testimonials/all');
        setTestimonials(data.data || []);
      } catch {
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  if (loading || testimonials.length === 0) return null;
  const current = testimonials[index];

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
            <h3 className="mt-4 mb-3 text-xl font-semibold text-[#690A01]">{current.title}</h3>
            <blockquote className="text-lg leading-relaxed text-[#403E45]">“{current.description}”</blockquote>
            <figcaption className="mt-6 font-medium text-[#D33616]">— {current.patientName}</figcaption>
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
