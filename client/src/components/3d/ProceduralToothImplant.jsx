import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function ProceduralToothImplant() {
  const group = useRef(null);

  const threads = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        y: -0.72 + i * 0.16,
        radius: 0.16 + (i % 2) * 0.02,
      })),
    []
  );

  useFrame((state) => {
    if (!group.current) return;

    const pointerX = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const pointerY = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    const scrollShift = window.scrollY * 0.00045;

    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointerY * 0.52, 0.05);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointerX * 0.9 + scrollShift, 0.05);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, pointerX * 0.26, 0.05);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 0.35 + pointerX * 0.32, 0.05);
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      0.28 + Math.sin(state.clock.elapsedTime * 1.5) * 0.26 - scrollShift * 0.9,
      0.07
    );
  });

  return (
    <group ref={group} position={[0.45, 0.18, 0]} scale={2.2}>
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.15}>
        <group>
          <mesh position={[0, 1.2, -0.15]} castShadow>
            <sphereGeometry args={[0.98, 72, 72, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
            <meshPhysicalMaterial
              color="#F9F4EE"
              roughness={0.08}
              metalness={0.02}
              clearcoat={1.2}
              clearcoatRoughness={0.05}
              transmission={0.2}
              thickness={0.9}
              envMapIntensity={1.5}
            />
          </mesh>

          <mesh position={[0, 0.6, 0.18]} rotation={[0.22, 0, 0]} castShadow>
            <capsuleGeometry args={[0.7, 0.9, 18, 40]} />
            <meshPhysicalMaterial
              color="#F2E7D6"
              roughness={0.14}
              metalness={0.04}
              clearcoat={1.1}
              transmission={0.18}
              envMapIntensity={1.3}
            />
          </mesh>

          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.58, 0.45, 0.32, 52]} />
            <meshPhysicalMaterial color="#D7C08C" roughness={0.24} metalness={0.14} clearcoat={1} />
          </mesh>

          <mesh position={[0, -0.24, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.38, 0.9, 52]} />
            <meshPhysicalMaterial color="#D4AF37" metalness={0.98} roughness={0.18} envMapIntensity={1.4} />
          </mesh>

          <mesh position={[0, -0.82, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.24, 0.82, 52]} />
            <meshStandardMaterial color="#A2ADB9" metalness={0.98} roughness={0.22} envMapIntensity={1.2} />
          </mesh>

          {threads.map((thread, index) => (
            <mesh
              key={index}
              position={[0, -0.82 + index * 0.17, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <torusGeometry args={[0.18 + (index % 2) * 0.025, 0.045, 18, 58]} />
              <meshStandardMaterial color="#BFCCD8" metalness={0.97} roughness={0.2} envMapIntensity={0.95} />
            </mesh>
          ))}

          <mesh position={[0, -1.6, 0]} castShadow>
            <coneGeometry args={[0.24, 0.5, 36]} />
            <meshStandardMaterial color="#7C8694" metalness={0.97} roughness={0.2} envMapIntensity={0.9} />
          </mesh>

          <mesh position={[0, 0.1, -0.72]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.32, 0.04, 20, 120]} />
            <meshStandardMaterial
              color="#00F2FE"
              emissive="#00F2FE"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>

          <mesh position={[0, 0.1, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.7, 0.03, 16, 120]} />
            <meshStandardMaterial
              color="#9BE7FF"
              emissive="#9BE7FF"
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}