import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

const STATUSES = ['new', 'contacted', 'converted', 'closed'];
const STATUS_STYLES = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (status = '') => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/leads', { params: status ? { status } : {} });
      setLeads(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filter); }, [filter]);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/admin/leads/${id}`, { status });
      setLeads((prev) => prev.map((l) => l._id === id ? { ...l, status } : l));
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this lead?')) return;
    try {
      await api.delete(`/admin/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l._id !== id));
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="admin-pill">Customer Enquiries</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-[#690A01]">Leads & Chatbot Enquiries</h1>
        <p className="mt-2 text-sm text-[#6E6D7A]">Visitors who chatted with the website assistant and shared their details.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFilter('')} className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${filter === '' ? 'border-[#D33616] bg-[#D33616] text-white' : 'border-[#E9D7CF] bg-white text-[#690A01] hover:border-[#D33616]/40'}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-4 py-1.5 text-xs font-bold capitalize transition ${filter === s ? 'border-[#D33616] bg-[#D33616] text-white' : 'border-[#E9D7CF] bg-white text-[#690A01] hover:border-[#D33616]/40'}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-[#8E7D7A]">Loading leads…</p>
      ) : leads.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <p className="text-lg font-bold text-[#690A01]">No leads yet</p>
          <p className="mt-2 text-sm text-[#8E7D7A]">When a visitor chats on the public website and shares their details, they'll appear here instantly.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((l) => (
            <div key={l._id} className="admin-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-[#690A01]">{l.name}</p>
                  <p className="mt-0.5 text-xs text-[#8E7D7A]">{new Date(l.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[l.status] || STATUS_STYLES.new}`}>{l.status}</span>
              </div>

              <div className="mt-3 space-y-1.5 text-sm text-[#403E45]">
                <p className="flex items-center gap-2"><span className="text-[#D33616]">📱</span> {l.phone}</p>
                <p className="flex items-center gap-2"><span className="text-[#D33616]">✉️</span> {l.email}</p>
                {l.interest && <p className="flex items-center gap-2"><span className="text-[#D33616]">🎯</span> {l.interest}</p>}
                {l.note && <p className="mt-1 rounded-lg bg-[#FFF6F1] px-3 py-2 text-xs text-[#6E6D7A]">“{l.note}”</p>}
                <p className="pt-1 text-[10px] uppercase tracking-wider text-[#B39A92]">Source: {l.source}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <select
                  value={l.status}
                  onChange={(e) => setStatus(l._id, e.target.value)}
                  className="rounded-lg border border-[#E9D7CF] bg-white px-2 py-1.5 text-xs font-semibold text-[#690A01] outline-none"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => remove(l._id)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}