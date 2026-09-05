import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ParticleWave — lightweight GPU-style animated background.
 * A flat grid of glowing particles (single draw call) that undulates like a
 * wave and ripples toward the cursor. Locked overhead is low: ~2.5k points,
 * color palette in cyan/blue (#00F5D4 / #0A84FF / #4FACFE).
 *
 * The container is pointer-events-none, so CTAs/forms stay fully clickable.
 */
const GRID = 50;
const SPACING = 0.24;

const COLORS = ['#00F5D4', '#0A84FF', '#4FACFE', '#38BDF8'];

function WaveField() {
  const ref = useRef(null);
  const { pointer } = useThree();

  const positions = useMemo(() => {
    const arr = new Float32Array(GRID * GRID * 3);
    let i = 0;
    for (let x = 0; x < GRID; x++) {
      for (let z = 0; z < GRID; z++) {
        arr[i++] = (x - GRID / 2) * SPACING;
        arr[i++] = 0;
        arr[i++] = (z - GRID / 2) * SPACING;
      }
    }
    return arr;
  }, []);

  const colors = useMemo(() => {
    const arr = new Float32Array(GRID * GRID * 3);
    for (let i = 0; i < GRID * GRID; i++) {
      const c = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const geo = ref.current.geometry;
    const pos = geo.attributes.position;
    const t = state.clock.elapsedTime;

    // Cursor position mapped to world space (~±6 units)
    const px = pointer.x * 6;
    const pz = pointer.y * 6;

    for (let idx = 0; idx < GRID * GRID; idx++) {
      const x = pos.array[idx * 3];
      const z = pos.array[idx * 3 + 2];

      // Persistent wave
      let y =
        Math.sin(x * 0.55 + t * 0.9) * Math.cos(z * 0.55 + t * 0.7) * 0.45 +
        Math.sin(x * 1.4 - t * 0.5) * 0.12;

      // Cursor ripple (gaussian bump that decays with distance)
      const dx = x - px;
      const dz = z - pz;
      const d = Math.sqrt(dx * dx + dz * dz);
      y += Math.exp(-d * d / 6) * Math.sin(t * 2.5) * 0.5;

      pos.array[idx * 3 + 1] = y;
    }
    pos.needsUpdate = true;
    ref.current.geometry.computeVertexNormals?.();
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function useWebGL() {
  return useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
    } catch {
      return false;
    }
  }, []);
}

export default function ParticleWave() {
  const hasWebGL = useWebGL();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {hasWebGL ? (
        <Canvas
          camera={{ position: [0, 5.4, 9], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <WaveField />
        </Canvas>
      ) : (
        /* Non-WebGL CSS fallback — animated aurora blobs */
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full bg-[#0A84FF]/15 blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[22rem] h-[22rem] rounded-full bg-[#00F5D4]/10 blur-[90px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
      )}

      {/* Readability mask — fades canvas at edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#050811_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050811] to-transparent" />
    </div>
  );
}