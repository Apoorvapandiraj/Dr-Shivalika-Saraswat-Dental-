import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import LuxuryBackground from '../components/LuxuryBackground.jsx';
import ChatBot from '../components/ChatBot.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.data.user.role !== 'admin') {
        setError('This account does not have admin access');
        return;
      }
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-[#E8D4CD] bg-white/80 text-[#1C1B1F] placeholder:text-[#817C83] focus:border-[#D33616] focus:outline-none';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FBF9F8] px-4">
      <LuxuryBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <form onSubmit={submit} className="w-full max-w-md rounded-[1.7rem] border border-white/80 bg-white/72 p-8 shadow-[0_24px_60px_rgba(105,10,1,0.08)] backdrop-blur-xl">
          <div className="mb-6">
            <span className="admin-pill">Admin Access</span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.06em] text-[#690A01]">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-[#6E6D7A]">Dr. Shivalika Healthcare Platform</p>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <label className="block text-sm font-medium text-[#403E45] mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="admin@drshivalika.com" />

          <label className="mt-4 block text-sm font-medium text-[#403E45] mb-1">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />

          <button disabled={busy} className="mt-6 w-full rounded-xl bg-[#D33616] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(211,54,22,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#b52d12] disabled:bg-[#C5AC9F]">
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>

      <ChatBot />
    </div>
  );
}
