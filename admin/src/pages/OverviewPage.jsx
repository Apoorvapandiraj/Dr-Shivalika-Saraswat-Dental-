import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api.js';

const STATUS_LABELS = {
  totalBookings: 'Total Bookings',
  pendingBookings: 'Pending',
  completedBookings: 'Completed',
  cancelledBookings: 'Cancelled',
  pendingReviews: 'Pending Reviews',
  totalPatients: 'Patients',
};

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/profile/analytics').then(({ data }) => setStats(data.data)).catch((e) => setError(e.response?.data?.message || 'Failed to load analytics'));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p className="text-slate-500">Loading analytics…</p>;

  const chartData = Object.entries(STATUS_LABELS).map(([key, label]) => ({ name: label, value: stats[key] || 0 }));

  return (
    <div>
      <div className="mb-6">
        <span className="admin-pill">Overview</span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.06em] text-[#690A01]">Clinic Performance</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="admin-card p-5">
          <p className="text-sm text-[#6E6D7A]">Monthly Revenue</p>
          <p className="text-3xl font-bold text-[#1A7A54] mt-1">₹{stats.monthlyRevenue?.toLocaleString('en-IN')}</p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm text-[#6E6D7A]">Total Bookings</p>
          <p className="text-3xl font-bold text-[#D33616] mt-1">{stats.totalBookings}</p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm text-[#6E6D7A]">Pending Reviews</p>
          <p className="text-3xl font-bold text-[#C98A3A] mt-1">{stats.pendingReviews}</p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm text-[#6E6D7A]">Patients</p>
          <p className="text-3xl font-bold text-[#690A01] mt-1">{stats.totalPatients}</p>
        </div>
      </div>

      <div className="admin-card p-6" style={{ height: 360 }}>
        <h2 className="font-semibold mb-4 text-[#690A01]">Platform Activity</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#D33616" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
