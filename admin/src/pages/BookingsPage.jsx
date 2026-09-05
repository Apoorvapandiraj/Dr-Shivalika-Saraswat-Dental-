import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-slate-200 text-slate-700',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings', { params: { page, limit: 10, status: status || undefined } });
      setBookings(data.data);
      setPagination(data.pagination);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load bookings');
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, newStatus) => {
    if (!window.confirm(`Set booking status to "${newStatus}"?`)) return;
    try {
      await api.patch(`/bookings/${id}`, { status: newStatus });
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="admin-pill">Bookings</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-[#690A01]">Appointment Queue</h1>
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border border-[#E9D7CF] bg-white/70 text-[#1C1B1F] focus:outline-none">
          <option value="">All statuses</option>
          {Object.keys(STATUS_STYLES).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F1EE] text-[#6E6D7A] text-left">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-t border-[#F5E6E1]">
                <td className="px-4 py-3 font-mono text-xs">{b.bookingReference}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-[#1C1B1F]">{b.patientName}</div>
                  <div className="text-[#6E6D7A] text-xs">{b.patientEmail}</div>
                </td>
                <td className="px-4 py-3">{b.service?.name}</td>
                <td className="px-4 py-3">
                  {new Date(b.appointmentDate).toLocaleDateString('en-IN')} @ {b.timeSlot}
                </td>
                <td className="px-4 py-3">₹{b.service?.price}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status]}`}>{b.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  {b.status === 'pending' && (
                    <button onClick={() => changeStatus(b._id, 'confirmed')} className="text-green-600 hover:underline text-xs">Confirm</button>
                  )}
                  {['pending', 'confirmed'].includes(b.status) && (
                    <>
                      <button onClick={() => changeStatus(b._id, 'completed')} className="text-blue-600 hover:underline text-xs">Complete</button>
                      <button onClick={() => changeStatus(b._id, 'cancelled')} className="text-red-600 hover:underline text-xs">Cancel</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!bookings.length && (
              <tr><td colSpan="7" className="px-4 py-10 text-center text-[#6E6D7A]">No bookings found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 bg-white/70 rounded-lg border border-[#E9D7CF] disabled:opacity-40">← Prev</button>
          <span className="px-3 py-1.5 text-sm text-[#6E6D7A]">Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 bg-white/70 rounded-lg border border-[#E9D7CF] disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
