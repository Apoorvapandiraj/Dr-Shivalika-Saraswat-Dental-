import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Sparkles, ContactShadows } from '@react-three/drei';
import ToothModel, { HOTSPOTS } from './ToothModel.jsx';

/** WebGL capability check — graceful CSS fallback for unsupported devices */
export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

const LAYER_DEFS = [
  { id: 'enamel', label: 'Enamel' },
  { id: 'dentin', label: 'Dentin' },
  { id: 'pulp', label: 'Pulp' },
  { id: 'post', label: 'Titanium Post' },
];

export default function ToothScene() {
  const [webgl] = useState(supportsWebGL);
  const [layers, setLayers] = useState({ enamel: true, dentin: true, pulp: false, post: false });
  const [activeHotspot, setActiveHotspot] = useState(null);

  const toggleLayer = (id) => setLayers((l) => ({ ...l, [id]: !l[id] }));
  const clickHotspot = (id) => {
    setActiveHotspot((cur) => {
      const next = cur === id ? null : id;
      if (next) {
        const h = HOTSPOTS.find((x) => x.id === next);
        // Auto-reveal the anatomically relevant layer
        if (h?.layer) setLayers((l) => ({ ...l, [h.layer]: true }));
      }
      return next;
    });
  };

  if (!webgl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="glass p-10 text-center max-w-sm">
          <div className="text-6xl mb-4">🦷</div>
          <p className="text-slate-300">Your device doesn't support 3D viewing.</p>
          <p className="text-slate-500 text-sm mt-2">Explore our treatments below instead.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.4, 5.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} color="#ffffff" />
          <directionalLight position={[-5, -2, -4]} intensity={0.5} color="#4FACFE" />
          <pointLight position={[0, -3, 2]} intensity={0.6} color="#00F5D4" />

          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
            <ToothModel layers={layers} activeHotspot={activeHotspot} onHotspotClick={clickHotspot} />
          </Float>

          {/* Particle glow aura */}
          <Sparkles count={90} scale={[7, 6, 5]} size={2.2} speed={0.35} color="#00F2FE" opacity={0.55} />
          <Sparkles count={40} scale={[6, 5, 4]} size={3.5} speed={0.2} color="#D4AF37" opacity={0.3} />

          <ContactShadows position={[0, -2.4, 0]} opacity={0.35} scale={9} blur={2.6} far={4} color="#001a4d" />
        </Suspense>
      </Canvas>

      {/* Layer toggle chips */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2">
        {LAYER_DEFS.map((l) => (
          <button
            key={l.id}
            onClick={() => toggleLayer(l.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
              layers[l.id]
                ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/60'
                : 'bg-obsidian-900/60 text-slate-400 border-white/10 hover:border-white/30'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
