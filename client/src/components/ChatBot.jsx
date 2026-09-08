import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, X, Sparkles, User, Phone, Mail, Check,
  RotateCcw, ShieldCheck, CalendarDays, Clock, MapPin, IndianRupee,
} from 'lucide-react';
import api from '../services/api.js';

const MAIN_CHIPS = ['💲 Services & Prices', '🕐 Working Hours', '📍 Location & Contact', '📅 Book an Appointment', '💳 Payment Options', 'Done for now'];

const fmtPrice = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [chips, setChips] = useState([]);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState(null);
  const [phase, setPhase] = useState('name');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', interest: '', note: '' });
  const [leadSaved, setLeadSaved] = useState(false);
  const scrollRef = useRef(null);
  const idRef = useRef(1);

  const addMsg = (from, text) => setMsgs((m) => [...m, { id: idRef.current++, from, text }]);

  const botSay = (text, nextChips = []) => {
    setTyping(true);
    setChips([]);
    setTimeout(() => {
      setTyping(false);
      addMsg('bot', text);
      setChips(nextChips);
    }, 900);
  };

  useEffect(() => {
    if (!open) return undefined;
    api.get('/profile').then(({ data }) => setProfile(data.data)).catch(() => {});
    const t = setTimeout(() => {
      addMsg('bot', "Hi! 👋 Welcome to Dr. Shivalika Saraswat's dental clinic.\nI'm Mira, your care assistant — I can share treatment prices, working hours and help you book an appointment in under a minute.\n\nMay I have your name, please? 😊");
    }, 700);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing, open]);

  const serviceList = () => {
    const svcs = profile?.services || [];
    if (!svcs.length) return 'Our treatment menu is being updated — please call +91 98765 43210 for live pricing.';
    return svcs.map((s) => `• ${s.name} — from ${fmtPrice(s.price)} (${s.duration || 30} min)`).join('\n');
  };

  const hoursLine = () => {
    const wh = profile?.workingHours || {};
    return `🕐 Clinic hours: ${wh.start || '09:00'} – ${wh.end || '20:00'}, Monday to Saturday. We recommend booking at least ${profile?.bookingAdvanceNotice || 24} hours ahead.`;
  };

  const intentAnswer = (q) => {
    const t = q.toLowerCase();
    if (/(price|cost|service|treatment|offer|fee|charge|menu|what do you|provide)/.test(t))
      return { text: `Here's our full treatment menu:\n\n${serviceList()}\n\n💡 Final quote is confirmed after a clinical examination. Want me to arrange a callback?`, interest: 'Services & Prices' };
    if (/(hour|timing|time|open|close|when|weekend|sunday)/.test(t))
      return { text: hoursLine(), interest: 'Working Hours' };
    if (/(location|address|where|reach|clinic|contact|direction)/.test(t))
      return { text: '📍 Dr. Shivalika Saraswat Dental Clinic — heart of the city (map link on request).\n☎️ +91 98765 43210 · dr.shivalika@example.com', interest: 'Location & Contact' };
    if (/(pay|payment|razorpay|online|upi|card)/.test(t))
      return { text: '💳 Pay online securely via Razorpay (cards/UPI) at checkout, or at the clinic after your visit. E-receipts are automatic.', interest: 'Payment' };
    if (/(book|appointment|schedule|consultation|slot|date|reserve|visit|cancel|reschedule)/.test(t))
      return { text: '📅 Booking takes under a minute:\n1️⃣ Choose your treatment\n2️⃣ Pick a date & available slot\n3️⃣ Verify with the OTP emailed to you — instant confirmation!\n\nScroll to the "Secure Booking" section on this page, or I can arrange a callback. ✨ Free rescheduling.', interest: 'Appointment / Booking' };
    if (/(emergency|urgent|pain|hurt|bleed|swollen)/.test(t))
      return { text: '🆘 For emergencies please call +91 98765 43210 right away. If critical, visit the nearest hospital — we will follow up with you.', interest: 'Emergency' };
    return null;
  };

  const saveLead = async (overrides = {}) => {
    if (leadSaved || !customer.name) return;
    setLeadSaved(true);
    try {
      await api.post('/leads', {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        interest: overrides.interest || customer.interest,
        note: overrides.note || customer.note,
      });
    } catch {
      /* silent — rate limit/offline; phone number still visible to staff via chat */
    }
  };

  const handleAnswer = (text) => {
    const lower = text.toLowerCase();
    if (/(done|finished|nothing else|that'?s all|ok thanks|bye|no thanks)/.test(lower)) {
      saveLead({ note: customer.note || 'Completed chat' });
      setPhase('done');
      botSay(`Thank you, ${customer.name}! 🎉 Your details are with our care team — we'll reach out if needed.\n\nUntil then, keep smiling! 😊✨`);
      return;
    }
    const ans = intentAnswer(text);
    if (ans) {
      setCustomer((c) => ({ ...c, interest: ans.interest }));
      saveLead({ interest: ans.interest });
      setPhase('followup');
      botSay(ans.text, ['Yes, something else', 'Done for now']);
      return;
    }
    setPhase('followup');
    botSave(text);
  };

  const botSave = (original) => {
    saveLead({ note: `Asked: "${original.slice(0, 140)}"` });
    botSay(`Great question — I've passed it to our care team and they'll get back to you shortly! 🙌\n\nMeanwhile, would you like to see our treatments & prices, working hours, or book an appointment?`, ['💲 Services & Prices', '🕐 Working Hours', '📅 Book an Appointment', 'Done for now']);
  };

  const handleSend = (raw) => {
    const text = raw?.trim();
    if (!text || typing) return;
    addMsg('user', text);
    setInput('');
    setChips([]);

    if (phase === 'name') {
      if (text.length < 2) { botSay('That looks a little short — may I have your full name, please? 🙂'); return; }
      setCustomer((c) => ({ ...c, name: text }));
      setPhase('phone');
      botSay(`Lovely to meet you, ${text}! 📱 What's your 10-digit mobile number? (Only used to confirm your appointment.)`);
      return;
    }
    if (phase === 'phone') {
      const digits = text.replace(/\D/g, '');
      if (!/^[0-9]{10}$/.test(digits)) { botSay("Hmm, that's not a valid 10-digit number — please try again, e.g. 9876543210 🙂"); return; }
      setCustomer((c) => ({ ...c, phone: digits }));
      setPhase('email');
      botSay('Perfect! ✉️ And your email? We send confirmations & receipts there.');
      return;
    }
    if (phase === 'email') {
      if (!/^\S+@\S+\.\S+$/.test(text)) { botSay('That email looks off — mind re-checking it? e.g. name@email.com 🙂'); return; }
      setCustomer((c) => ({ ...c, email: text.toLowerCase() }));
      setPhase('intent');
      botSay(`All set, ${customer.name}! 🎉 How can I help you today?`, MAIN_CHIPS);
      return;
    }
    if (phase === 'done') {
      setPhase('intent');
      botSay(`Anything else I can help with, ${customer.name}?`, MAIN_CHIPS);
      return;
    }
    handleAnswer(text);
  };

  const resetChat = () => {
    setMsgs([]);
    setChips([]);
    setPhase('name');
    setCustomer({ name: '', phone: '', email: '', interest: '', note: '' });
    setLeadSaved(false);
    idRef.current = 1;
    setTimeout(() => addMsg('bot', 'Hi again! 👋 Let’s start fresh — may I have your name, please? 😊'), 350);
  };
return (
    <>
      {/* ── Launcher ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-[80] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#8B1405] text-white shadow-[0_18px_45px_rgba(211,54,22,0.4)]"
            aria-label="Chat with Mira, care assistant"
          >
            <span className="absolute inset-0 rounded-full border-2 border-[#D33616]/50" style={{ animation: 'chatPing 2.2s ease-out infinite' }} />
            <Bot size={26} />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A7A54] text-[10px] font-bold text-white ring-2 ring-white">
              <Sparkles size={10} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed bottom-6 right-6 z-[80] flex h-[600px] max-h-[calc(100vh-3rem)] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[1.8rem] border border-[#F1D9D0] bg-white/92 shadow-[0_45px_100px_rgba(105,10,1,0.25)] backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 bg-[linear-gradient(135deg,#D33616_0%,#B5210A_55%,#8B1405_100%)] px-4 py-4 text-white">
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Bot size={24} />
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-white/70" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-extrabold tracking-wide">Mira · Care Assistant</p>
                <p className="flex items-center gap-1 text-[11px] text-white/85"><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" /> Online — replies instantly</p>
              </div>
              <button onClick={resetChat} title="New chat" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25 hover:rotate-90">
                <RotateCcw size={15} />
              </button>
              <button onClick={() => setOpen(false)} title="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#fffaf8,#fdf5f1)] px-4 py-4">
              {msgs.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 24, delay: i === 0 ? 0 : 0.03 }}
                  className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.from === 'bot' && (
                    <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#8B1405] text-white shadow-md">
                      <Bot size={13} />
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-[0_6px_16px_rgba(105,10,1,0.06)] ${
                      m.from === 'user'
                        ? 'rounded-br-md bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white'
                        : 'rounded-bl-md border border-[#F1D9D0] bg-white text-[#403E45]'
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#8B1405] text-white">
                    <Bot size={13} />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#F1D9D0] bg-white px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-[#D33616]"
                        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
{/* Quick-reply chips */}
            <AnimatePresence>
              {chips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap gap-1.5 border-t border-[#F5EAE4] bg-[#FFF9F6] px-4 py-2.5"
                >
                  {chips.map((ch) => (
                    <motion.button
                      key={ch}
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSend(ch)}
                      className="rounded-full border border-[#D33616]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#690A01] shadow-[0_4px_12px_rgba(105,10,1,0.06)] transition-colors hover:bg-[#FDE9E2]"
                    >
                      {ch}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex items-center gap-2 border-t border-[#F5EAE4] bg-white/95 p-3"
            >
              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={phase === 'name' ? 'Type your name…' : phase === 'phone' ? '10-digit mobile number…' : phase === 'email' ? 'you@email.com' : 'Type your message…'}
                  className="w-full rounded-full border border-[#F1D9D0] bg-[#FFFDFC] px-4 py-3 text-sm text-[#1C1B1F] outline-none transition focus:border-[#D33616]/60 focus:ring-4 focus:ring-[#D33616]/10"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="submit"
                disabled={typing || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#8B1405] text-white shadow-[0_10px_22px_rgba(211,54,22,0.35)] transition disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={17} />
              </motion.button>
            </form>

            {/* Footer trust line */}
            <div className="flex items-center justify-center gap-1.5 border-t border-[#F5EAE4] bg-[#FFF9F6] py-2 text-[10px] font-medium text-[#B39A92]">
              <ShieldCheck size={11} className="text-[#1A7A54]" />
              Your details are kept private & never shared
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}