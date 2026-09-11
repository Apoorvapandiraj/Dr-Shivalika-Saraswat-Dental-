import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

const NET_OPTIONS = {
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200,
  minWidth: 200,
  scale: 1,
  scaleMobile: 0.72,
  color: 0xC98A3A,
  backgroundColor: 0xFBF9F8,
  backgroundAlpha: 0.08,
  points: 9,
  maxDistance: 22,
  spacing: 18,
  showDots: true,
};

function StaticFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(900px 600px at 78% 16%, rgba(201,138,58,0.14), transparent 62%),' +
          'radial-gradient(900px 650px at 16% 72%, rgba(211,54,22,0.1), transparent 58%),' +
          'linear-gradient(180deg, rgba(251,249,248,0.96), rgba(247,241,237,0.96))',
      }}
    />
  );
}

export default function GlobalDental3DCanvas() {
  const containerRef = useRef(null);
  const effectRef = useRef(null);
  const prefersReducedMotion = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const isSmallScreen = useMemo(
    () => window.matchMedia?.('(max-width: 767px)').matches,
    []
  );

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion || isSmallScreen) return undefined;

    effectRef.current = NET({
      ...NET_OPTIONS,
      el: containerRef.current,
      THREE,
    });

    return () => {
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [isSmallScreen, prefersReducedMotion]);

  return (
    <div
      className="global-dental-3d-layer pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(251,249,248,0.92), rgba(247,241,237,0.9))',
          mixBlendMode: 'multiply',
        }}
      />
      {(prefersReducedMotion || isSmallScreen) && <StaticFallback />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F8]/25 via-transparent to-[#FBF9F8]/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(251,249,248,0.24)_100%)]" />
    </div>
  );
}
