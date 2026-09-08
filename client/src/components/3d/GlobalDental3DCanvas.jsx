import React, { Component, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import ProceduralToothImplant from './ProceduralToothImplant.jsx';

/**
 * GlobalDental3DCanvas — persistent, isolated 3D motion background.
 *
 * SAFETY: sits in a fixed inset-0 pointer-events-none -z-10 wrapper,
 * so it never intercepts clicks/touches and never collides with route state,
 * context providers, booking/OTP flows or API layers. Purely additive.
 */

function useWebGL() {
  return useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
      );
    } catch {
      return false;
    }
  }, []);
}

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Swallow silently — the fallback layer below renders instead.
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function GradientFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(1200px 700px at 25% 18%, rgba(10,132,255,0.12) 0%, transparent 62%),' +
          'radial-gradient(1000px 600px at 75% 72%, rgba(0,242,254,0.09) 0%, transparent 52%)',
      }}
    />
  );
}

export default function GlobalDental3DCanvas() {
  const hasWebGL = useWebGL();
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.matchMedia?.('(max-width: 767px)').matches;
  const use3D = hasWebGL && !prefersReducedMotion && !isSmallScreen;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-100"
      aria-hidden="true"
      style={{
        background: 'linear-gradient(180deg, rgba(251,249,248,0.72) 0%, rgba(247,241,237,0.8) 100%)',
        isolation: 'isolate',
      }}
    >
      <div className="absolute left-[8%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-[#D33616]/12 blur-[120px]" />
      <div className="absolute right-[8%] top-[18%] h-[34rem] w-[34rem] rounded-full bg-[#CF8976]/12 blur-[120px]" />
      <div className="absolute left-[22%] bottom-[10%] h-[24rem] w-[24rem] rounded-full bg-[#f3b7a7]/12 blur-[110px]" />
      <div className="absolute right-[12%] bottom-[8%] h-[20rem] w-[20rem] rounded-full bg-[#F7D6CB]/12 blur-[110px]" />

      {use3D ? (
        <CanvasErrorBoundary>
          <Suspense fallback={<GradientFallback />}>
            <Canvas
              camera={{ position: [0.3, 0.4, 9.2], fov: 30 }}
              dpr={[1, 1.25]}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
                failIfMajorPerformanceCaveat: false,
              }}
              shadows
              className="absolute inset-0"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                background: 'transparent',
              }}
            >
              <PerspectiveCamera makeDefault position={[0.2, 0.2, 8.5]} fov={30} />
              <fog attach="fog" args={['#FBF9F8', 8, 20]} />
              <ambientLight intensity={1.8} color="#fff7f2" />
              <hemisphereLight args={['#fffaf5', '#f7efe9', 1.8]} />
              <spotLight position={[0, 5, 7]} angle={0.5} penumbra={0.8} intensity={26} color="#ffffff" castShadow />
              <directionalLight position={[5, 6, 6]} intensity={2.8} color="#fce8de" castShadow />
              <directionalLight position={[-8, 3, -4]} intensity={1.6} color="#ffd6cc" />
              <pointLight position={[5, -2, 2]} intensity={24} color="#D33616" />
              <pointLight position={[-4, 4, -5]} intensity={22} color="#CF8976" />
              <pointLight position={[2, 1, 5]} intensity={18} color="#fffaf5" />

              <group position={[3.2, 0.15, 0]} rotation={[0.18, -0.82, 0]} scale={2.15}>
                <ProceduralToothImplant />
              </group>
              <group position={[-3.6, -1.2, -2.8]} rotation={[0.32, 0.82, -0.22]} scale={1.18}>
                <ProceduralToothImplant />
              </group>
            </Canvas>
          </Suspense>
        </CanvasErrorBoundary>
      ) : (
        <GradientFallback />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F8] via-transparent to-[#FBF9F8]/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(251,249,248,0.98)_100%)]" />
    </div>
  );
}