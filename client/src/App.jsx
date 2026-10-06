import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';

const ChatBot = lazy(() => import('./components/ChatBot.jsx'));
const GlobalDental3DCanvas = lazy(() => import('./components/3d/GlobalDental3DCanvas.jsx'));

// Catches a render crash inside one subtree so a single bad section can never
// blank the whole page (and kill every button with it). Logs once, shows a
// quiet fallback, keeps the rest of the site interactive.
class SectionBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error(`[SectionBoundary:${this.props.name || 'section'}]`, error);
  }

  render() {
    if (this.state.crashed) return this.props.fallback || null;
    return this.props.children;
  }
}

function DeferredDentalBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const connection = navigator.connection;
    const lowEndDevice = navigator.deviceMemory <= 4 || navigator.hardwareConcurrency <= 4;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || window.matchMedia('(max-width: 767px)').matches
      || connection?.saveData
      || lowEndDevice
    ) return undefined;

    const timer = window.setTimeout(() => setEnabled(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <GlobalDental3DCanvas />
    </Suspense>
  );
}

export default function App() {
  return (
    <div className="luxury-app-shell">
      <SectionBoundary name="background">
        <DeferredDentalBackground />
      </SectionBoundary>
      <SectionBoundary name="chatbot">
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </SectionBoundary>
      <div className="page-shell">
        <SectionBoundary name="page">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </SectionBoundary>
      </div>
    </div>
  );
}
