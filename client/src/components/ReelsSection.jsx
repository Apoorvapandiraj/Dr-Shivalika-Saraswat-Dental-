import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Volume2, VolumeX, Video, Sparkles, X, Camera,
  Upload, RotateCcw, Send, PenLine, ChevronLeft, ChevronRight,
} from 'lucide-react';
import api from '../services/api.js';
import { ReelModal, ReviewModal } from './ReelsModals.jsx';

const MAX_REEL_SECONDS = 60;
const MAX_REEL_BYTES = 50 * 1024 * 1024; // matches server cap

// API origin for absolute video URLs (baseURL is http://localhost:5050/api)
const MEDIA_ORIGIN = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
const mediaUrl = (u) => (u?.startsWith('http') ? u : `${MEDIA_ORIGIN}${u}`);

const Stars = ({ value, className = '' }) => (
  <span className={`text-[#C98A3A] ${className}`}>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
);

/* ---------------- Video reel card (9:16, tap to play) ---------------- */
function ReelCard({ reel, index }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="relative w-44 md:w-56 aspect-[9/16] snap-start shrink-0 rounded-[1.75rem] overflow-hidden border border-white/60 bg-white/70 shadow-[0_20px_40px_rgba(105,10,1,0.06)] group cursor-pointer"
      onClick={toggle}
    >
      <video
        ref={videoRef}
        src={mediaUrl(reel.videoFile?.url)}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={() => setPlaying(false)}
      />

      <div className="absolute top-3 left-3">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#690A01]/75 backdrop-blur text-[10px] font-bold tracking-wider text-white uppercase">
          <span className={`w-1.5 h-1.5 rounded-full ${playing ? 'bg-[#F6CFCB] animate-pulse' : 'bg-[#F6CFCB]/60'}`} /> Reel
        </span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#690A01]/75 backdrop-blur flex items-center justify-center text-white/90 hover:text-[#F6CFCB]"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>

      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur border border-white/45 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={22} className="text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#3A0D09] via-[#3A0D09]/75 to-transparent">
        <Stars value={reel.rating} className="text-xs" />
        <p className="text-white font-bold text-sm mt-0.5 truncate">@{reel.patientName.split(' ')[0]}</p>
        <p className="text-[11px] text-[#F5DCD8] line-clamp-2 leading-snug">{reel.title}</p>
        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#F6CFCB]/10 border border-[#F6CFCB]/30 text-[#F6CFCB] text-[10px] font-medium">
          {reel.treatment}
        </span>
      </div>
    </motion.div>
  );
}

/* ---------------- Written review card (same rail) ---------------- */
function WrittenReviewCard({ review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="relative w-44 md:w-56 aspect-[9/16] snap-start shrink-0 rounded-[1.75rem] overflow-hidden border border-[#E7DDD8] bg-white/75 p-4 flex flex-col shadow-[0_20px_40px_rgba(105,10,1,0.06)]"
    >
      <span className="text-[10px] font-bold tracking-wider text-[#D33616] uppercase">Written ★</span>
      <p className="text-[#403E45] text-sm leading-relaxed mt-3 flex-1 overflow-hidden">
        “{review.comment}”
      </p>
      <div>
        <Stars value={review.rating} className="text-xs" />
        <p className="text-[#690A01] font-bold text-sm mt-1">@{review.patientName.split(' ')[0]}</p>
        <p className="text-[11px] text-[#6E6D7A]">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
      </div>
    </motion.div>
  );
}

