import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ArrowRight, CalendarCheck, CalendarDays, CalendarPlus,
  Check, CheckCircle, ChevronLeft, ChevronRight, Clock, CreditCard,
  Gem, IndianRupee, Lock, Mail, MapPin, MessageSquare, Phone,
  ShieldCheck, Smile, Sparkles, Stethoscope, Sun, User, Zap,
} from 'lucide-react';
import api from '../services/api.js';

const STEPS = ['Service', 'Details', 'Done'];
const inputCls = 'w-full rounded-2xl border border-[#F1D7D1] bg-white/90 px-4 py-3.5 text-[15px] text-[#1C1B1F] placeholder:text-[#8E7D7A] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-[#D33616] focus:outline-none focus:ring-4 focus:ring-[#D33616]/12 transition-all';
const numCls = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D33616] to-[#B5210A] text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(211,54,22,0.28)]';
const stepHead = (num, title, sub) => (
  <div className="flex items-center gap-3">
    <span className={numCls}>{num}</span>
    <div>
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#690A01]">{title}</p>
      <p className="text-xs text-[#8E7D7A]">{sub}</p>
    </div>
  </div>
);

function buildICS({ reference, service, date, timeSlot, duration }) {
  const [h, m] = (timeSlot || '09:00').split(':').map(Number);
  const start = new Date(`${date}T00:00:00`);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + (duration || 30) * 60000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DrShivalika//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${reference}@drshivalika`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Dental Appointment — ${service}`,
    `DESCRIPTION:Booking reference ${reference}. Please arrive 10 minutes early.`,
    'LOCATION:Dr. Shivalika Saraswat Dental Clinic',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(booking) {
  const blob = new Blob([buildICS(booking)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `appointment-${booking.reference}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function BookingWidget() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(null);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ service: '', timeSlot: '', patientName: '', patientEmail: '', patientPhone: '', notes: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [payState, setPayState] = useState('idle');

  useEffect(() => {
    api.get('/profile').then(({ data }) => setProfile(data.data)).catch(() => setProfile(null));
    const days = [...Array(14)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
    setDates(days);
    setSelectedDate(days[1]?.toISOString().slice(0, 10) || '');

    const prefill = (e) => {
      const { service } = e.detail || {};
      if (service) setForm((f) => ({ ...f, service, timeSlot: '' }));
      setStep(0);
    };
    window.addEventListener('booking:prefill', prefill);
    return () => window.removeEventListener('booking:prefill', prefill);
  }, []);

  useEffect(() => {
    if (!selectedDate || step >= 3) return;
    setSlots([]);
    api.get(`/bookings/availability?date=${selectedDate}`)
      .then(({ data }) => setSlots(data.data.slots || []))
      .catch(() => setSlots([]));
  }, [selectedDate, step]);

  const selectedService = useMemo(
    () => profile?.services?.find((s) => s.name === form.service),
    [profile, form.service]
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const next = () => setStep((s) => Math.min(s + 1, 2));
  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 0)); };

  const confirmBooking = async () => {
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/bookings', {
        doctorId: profile?._id,
        patientName: form.patientName,
        patientEmail: form.patientEmail,
        patientPhone: form.patientPhone,
        service: form.service,
        appointmentDate: selectedDate,
        timeSlot: form.timeSlot,
        notes: form.notes,
      });
      setReference(data.data.bookingReference);
      setConfirmedBooking({
        reference: data.data.bookingReference,
        service: form.service,
        date: selectedDate,
        timeSlot: form.timeSlot,
        duration: selectedService?.duration || 30,
        price: selectedService?.price || 0,
      });
      setPayState('idle');
      next();
    } catch (e) {
      setError(e.response?.data?.message || 'Booking failed');
    } finally {
      setBusy(false);
    }
  };

  const payOnline = async () => {
    if (!confirmedBooking) return;
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    setPayState('paying');
    const ok = key && (await loadRazorpay());
    if (!ok) {
      setPayState('unavailable');
      return;
    }
    const rzp = new window.Razorpay({
      key,
      amount: confirmedBooking.price * 100,
      currency: 'INR',
      name: 'Dr. Shivalika Saraswat',
      description: `${confirmedBooking.service} — ${confirmedBooking.reference}`,
      theme: { color: '#D33616' },
      prefill: { name: form.patientName, email: form.patientEmail, contact: form.patientPhone },
      handler: () => setPayState('paid'),
      modal: { ondismiss: () => setPayState('idle') },
    });
    rzp.open();
  };

  return (
<section id="booking" className="relative overflow-hidden py-24">
      {/* ── Animated decorative background ── */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 top-10 h-[26rem] w-[26rem] rounded-full bg-[#D33616]/10 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-20 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[#CF8976]/15 blur-[110px]"
          animate={{ x: [0, -32, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#C98A3A]/10 blur-[90px]"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: 'radial-gradient(rgba(105,10,1,0.06) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ── Header ── */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8DAD5] bg-white/80 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D33616] shadow-[0_12px_28px_rgba(105,10,1,0.06)] backdrop-blur-md"
          >
            <Sparkles size={14} className="animate-[pulseGlow_2s_ease-in-out_infinite]" /> Secure Booking
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-black tracking-[-0.08em] text-[#690A01] md:text-5xl"
          >
            Reserve Your <span className="neon-text">Appointment</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-[#8E7D7A]"
          >
            <span className="inline-flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-600" /> Instant confirmation</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#D33616]" /> No OTP needed</span>
            <span className="inline-flex items-center gap-1.5"><CalendarCheck size={14} className="text-[#C98A3A]" /> Free rescheduling</span>
          </motion.div>
        </div>
{/* ── Animated gradient-border booking card ── */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] p-[2px] shadow-[0_45px_100px_rgba(105,10,1,0.16)]"
        >
          <motion.div
            className="absolute -inset-[150%]"
            style={{ background: 'conic-gradient(from 0deg, #F6CAB8, #D33616, #C98A3A, #D33616, #F6CAB8)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative rounded-[calc(2.5rem-2px)] bg-[#FFFDFC]/90 backdrop-blur-2xl">
            <div className="absolute -right-12 top-0 h-44 w-44 rounded-full bg-[#D33616]/10 blur-3xl" />
            <div className="absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-[#CF8976]/12 blur-3xl" />

            <div className="relative p-5 md:p-8">
              <StepIndicator step={step} />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 p-3 text-center text-sm font-medium text-red-700"
                >
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 26 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -26 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {step === 0 && <ServiceStep profile={profile} dates={dates} selectedDate={selectedDate} setSelectedDate={setSelectedDate} slots={slots} form={form} setForm={setForm} next={next} />}
                  {step === 1 && <DetailsStep form={form} set={set} selectedDate={selectedDate} selectedService={selectedService} back={back} confirmBooking={confirmBooking} busy={busy} />}
                  {step === 2 && <DoneStep booking={confirmedBooking} payState={payState} onPay={payOnline} onDownload={downloadICS} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Trust strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#8E7D7A]"
        >
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#D33616]" /> 256-bit secure checkout</span>
          <span className="inline-flex items-center gap-1.5"><Lock size={13} className="text-[#D33616]" /> Your details stay private</span>
          <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-[#D33616]" /> Dr. Shivalika Saraswat Dental Clinic</span>
        </motion.div>
      </div>
    </section>
  );
}
function StepIndicator({ step }) {
  return (
    <div className="mb-8">
      {/* Animated progress bar */}
      <div className="mx-auto mb-6 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-[#F1E3DE]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#D33616] via-[#D33616] to-[#C98A3A]"
          animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        />
      </div>

      <div className="flex items-start justify-center gap-1 md:gap-2">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale: active ? 1.1 : 1,
                  backgroundColor: done ? '#1A7A54' : active ? '#D33616' : '#F4EAE6',
                }}
                whileHover={{ scale: 1.12 }}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-extrabold transition-shadow ${done || active ? 'text-white shadow-[0_10px_22px_rgba(211,54,22,0.3)]' : 'text-[#A88F85]'}`}
              >
                {done ? (
                  <motion.span
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Check size={17} strokeWidth={3} />
                  </motion.span>
                ) : (
                  i + 1
                )}
              </motion.div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.14em] md:text-[11px] ${done || active ? 'text-[#D33616]' : 'text-[#B39A92]'}`}>{label}</span>

              {/* Connector line below step */}
              {i < STEPS.length - 1 && (
                <div className="h-1 w-full max-w-[3.5rem] overflow-hidden rounded-full bg-[#F1E3DE]">
                  <motion.div
                    className="h-full bg-[#D33616]/70"
                    animate={{ width: done ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function ServiceStep({ profile, dates, selectedDate, setSelectedDate, slots, form, setForm, next }) {
  const serviceIcons = {
    'Dental Consultation': Stethoscope,
    'Teeth Cleaning & Polishing': Sparkles,
    'Root Canal Treatment': Activity,
    'Root Canal Therapy': Activity,
    'Dental Implants': Gem,
    'Porcelain Veneers': Gem,
    'Teeth Whitening': Sun,
    'Invisible Aligners': Smile,
    'Laser Gingivoplasty': Zap,
  };
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fmtPrice = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-7">
      {/* ── 1 · Select service ── */}
      {stepHead(1, 'Select Service', 'Choose your treatment')}
      <div className="grid gap-3 sm:grid-cols-2">
        {(profile?.services || []).map((s, i) => {
          const Icon = serviceIcons[s.name] || Stethoscope;
          const selected = form.service === s.name;
          return (
            <motion.button
              key={s.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setForm((f) => ({ ...f, service: s.name, timeSlot: '' }))}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${selected ? 'border-[#D33616]/70 bg-[linear-gradient(135deg,#FFF2EC,#FFE2DA)] shadow-[0_18px_38px_rgba(211,54,22,0.16)]' : 'border-[#F0E3DF] bg-white/75 hover:border-[#D33616]/35 hover:shadow-[0_18px_38px_rgba(105,10,1,0.08)]'}`}
            >
              <AnimatePresence>
                {selected && (
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                    className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white shadow-[0_6px_14px_rgba(211,54,22,0.4)]"
                  >
                    <Check size={13} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>

              <div className="flex items-start gap-3.5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${selected ? 'bg-[#D33616] text-white' : 'bg-[#FDEAE5] text-[#D33616] group-hover:bg-[#FADFD5]'}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold leading-snug text-[#1C1B1F]">{s.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8E7D7A]">{s.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FDEAE5] px-2 py-0.5 text-xs font-bold text-[#D33616]">
                      <IndianRupee size={10} strokeWidth={3} /> {fmtPrice(s.price)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8E7D7A]">
                      <Clock size={11} /> {s.duration || 30} min
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
        {!profile && <p className="col-span-full py-6 text-center text-sm text-[#8E7D7A]">Loading services…</p>}
      </div>
{/* ── 2 · Pick a date ── */}
      {stepHead(2, 'Pick a Date', 'Choose your preferred day')}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {dates.map((d, i) => {
          const val = d.toISOString().slice(0, 10);
          const active = selectedDate === val;
          return (
            <motion.button
              key={val}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (i % 7) * 0.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSelectedDate(val)}
              className={`flex flex-col items-center rounded-2xl border py-2.5 transition-all duration-300 ${active ? 'border-[#D33616] bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white shadow-[0_14px_28px_rgba(211,54,22,0.3)]' : 'border-[#F0E3DF] bg-white/75 text-[#403E45] hover:-translate-y-0.5 hover:border-[#D33616]/35'}`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${active ? 'text-white/85' : 'text-[#B39A92]'}`}>{dayLabels[d.getDay()]}</span>
              <span className="mt-0.5 text-lg font-extrabold leading-none">{d.getDate()}</span>
              <span className={`mt-0.5 text-[9px] font-semibold uppercase ${active ? 'text-white/75' : 'text-[#C4B4AD]'}`}>{d.toLocaleString('en-IN', { month: 'short' })}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── 3 · Available slots ── */}
      {stepHead(3, 'Available Slots', slots.filter((s) => s.available).length ? `${slots.filter((s) => s.available).length} open slots` : 'Fetching availability…')}
      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
        {(slots.length ? slots : Array.from({ length: 12 }, () => null)).map((s, i) => {
          if (!s) return <div key={i} className="animate-pulse rounded-2xl bg-[#F4EAE6] py-3.5" />;
          const selected = form.timeSlot === s.slot;
          return (
            <motion.button
              key={s.slot}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, delay: i * 0.03 }}
              disabled={!s.available}
              onClick={() => setForm((f) => ({ ...f, timeSlot: s.slot }))}
              className={`relative rounded-2xl border py-3 text-sm font-bold transition-all duration-300 ${selected ? 'border-[#D33616] bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white shadow-[0_14px_28px_rgba(211,54,22,0.3)]' : s.available ? 'border-[#F0E3DF] bg-white/75 text-[#403E45] hover:-translate-y-0.5 hover:border-[#D33616]/40 hover:text-[#D33616]' : 'cursor-not-allowed border-[#F5E9E4] bg-[#F8F1EF] text-[#C9B7B0] line-through'}`}
            >
              {s.slot}
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#D33616] shadow-md"
                >
                  <Check size={12} strokeWidth={3.5} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={next}
        disabled={!form.service || !form.timeSlot}
        className="btn-primary w-full py-4 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue <ChevronRight size={16} />
      </motion.button>
    </div>
  );
}
function DetailsStep({ form, set, selectedDate, selectedService, back, confirmBooking, busy }) {
  const valid =
    form.patientName.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(form.patientEmail) &&
    /^[0-9]{10}$/.test(form.patientPhone);

  return (
    <div className="space-y-5">
      {stepHead(2, 'Your Details', 'Where should we confirm your appointment?')}

      <div className="relative">
        <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#C0866F]" size={18} />
        <input value={form.patientName} onChange={set('patientName')} className={`${inputCls} pl-11`} placeholder="Your full name" />
      </div>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#C0866F]" size={18} />
        <input type="email" value={form.patientEmail} onChange={set('patientEmail')} className={`${inputCls} pl-11`} placeholder="your@email.com" />
      </div>
      <div className="relative">
        <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#C0866F]" size={18} />
        <input value={form.patientPhone} onChange={set('patientPhone')} className={`${inputCls} pl-11`} placeholder="9876543210" maxLength="10" />
      </div>
      <div className="relative">
        <MessageSquare className="pointer-events-none absolute left-4 top-4 text-[#C0866F]" size={18} />
        <textarea value={form.notes} onChange={set('notes')} className={`${inputCls} min-h-[110px] resize-none pl-11`} rows="3" placeholder="Anything the doctor should know…" />
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-[1.5rem] border border-[#F0E3DF] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,244,240,0.9))] p-4 text-sm leading-7 text-[#403E45] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
      >
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#690A01]">Appointment summary</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#1C1B1F]">
            <CalendarDays size={13} className="text-[#D33616]" /> {selectedDate || '—'} · {form.timeSlot || '—'}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-[#1C1B1F]">
            <Clock size={13} className="text-[#D33616]" /> {form.service || 'No service'}
          </span>
          {selectedService ? (
            <span className="inline-flex items-center gap-1 font-semibold text-[#D33616]">
              <IndianRupee size={12} strokeWidth={3} /> {Number(selectedService.price).toLocaleString('en-IN')}
            </span>
          ) : null}
        </div>
      </motion.div>

      <div className="flex gap-3 pt-2">
        <button onClick={back} className="btn-ghost flex-1">
          <ChevronLeft size={15} /> Back
        </button>
        <button onClick={confirmBooking} disabled={busy || !valid} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40">
          <CheckCircle size={15} /> {busy ? 'Confirming…' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
function DoneStep({ booking, payState, onPay, onDownload }) {
  if (!booking) return null;
  const colors = ['#D33616', '#C98A3A', '#CF8976', '#F5B8A3'];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-2 text-center">
      {/* ── Animated success check + rings + confetti ── */}
      <div className="relative mx-auto mb-6 h-24 w-24">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-[#D33616]/30"
          animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-[#C98A3A]/25"
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 }}
        />
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.15 }}
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white shadow-[0_24px_50px_rgba(211,54,22,0.35)]"
        >
          <Check size={44} strokeWidth={3.5} />
        </motion.div>
        {[...Array(12)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{ background: colors[i % 4] }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos((i / 12) * Math.PI * 2) * (72 + (i % 3) * 22),
              y: Math.sin((i / 12) * Math.PI * 2) * (72 + (i % 3) * 22),
              opacity: 0,
            }}
            transition={{ duration: 1.1, delay: 0.25 + i * 0.04, ease: 'easeOut' }}
          />
        ))}
      </div>

      <h3 className="mb-2 text-3xl font-black tracking-[-0.06em] text-[#690A01]">Booking Confirmed!</h3>
      <p className="text-sm text-[#8E7D7A]">
        Reference <strong className="tracking-[0.22em] text-[#D33616]">{booking.reference}</strong>
      </p>

      {/* ── Summary ticket ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-auto mt-5 max-w-sm rounded-[1.75rem] border border-[#F0E3DF] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,244,240,0.9))] p-5 text-left shadow-[0_18px_35px_rgba(105,10,1,0.08)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDEAE5] text-[#D33616]">
            <CalendarDays size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#1C1B1F]">{booking.service}</p>
            <p className="text-xs text-[#8E7D7A]">{booking.date} at {booking.timeSlot} · {booking.duration || 30} min</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FDEAE5] px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8E7D7A]">Total</span>
          <span className="text-xl font-extrabold text-[#D33616]">₹{booking.price}</span>
        </div>
      </motion.div>

      {/* ── Pay online ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-auto mt-4 max-w-sm rounded-[1.75rem] border border-[#F0E3DF] bg-white/85 p-5 text-left shadow-[0_18px_35px_rgba(105,10,1,0.06)]"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-base font-bold text-[#690A01]"><CreditCard size={16} className="text-[#D33616]" /> Pay online</p>
            <p className="mt-1 text-xs text-[#8E7D7A]">Secure checkout via Razorpay</p>
          </div>
          {payState === 'paid' ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-semibold text-emerald-700"
            >
              <Check size={14} /> Paid
            </motion.span>
          ) : (
            <button
              onClick={onPay}
              disabled={payState === 'paying'}
              className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
            >
              {payState === 'paying' ? 'Opening…' : `Pay ₹${booking.price}`}
            </button>
          )}
        </div>
        {payState === 'unavailable' && (
          <p className="mt-3 text-xs text-amber-700">Online payment is unavailable right now — you can pay at the clinic. Your appointment is confirmed.</p>
        )}
      </motion.div>

      <button onClick={() => onDownload(booking)} className="btn-ghost mt-4 inline-flex w-full max-w-sm items-center justify-center gap-2">
        <CalendarPlus size={16} /> Add to Calendar (.ics)
      </button>

      <p className="mt-5 text-xs text-[#8E7D7A]">A confirmation has been sent to your email. Please arrive 10 minutes early.</p>
    </motion.div>
  );
}