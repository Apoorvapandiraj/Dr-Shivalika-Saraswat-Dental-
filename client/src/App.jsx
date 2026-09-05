import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import GlobalDental3DCanvas from './components/3d/GlobalDental3DCanvas.jsx';
import ChatBot from './components/ChatBot.jsx';

export default function App() {
  return (
    <div className="luxury-app-shell">
      <GlobalDental3DCanvas />
      <ChatBot />
      <div className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
}
