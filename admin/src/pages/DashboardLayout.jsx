import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import ChatBot from '../components/ChatBot.jsx';
import api from '../services/api.js';

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/bookings', label: 'Bookings' },
  { to: '/moderation', label: 'Moderation' },
  { to: '/content', label: 'Content Studio' },
  { to: '/leads', label: 'Leads' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Best-effort server-side revocation of both tokens
      await api.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') });
    } catch {
      /* clear locally regardless */
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 border-r border-[#F0DDCF] bg-white/70 backdrop-blur-2xl text-[#1C1B1F] flex flex-col shadow-[8px_0_30px_rgba(105,10,1,0.04)]">
        <div className="px-5 py-6 border-b border-[#F0DDCF]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D33616]/10 text-sm font-bold text-[#D33616] shadow-[0_0_30px_rgba(211,54,22,0.12)]">DS</span>
            <div>
              <h1 className="font-extrabold text-xl text-[#690A01]">Dr. Shivalika</h1>
              <p className="text-xs uppercase tracking-[0.14em] text-[#6E6D7A]">Control Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'bg-[#D33616] text-white shadow-[0_12px_25px_rgba(211,54,22,0.18)]' : 'text-[#5f5a62] hover:bg-[#F7F1ED]'}`
              }
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={logout} className="m-3 rounded-2xl border border-[#F0DDCF] bg-[#fffaf8] px-3 py-2.5 text-left text-sm font-medium text-[#690A01] transition hover:bg-[#F7F1ED]">
          Log out
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-x-auto">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      <ChatBot />
    </div>
  );
}
