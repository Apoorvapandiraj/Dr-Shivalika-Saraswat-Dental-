import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardLayout from './pages/DashboardLayout.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import ModerationPage from './pages/ModerationPage.jsx';
import ContentPage from './pages/ContentPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import LuxuryBackground from './components/LuxuryBackground.jsx';

const RequireAuth = ({ children }) => {
  return localStorage.getItem('accessToken') ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FBF9F8] text-[#1C1B1F]">
      <LuxuryBackground />
      <div className="relative z-10">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="leads" element={<LeadsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
