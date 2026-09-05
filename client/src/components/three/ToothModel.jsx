import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Procedural 3D tooth — anatomical layers with toggleable visibility.
 * Layers: Enamel (outer crown), Dentin (inner), Pulp (core), Titanium Post (implant).
 * Hotspots rotate the model to a preset orientation when clicked.
 */

const HOTSPOTS = [
  { id: 'implant', label: 'Dental Implant', rotation: [0.35, 0.5, 0], position: [0.9, -1.15, 0.55], layer: 'post' },
  { id: 'veneer', label: 'Porcelain Veneer', rotation: [0.15, -0.45, 0], position: [-0.75, 0.75, 0.65], layer: 'enamel' },
  { id: 'rootcanal', label: 'Root Canal Therapy', rotation: [0.5, 0.9, 0], position: [0, -0.35, 0.85], layer: 'pulp' },
  { id: 'aligner', label: 'Invisible Aligners', rotation: [0.1, 0.1, 0], position: [0, 1.35, 0.5], layer: 'enamel' },
];

function Crown({ layers }) {
  // Crown: slightly squashed sphere — enamel shell + dentin core + pulp chamber
  return (
    <group position={[0, 0.55, 0]}>
      {/* Enamel */}
      {layers.enamel && (
        <mesh castShadow>
          <sphereGeometry args={[1, 48, 48]} />
          <meshPhysicalMaterial
            color="#f8f6f0"
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.25}
            thickness={0.6}
            ior={1.6}
          />
        </mesh>
      )}
      {/* Dentin */}
      {layers.dentin && (
        <mesh scale={[0.72, 0.78, 0.72]}>
          <sphereGeometry args={[1, 40, 40]} />
          <meshStandardMaterial color="#e8d9b8" roughness={0.55} />
        </mesh>
      )}
      {/* Pulp chamber */}
      {layers.pulp && (
        <mesh scale={[0.3, 0.34, 0.3]} position={[0, -0.1, 0]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color="#e0445c" emissive="#a01a30" emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

function Roots({ layers }) {
  const rootMat = <meshStandardMaterial color="#f0ead9" roughness={0.5} />;
  return (
    <group position={[0, -0.35, 0]}>
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, -0.5, 0]} rotation={[0, 0, x > 0 ? 0.12 : -0.12]}>
          <cylinderGeometry args={[0.16, 0.05, 1.5, 20]} />
          {layers.dentin ? rootMat : <meshStandardMaterial color="#e8d9b8" roughness={0.5} />}
        </mesh>
      ))}
      {/* Root canal (pulp canal) */}
      {layers.pulp && [-0.32, 0.32].map((x, i) => (
        <mesh key={`c${i}`} position={[x, -0.5, 0]} rotation={[0, 0, x > 0 ? 0.12 : -0.12]}>
          <cylinderGeometry args={[0.055, 0.02, 1.4, 12]} />
          <meshStandardMaterial color="#e0445c" emissive="#a01a30" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Titanium post (implant replaces one root visually) */}
      {layers.post && (
        <group position={[-0.32, -0.55, 0]} rotation={[0, 0, -0.12]}>
          <mesh>
            <cylinderGeometry args={[0.19, 0.13, 1.5, 24]} />
            <meshStandardMaterial color="#9ba3ad" metalness={0.95} roughness={0.25} />
          </mesh>
          {/* Thread rings */}
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[0, -0.55 + i * 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.19 - i * 0.008, 0.02, 10, 24]} />
              <meshStandardMaterial color="#8b939e" metalness={0.95} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export { HOTSPOTS };

export default function ToothModel({ layers, activeHotspot, onHotspotClick }) {
  const group = useRef();
  const targetRotation = useRef([0.2, 0, 0]);
  const hotspot = HOTSPOTS.find((h) => h.id === activeHotspot);

  // When a hotspot is active, ease toward its preset rotation
  useFrame((state, delta) => {
    if (!group.current) return;
    if (hotspot) targetRotation.current = hotspot.rotation;
    // Mouse parallax layered on top when no hotspot is active
    const parallax = hotspot
      ? [0, 0]
      : [state.pointer.y * 0.15, state.pointer.x * 0.3];
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotation.current[0] + parallax[0], 3, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotation.current[1] + parallax[1], 3, delta);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06; // gentle float
  });

  return (
    <group ref={group}>
      <Crown layers={layers} />
      <Roots layers={layers} />

      {/* Procedure hotspots */}
      {HOTSPOTS.map((h) => (
        <group key={h.id} position={h.position}>
          <Html center distanceFactor={8} zIndexRange={[10, 0]}>
            <button
              onClick={() => onHotspotClick(h.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold border backdrop-blur-md transition-all ${
                activeHotspot === h.id
                  ? 'bg-neon-cyan/90 text-obsidian-950 border-neon-cyan shadow-[0_0_15px_rgba(0,245,212,0.6)]'
                  : 'bg-obsidian-900/70 text-neon-cyan border-neon-cyan/40 hover:bg-obsidian-900'
              }`}
            >
              {h.label}
            </button>
          </Html>
          {/* Pulsing dot */}
          <HotspotDot active={activeHotspot === h.id} />
        </group>
      ))}
    </group>
  );
}

function HotspotDot({ active }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.25;
      ref.current.scale.setScalar(active ? s * 1.4 : s * 0.7);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshBasicMaterial color={active ? '#00F5D4' : '#4FACFE'} transparent opacity={0.9} />
    </mesh>
  );
}
