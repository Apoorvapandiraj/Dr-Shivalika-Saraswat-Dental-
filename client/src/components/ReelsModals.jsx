import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Video, Upload, RotateCcw, Send, Star } from 'lucide-react';
import api from '../services/api.js';

const MAX_REEL_SECONDS = 60;
const MAX_REEL_BYTES = 50 * 1024 * 1024; // matches server cap
const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#E7DDD8] bg-white/80 text-[#1C1B1F] text-sm placeholder:text-[#817C83] focus:border-[#D33616] focus:outline-none';

/* ---------------- Reel recorder / upload modal ---------------- */
export function ReelModal({ profileId, onClose }) {
  const videoRef = useRef(null); // live camera preview
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const [mode, setMode] = useState('idle'); // idle | recording | preview
  const [blob, setBlob] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [form, setForm] = useState({ patientName: '', patientEmail: '', rating: 5, title: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [camReady, setCamReady] = useState(false);

  const stopCamera = () => videoRef.current?.srcObject?.getTracks?.().forEach((t) => t.stop());
  useEffect(() => () => { stopCamera(); clearInterval(timerRef.current); }, []);

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      videoRef.current.srcObject = stream;
      setCamReady(true);
    } catch {
      setError('Camera access denied or unavailable. You can upload a video file instead.');
    }
  };

  const startRecording = () => {
    const stream = videoRef.current?.srcObject;
    if (!stream) return;
    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const b = new Blob(chunksRef.current, { type: 'video/webm' });
      if (b.size > MAX_REEL_BYTES) {
        setError('Recording too large (50MB max). Try a shorter clip.');
        setMode('idle');
        return;
      }
      setBlob(b);
      setMode('preview');
    };
    recorderRef.current = rec;
    rec.start();
    setMode('recording');
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_REEL_SECONDS) { clearInterval(timerRef.current); stopRecording(); }
        return s + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    stopCamera();
  };

  const onFilePicked = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { setError('Please choose a video file'); return; }
    if (f.size > MAX_REEL_BYTES) { setError('File too large — 50MB max'); return; }
    setBlob(f);
    setMode('preview');
    setError('');
  };

  const reset = () => { setBlob(null); setMode('idle'); setSeconds(0); setError(''); setCamReady(false); };

  const submit = async () => {
    if (!blob) { setError('Record or upload a video first'); return; }
    setError('');
    setBusy(true);
    try {
      const fd = new FormData();
      if (!profileId) { setError('Doctor profile is still loading — try again in a moment'); setBusy(false); return; }
      fd.append('doctorId', profileId);
      fd.append('video', blob, `reel-${Date.now()}.webm`);
      fd.append('patientName', form.patientName);
      fd.append('patientEmail', form.patientEmail);
      fd.append('rating', String(form.rating));
      fd.append('title', form.title);
      fd.append('type', 'video');
      await api.post('/reviews/testimonials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed — please try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title="Record a Reel" icon={<Camera size={18} className="text-neon-cyan" />} onClose={onClose}>
      {done ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎉</div>
          <h4 className="text-white font-bold mb-1">Reel submitted!</h4>
          <p className="text-slate-400 text-sm mb-6">Our team reviews every reel before it goes live.</p>
          <button onClick={onClose} className="btn-primary w-full">Done</button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs">{error}</div>}

          {mode === 'idle' && (
            <>
              <div className="relative aspect-[9/16] max-h-[42vh] mx-auto rounded-2xl bg-obsidian-950 border border-white/10 flex flex-col items-center justify-center gap-3 overflow-hidden">
                <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                {!camReady && (
                  <>
                    <Camera size={34} className="text-slate-600" />
                    <p className="text-slate-500 text-xs px-6 text-center">Record up to {MAX_REEL_SECONDS}s — vertical video works best</p>
                  </>
                )}
              </div>
              {camReady ? (
                <button onClick={startRecording} className="btn-primary w-full flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Start Recording
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={startCamera} className="btn-primary flex items-center justify-center gap-2 text-sm"><Video size={15} /> Open Camera</button>
                  <label className="btn-ghost flex items-center justify-center gap-2 text-sm cursor-pointer">
                    <Upload size={15} /> Upload File
                    <input type="file" accept="video/*" hidden onChange={onFilePicked} />
                  </label>
                </div>
              )}
            </>
          )}

          {mode === 'recording' && (
            <>
              <div className="relative aspect-[9/16] max-h-[42vh] mx-auto rounded-2xl overflow-hidden border border-red-500/40">
                <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold">
                  ● REC {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')} / {MAX_REEL_SECONDS}s
                </span>
              </div>
              <button onClick={stopRecording} className="btn-primary w-full">■ Stop Recording</button>
            </>
          )}

          {mode === 'preview' && blob && (
            <>
              <video src={URL.createObjectURL(blob)} controls playsInline className="rounded-2xl w-full max-h-[42vh] bg-black" />
              {/* REEL_FORM_PLACEHOLDER */}
              <div className="space-y-2.5">
                <input className={inputCls} placeholder="Your name" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
                <input className={inputCls} type="email" placeholder="Your email (not published)" value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} />
                <input className={inputCls} placeholder="Headline — e.g. 'My smile makeover ✨'" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={100} />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs mr-1">Rating:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} stars`}>
                      <Star size={18} className={n <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={reset} className="btn-ghost flex items-center justify-center gap-2 text-sm"><RotateCcw size={14} /> Redo</button>
                <button
                  onClick={submit}
                  disabled={busy || !form.patientName || !/^\S+@\S+\.\S+$/.test(form.patientEmail)}
                  className="btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-40"
                >
                  <Send size={14} /> {busy ? 'Uploading…' : 'Submit'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                🔒 Reviewed by our team before publishing · your email is never shown
              </p>
            </>
          )}
        </div>
      )}
    </ModalShell>
  );
}

/* ---------------- Written review modal ---------------- */
export function ReviewModal({ profileId, onClose }) {
  const [form, setForm] = useState({ patientName: '', patientEmail: '', rating: 5, comment: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/reviews', { doctorId: profileId, ...form });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title="Write a Review" icon={<Star size={17} className="text-gold" />} onClose={onClose}>
      {done ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">💛</div>
          <h4 className="text-white font-bold mb-1">Thank you!</h4>
          <p className="text-slate-400 text-sm mb-6">Your review will appear after a quick check by our team.</p>
          <button onClick={onClose} className="btn-primary w-full">Done</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <input required className={inputCls} placeholder="Your name" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
            <input required type="email" className={inputCls} placeholder="Email (not published)" value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs mr-1">Rating:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} stars`}>
                <Star size={20} className={n <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
              </button>
            ))}
          </div>
          <textarea
            required
            rows={4}
            className={inputCls}
            placeholder="How was your experience? Be real, be specific…"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            maxLength={800}
          />
          <button disabled={busy} className="btn-primary w-full">
            {busy ? 'Submitting…' : 'Submit Review'}
          </button>
          <p className="text-[11px] text-slate-500 text-center">🔒 Moderated before publishing · your email is never shown</p>
        </form>
      )}
    </ModalShell>
  );
}

/* ---------------- Shared glass modal shell ---------------- */
function ModalShell({ title, icon, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-obsidian-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-[2rem] p-6 w-full max-w-md my-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">{icon} {title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
