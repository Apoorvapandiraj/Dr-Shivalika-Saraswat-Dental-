import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api.js';

const LEAD_KEY = 'ds_chatbot_leads';

function Icon({ name, size = 20, className = '' }) {
  const paths = {
    chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
    send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    spark: <path d="M12 3l1.9 5.8 5.9 1.7-5.9 1.7L12 18l-1.9-5.8-5.9-1.7 5.9-1.7L12 3zM19 15l.9 2.6L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.4L19 15z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
    check: <path d="M20 6 9 17l-5-5" />,
    trash: <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />,
    doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
    heart: <path d="M19 14c1.5-1.5 2-3.2 2-5a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 1.8.5 3.5 2 5l7 7z" />,
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
}

function loadLeads() {
  try { return JSON.parse(localStorage.getItem(LEAD_KEY)) || []; } catch { return []; }
}

const CLINIC_LINE = ['Dr. Shivalika Saraswat Dental Clinic', '☎️ For appointments: +91 98765 43210'];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [chips, setChips] = useState([]);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [phase, setPhase] = useState('name');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', interest: '', note: '' });
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef(null);
  const idRef = useRef(1);
const addMsg = (from, text) => {
    setMsgs((m) => [...m, { id: idRef.current++, from, text }]);
  };

  const botSay = (text, nextChips = []) => {
    setTyping(true);
    setChips([]);
    setTimeout(() => {
      setTyping(false);
      addMsg('bot', text);
      setChips(nextChips);
    }, 850);
  };

  const persistLead = (refresh = true, overrides = {}) => {
    const entry = {
      id: Date.now(),
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      interest: customer.interest,
      note: customer.note,
      at: new Date().toISOString(),
      ...overrides,
    };
    if (refresh) {
      const all = [entry, ...loadLeads()];
      localStorage.setItem(LEAD_KEY, JSON.stringify(all));
      setLeads(all);
    }
    setSaved(true);
  };

  useEffect(() => {
    const stored = loadLeads();
    setLeads(stored);
    api.get('/profile')
      .then(({ data }) => setProfile(data.data))
      .catch(() => {});
    // Opening greeting
    const t = setTimeout(() => {
      addMsg('bot', "Hi! 👋 Welcome to the Dr. Shivalika Saraswat Dental Clinic.\nI'm Mira, your care assistant. I can share treatment prices, working hours and help you book an appointment.\n\nMay I have your name, please? 😊");
    }, 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing, open, tab]);

  const serviceList = () => {
    const svcs = profile?.services || [];
    if (!svcs.length) return 'Our treatment menu is being updated — please call us at +91 98765 43210 for live pricing.';
    return svcs.map((s) => `• ${s.name} — from ₹${Number(s.price).toLocaleString('en-IN')} (${s.duration || 30} min)`).join('\n');
  };

  const hoursLine = () => {
    const wh = profile?.workingHours || {};
    return `Clinic hours: ${wh.start || '09:00'} – ${wh.end || '20:00'}, Monday to Saturday. We advise booking at least ${profile?.bookingAdvanceNotice || 24} hours in advance.`;
  };

  const MAIN_CHIPS = ['💲 Services & Prices', '🕐 Working Hours', '📍 Location & Contact', '📅 Book an Appointment', '💳 Payment Options', 'Done for now'];

  const intentAnswer = (text) => {
    const q = text.toLowerCase();
    if (/(price|cost|service|treatment|offer|fee|charge|menu|what do you|provide)/.test(q)) {
      return {
        text: `Here are our treatments and starting prices:\n\n${serviceList()}\n\n💡 Final quote is confirmed after a clinical examination. Want me to arrange a callback with the doctor?`,
        interest: 'Services & Prices',
      };
    }
    if (/(hour|timing|time|open|close|when|weekend|sunday)/.test(q)) {
      return { text: `🕐 ${hoursLine()}`, interest: 'Working Hours' };
    }
    if (/(location|address|where|reach|clinic|contact|phone|call|direction)/.test(q)) {
      return {
        text: `${CLINIC_LINE[0]}\n📍 We're located in the heart of the city (Google Maps link available on request).\n${CLINIC_LINE[1]}`,
        interest: 'Location & Contact',
      };
    }
    if (/(pay|payment|razorpay|online|upi|card)/.test(q)) {
      return {
        text: '💳 You can pay online securely via Razorpay (cards / UPI) at checkout, or settle at the clinic after your visit. A receipt is emailed to you automatically.',
        interest: 'Payment',
      };
    }
    if (/(book|appointment|schedule|consultation|slot|date|reserve|visit|confirm my booking|status|reference|cancel|reschedule)/.test(q)) {
      return {
        text: '📅 Booking is quick and secure:\n1️⃣ Pick your treatment and a date\n2️⃣ Choose an available time slot\n3️⃣ Verify with the OTP sent to your email — you get instant confirmation.\n\n✨ Free rescheduling & cancellation. Visit our website (localhost:3000) → Secure Booking to reserve now, or I can arrange a callback for you.',
        interest: 'Appointment / Booking',
      };
    }
    if (/(emergency|urgent|pain|hurt|bleed|swollen)/.test(q)) {
      return { text: '🆘 For an emergency, please call us right away on +91 98765 43210. If it is critical, visit the nearest hospital immediately. Our team will stay in touch.', interest: 'Emergency' };
    }
    return null;
  };

  const handleAnswer = (text, chipsMain = MAIN_CHIPS) => {
    const lower = text.toLowerCase();
    if (/(done|finished|nothing else|that'?s all|ok thanks|bye|no thanks)/.test(lower)) {
      if (!saved) { setCustomer((c) => ({ ...c, note: c.note || 'Completed chat' })); persistLead(); }
      setPhase('done');
      botSay(`Thank you, ${customer.name || 'friend'}! 🎉 I've noted your details. Our front desk will reach out if needed.\n\nHave a bright & healthy smile! 😊✨`);
      return;
    }
    const ans = intentAnswer(text);
    if (ans) {
      setCustomer((c) => ({ ...c, interest: ans.interest }));
      if (!saved && customer.name) {
        persistLead(true, { interest: ans.interest });
      }
      setPhase('followup');
      botSay(ans.text, ['Yes, something else', 'Done for now']);
      return;
    }
    // fallback
    if (phase === 'followup') {
      setPhase('followup');
      botSay(`I'd love to help with that! For anything not covered here, please call us at +91 98765 43210 or mail dr.shivalika@example.com.\n\nMeanwhile — would you like to see our services, working hours, or book an appointment?`, ['💲 Services & Prices', '🕐 Working Hours', '📅 Book an Appointment', 'Done for now']);
      return;
    }
    botSay(`Great question! I'll connect you with our care team for that. In the meantime — would you like to know our services & prices, working hours, or book an appointment?`, ['💲 Services & Prices', '🕐 Working Hours', '📅 Book an Appointment', 'Done for now']);
  };

  const handleSend = (raw) => {
    const text = raw?.trim();
    if (!text || typing) return;
    addMsg('user', text);
    setInput('');
    setChips([]);

    if (phase === 'name') {
      if (text.length < 2) {
        botSay("That name looks a little short — may I have your full name, please? 🙂");
        return;
      }
      setCustomer((c) => ({ ...c, name: text }));
      setPhase('phone');
      botSay(`Nice to meet you, ${text}! 📱 Please share your 10-digit mobile number so we can reach you.`);
      return;
    }
    if (phase === 'phone') {
      const digits = text.replace(/\D/g, '');
      if (!/^[0-9]{10}$/.test(digits)) {
        botSay("That doesn't look like a valid 10-digit number. Please re-enter your mobile number, e.g. 9876543210 🙂");
        return;
      }
      setCustomer((c) => ({ ...c, phone: digits }));
      setPhase('email');
      botSay('Perfect! ✉️ And your email address? We’ll send confirmations & updates there.');
      return;
    }
    if (phase === 'email') {
      if (!/^\S+@\S+\.\S+$/.test(text)) {
        botSay("Hmm, that email doesn't look right — could you re-check it please? e.g. name@email.com 🙂");
        return;
      }
      setCustomer((c) => ({ ...c, email: text.toLowerCase() }));
      setPhase('intent');
      botSay(`Thanks, ${customer.name}! You're all set. 🎉 How can I help you today?`, MAIN_CHIPS);
      return;
    }
    // intent / followup / done
    if (phase === 'done') {
      botSay(`Is there anything else I can help you with, ${customer.name}? You can also restart the chat anytime.`, MAIN_CHIPS);
      setPhase('intent');
      return;
    }
    handleAnswer(text);
  };

  const clearLeads = () => {
    if (!window.confirm('Clear all captured leads?')) return;
    localStorage.removeItem(LEAD_KEY);
    setLeads([]);
  };

  const resetChat = () => {
    setMsgs([]);
    setChips([]);
    setPhase('name');
    setCustomer({ name: '', phone: '', email: '', interest: '', note: '' });
    setSaved(false);
    idRef.current = 1;
    const t = setTimeout(() => {
      addMsg('bot', "Hi! 👋 Let's start fresh. May I have your name, please? 😊");
    }, 350);
    return () => clearTimeout(t);
  };
return (
    <>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white shadow-[0_18px_40px_rgba(211,54,22,0.35)] transition-transform duration-200 hover:scale-105"
          style={{ animation: 'launcherPulse 2.4s ease-in-out infinite' }}
          aria-label="Chat with Mira, care assistant"
        >
          <Icon name="chat" size={26} />
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A7A54] text-[10px] font-bold text-white ring-2 ring-white">1</span>
          <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-[#1A7A54]" />
        </button>
      ) : (
        <div
          className="fixed bottom-6 right-6 z-[60] flex h-[600px] max-h-[calc(100vh-3rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[1.6rem] border border-[#F0DDCF] bg-[#FFFDFC] shadow-[0_40px_90px_rgba(105,10,1,0.22)]"
          style={{ animation: 'chatPop 0.35s ease both' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#D33616] to-[#8B1405] px-4 py-3.5 text-white">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
              <Icon name="spark" size={20} />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white/80" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold tracking-wide">Mira · Care Assistant</p>
              <p className="truncate text-[11px] text-white/80">Online — answers instantly, 24×7</p>
            </div>
            <button onClick={resetChat} title="Start a new chat" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
              <Icon name="heart" size={15} />
            </button>
            <button onClick={() => setOpen(false)} title="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
              <Icon name="close" size={15} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 border-b border-[#F0DDCF] bg-[#FFF9F6] px-3 pt-2">
            <button
              onClick={() => setTab('chat')}
              className={`flex items-center gap-1.5 rounded-t-xl border-b-2 px-3 py-2 text-xs font-bold tracking-[0.08em] transition ${tab === 'chat' ? 'border-[#D33616] bg-[#FFF3EF] text-[#D33616]' : 'border-transparent text-[#8E7D7A] hover:text-[#690A01]'}`}
            >
              <Icon name="chat" size={13} /> Chat
            </button>
            <button
              onClick={() => setTab('leads')}
              className={`flex items-center gap-1.5 rounded-t-xl border-b-2 px-3 py-2 text-xs font-bold tracking-[0.08em] transition ${tab === 'leads' ? 'border-[#D33616] bg-[#FFF3EF] text-[#D33616]' : 'border-transparent text-[#8E7D7A] hover:text-[#690A01]'}`}
            >
              <Icon name="doc" size={13} /> Leads
              {leads.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D33616] px-1 text-[9px] font-bold text-white">{leads.length}</span>
              )}
            </button>
          </div>
{tab === 'chat' ? (
            <>
              <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
                <div className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#C4B4AD]">Today</div>
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
                    style={{ animation: 'msgIn 0.3s ease both' }}
                  >
                    {m.from === 'bot' && (
                      <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white">
                        <Icon name="spark" size={12} />
                      </span>
                    )}
                    <div
                      className={`max-w-[78%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                        m.from === 'user'
                          ? 'rounded-br-md bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white'
                          : 'rounded-bl-md border border-[#F0DDCF] bg-[#FFF6F1] text-[#403E45]'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white">
                      <Icon name="spark" size={12} />
                    </span>
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[#F0DDCF] bg-[#FFF6F1] px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-[#D33616]"
                          style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.18}s infinite` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                  {chips.map((ch) => (
                    <button
                      key={ch}
                      onClick={() => handleSend(ch)}
                      className="rounded-full border border-[#D33616]/25 bg-[#FFF3EF] px-3 py-1.5 text-xs font-semibold text-[#690A01] transition hover:-translate-y-0.5 hover:bg-[#FDE5DC] hover:shadow-[0_8px_18px_rgba(211,54,22,0.18)]"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}
<form
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 border-t border-[#F0DDCF] bg-[#FFF9F6] p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={phase === 'name' ? 'Type your name…' : 'Type your message…'}
                  className="w-full flex-1 rounded-full border border-[#F0DDCF] bg-white/90 px-4 py-2.5 text-sm text-[#1C1B1F] outline-none transition focus:border-[#D33616]/50 focus:ring-2 focus:ring-[#D33616]/10"
                />
                <button
                  type="submit"
                  disabled={typing || !input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D33616] to-[#B5210A] text-white shadow-[0_10px_22px_rgba(211,54,22,0.3)] transition hover:scale-105 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Icon name="send" size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="chat-scroll flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#690A01]">Customer leads ({leads.length})</p>
                {leads.length > 0 && (
                  <button onClick={clearLeads} className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:underline">
                    <Icon name="trash" size={12} /> Clear
                  </button>
                )}
              </div>
              {leads.length === 0 ? (
                <div className="mt-16 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDF0EC] text-[#D33616]">
                    <Icon name="user" size={24} />
                  </div>
                  <p className="text-sm font-semibold text-[#403E45]">No leads captured yet</p>
                  <p className="mt-1 text-xs text-[#8E7D7A]">When a customer chats and shares details, they'll appear here.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leads.map((l) => (
                    <div key={l.id} className="rounded-2xl border border-[#F0DDCF] bg-[#FFF9F6] p-3.5" style={{ animation: 'msgIn 0.3s ease both' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#690A01]">{l.name || '—'}</p>
                        <span className="text-[10px] text-[#B39A92]">{new Date(l.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="mt-1.5 space-y-1 text-xs text-[#6E6D7A]">
                        {l.phone && <p className="flex items-center gap-1.5"><Icon name="phone" size={11} /> {l.phone}</p>}
                        {l.email && <p className="flex items-center gap-1.5"><Icon name="mail" size={11} /> {l.email}</p>}
                        {l.interest && <p className="flex items-center gap-1.5"><Icon name="spark" size={11} /> {l.interest}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}