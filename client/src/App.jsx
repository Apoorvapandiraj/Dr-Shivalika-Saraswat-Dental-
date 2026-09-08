import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';

const ChatBot = lazy(() => import('./components/ChatBot.jsx'));
const GlobalDental3DCanvas = lazy(() => import('./components/3d/GlobalDental3DCanvas.jsx'));

export default function App() {
  return (
    <div className="luxury-app-shell">
      <Suspense fallback={null}>
        <GlobalDental3DCanvas />
      </Suspense>
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
      <div className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
}