/* ---------------- Main section ---------------- */
export default function ReelsSection({ profile }) {
  const [reels, setReels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showReelModal, setShowReelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const railRef = useRef(null);

  useEffect(() => {
    api.get('/reviews/testimonials', { params: { limit: 20 } })
      .then(({ data }) => setReels((data.data || []).filter((t) => t.videoFile?.url)))
      .catch(() => {});
    if (profile?._id) {
      api.get(`/reviews/doctor/${profile._id}`).then(({ data }) => setReviews(data.data || [])).catch(() => {});
    }
  }, [profile]);

  const scrollRail = (dir) => {
    railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const mixed = [...reels, ...reviews].filter((i) =>
    filter === 'all' ? true : filter === 'reels' ? Boolean(i.videoFile?.url) : i.rating === Number(filter)
  );

  return (
    <section id="stories" className="luxury-section py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="section-kicker">
              <Sparkles size={15} /> Patient Love
            </div>
            <h2 className="section-heading mb-4 text-[#690A01]">
              Real stories. <span className="neon-text">Zero filter.</span>
            </h2>
            {profile && (
              <p className="text-[#6E6D7A] mt-2 flex items-center gap-2">
                <Stars value={Math.round(profile.rating) || 5} className="text-sm" />
                <span>{profile.rating || 4.9} · {profile.totalReviews || 0} verified reviews</span>
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowReelModal(true)} className="btn-primary flex items-center gap-2">
              <Camera size={16} /> Record a Reel
            </button>
            <button onClick={() => setShowReviewModal(true)} className="btn-ghost flex items-center gap-2">
              <PenLine size={15} /> Write Review
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scrolling reel rail */}
      <div className="relative">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#F7F1ED] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#F7F1ED] to-transparent z-10" />

        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 md:px-[max(1.5rem,calc((100vw-72rem)/2))] pb-6 pt-2 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* "Add yours" prompt tile */}
          <button
            onClick={() => setShowReelModal(true)}
            className="w-44 md:w-56 aspect-[9/16] snap-start shrink-0 rounded-[1.75rem] border-2 border-dashed border-[#D33616]/30 bg-white/60 flex flex-col items-center justify-center gap-3 text-[#6E6D7A] hover:border-[#D33616]/60 hover:text-[#D33616] transition-colors group shadow-[0_20px_40px_rgba(105,10,1,0.04)]"
          >
            <div className="w-14 h-14 rounded-full bg-[#FDE6E1] border border-[#D33616]/30 flex items-center justify-center group-hover:scale-110 transition-transform text-[#D33616]">
              <Camera size={22} />
            </div>
            <span className="text-sm font-semibold text-[#690A01]">Share your smile</span>
            <span className="text-[11px] text-[#6E6D7A] px-4 text-center">Record a 60-sec reel · reviewed before publishing</span>
          </button>

          {mixed.map((item, i) =>
            item.videoFile?.url ? (
              <ReelCard key={`reel-${item._id}`} reel={item} index={i} />
            ) : (
              <WrittenReviewCard key={`rev-${item._id}`} review={item} index={i} />
            )
          )}

          {!mixed.length && (
            <div className="w-full py-16 text-center text-slate-500 text-sm">
              No patient stories yet — be the first to share! 🎬
            </div>
          )}
        </div>

        {/* scroll arrows */}
        <button
          onClick={() => scrollRail(-1)}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-[#403E45] hover:text-[#D33616]"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scrollRail(1)}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-[#403E45] hover:text-[#D33616]"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* filter chips */}
      <div className="max-w-6xl mx-auto px-6 mt-2 flex gap-2 flex-wrap">
        {['all', 'reels', '5', '4', '3'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === f
                ? 'bg-[#FDE6E1] border-[#D33616]/40 text-[#D33616]'
                : 'border-[#E8DAD5] bg-white/60 text-[#6E6D7A] hover:border-[#D33616]/25 hover:text-[#690A01]'
            }`}
          >
            {f === 'all' ? '✨ All' : f === 'reels' ? '🎬 Reels' : `${f} ★`}
          </button>
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showReelModal && <ReelModal profileId={profile?._id} onClose={() => setShowReelModal(false)} />}
        {showReviewModal && <ReviewModal profileId={profile?._id} onClose={() => setShowReviewModal(false)} />}
      </AnimatePresence>
    </section>
  );
}

