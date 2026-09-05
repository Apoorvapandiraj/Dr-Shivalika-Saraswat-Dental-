import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';

const TABS = ['Reviews', 'Testimonials'];

export default function ModerationPage() {
  const [tab, setTab] = useState('Reviews');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'Reviews') {
        const { data } = await api.get('/reviews/pending');
        setItems(data.data);
      } else {
        const { data } = await api.get('/reviews/testimonials/pending');
        setItems(data.data);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, action) => {
    try {
      await api.put(`/reviews/${tab === 'Reviews' ? '' : 'testimonials/'}${id}/${action}`);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <span className="admin-pill">Moderation</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-[#690A01]">Content Review</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-[#D33616] text-white shadow-[0_10px_20px_rgba(211,54,22,0.18)]' : 'bg-white/70 border border-[#E9D7CF] text-[#5f5a62]'}`}>{t}</button>
        ))}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-[#6E6D7A]">Loading…</p>}

      {!loading && !items.length && <p className="text-[#6E6D7A]">Nothing pending in {tab.toLowerCase()} 🎉</p>}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item._id} className="admin-card p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-[#690A01]">{item.title || `${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}`}</h3>
                <p className="text-xs text-[#6E6D7A]">
                  {item.patientName} · {item.treatment || 'Review'} · {new Date(item.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="space-x-2">
                <button onClick={() => moderate(item._id, 'approve')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">Approve</button>
                <button onClick={() => moderate(item._id, 'reject')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">Reject</button>
              </div>
            </div>
            <p className="text-[#403E45] mt-3">{item.comment || item.description}</p>
            {item.videoFile?.url && (
              <video
                src={`${item.videoFile.url.startsWith('http') ? '' : window.location.origin}${item.videoFile.url}`}
                controls
                playsInline
                className="mt-3 rounded-lg w-full max-h-72 bg-black"
              />
            )}
            {item.videoFile?.url && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">🎬 Video Reel</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
