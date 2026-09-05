import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api.js';

const Stars = ({ value }) => (
  <span className="text-[#C98A3A]">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
);

export default function ReviewsSection({ profile }) {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientName: '', patientEmail: '', rating: 5, comment: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile?._id) return;
    api.get(`/reviews/doctor/${profile._id}`).then(({ data }) => setReviews(data.data || [])).catch(() => {});
  }, [profile]);

  const visible = filter ? reviews.filter((r) => r.rating === filter) : reviews;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await api.post('/reviews', { doctorId: profile._id, ...form });
      setMessage('Thank you! Your review will appear after approval.');
      setShowForm(false);
      setForm({ patientName: '', patientEmail: '', rating: 5, comment: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-[#E8DAD5] bg-white/80 px-4 py-2 text-[#1C1B1F] placeholder:text-[#817C83] focus:border-[#D33616] focus:outline-none';

  return (
    <section id="reviews" className="py-20 bg-[#F7F1ED]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold text-[#690A01]">Patient Reviews</h2>
            {profile && (
              <p className="mt-2 text-[#D33616]">
                ★ {profile.rating || 0} · {profile.totalReviews || 0} verified reviews
              </p>
            )}
          </div>
          <button onClick={() => setShowForm((s) => !s)} className="rounded-lg bg-[#D33616] px-6 py-2 font-semibold text-white transition hover:bg-[#b52d12]">
            {showForm ? 'Close' : 'Write a Review'}
          </button>
        </div>

        {message && <div className="mb-6 rounded-lg border border-[#E8DAD5] bg-[#FCEBE6] p-3 text-center text-[#690A01]">{message}</div>}

        {showForm && (
          <form onSubmit={submit} className="mb-10 space-y-4 rounded-xl border border-[#E8DAD5] bg-white/75 p-6 shadow-[0_16px_40px_rgba(105,10,1,0.04)]">
            <div className="grid gap-4 md:grid-cols-2">
              <input required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className={inputCls} placeholder="Your name" />
              <input required type="email" value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} className={inputCls} placeholder="Your email (not published)" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#403E45]">Rating:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className={`text-2xl ${n <= form.rating ? 'text-[#C98A3A]' : 'text-[#CFC5BE]'}`}>★</button>
              ))}
            </div>
            <textarea required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className={inputCls} rows="4" placeholder="Share your experience…" />
            <button disabled={busy} className="rounded-lg bg-[#D33616] px-6 py-2 font-semibold text-white hover:bg-[#b52d12] disabled:bg-[#D8B4A8]">
              {busy ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {[0, 5, 4, 3].map((n) => (
            <button
              key={n}
              onClick={() => setFilter(n)}
              className={`rounded-full px-4 py-1.5 text-sm ${filter === n ? 'bg-[#D33616] text-white' : 'border border-[#E8DAD5] bg-white/70 text-[#403E45] hover:bg-[#F7E8E2]'}`}
            >
              {n === 0 ? 'All' : `${n} ★`}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((r, i) => (
            <motion.div
              key={r._id || i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border border-[#E8DAD5] bg-white/75 p-6 shadow-[0_12px_25px_rgba(105,10,1,0.04)]"
            >
              <div className="mb-2 flex items-center justify-between">
                <Stars value={r.rating} />
                <span className="text-xs text-[#6E6D7A]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              <p className="text-[#403E45]">{r.comment}</p>
              <p className="mt-3 text-sm font-medium text-[#D33616]">— {r.patientName}</p>
            </motion.div>
          ))}
        </div>

        {!visible.length && <p className="text-center text-[#6E6D7A]">No reviews yet — be the first to share your experience!</p>}
      </div>
    </section>
  );
}
