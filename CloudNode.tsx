import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { C } from './theme';
import { Label } from './helpers';
import type { V3 } from '../types';

const PUFFS: [number, number, number, number][] = [
  [0, 0.05, 0, 0.5], [-0.5, -0.12, 0, 0.34], [0.52, -0.1, 0, 0.36], [0.12, 0.3, 0, 0.34]
];

export function CloudNode({ position = [0, 0, 0], scale = 1, label, color = C.blue, animate = true }: {
  position?: V3; scale?: number; label?: string; color?: string; animate?: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current && animate) g.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.6 + position[0]) * 0.06;
  });
  return (
    <group ref={g} position={position} scale={scale}>
      {PUFFS.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1, 0.85, 0.8]}>
          <sphereGeometry args={[r, 20, 14]} />
          <meshStandardMaterial color="#12386b" emissive={color} emissiveIntensity={0.28} transparent opacity={0.62} roughness={0.35} />
        </mesh>
      ))}
      {label && <Label position={[0, -0.6, 0]} text={label} />}
    </group>
  );
}
