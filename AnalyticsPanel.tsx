import { useRef } from 'react';
import { Edges, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { C } from './theme';
import type { V3 } from '../types';

function Bar({ x, h, phase, animate }: { x: number; h: number; phase: number; animate: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current && animate) g.current.scale.y = 1 + 0.08 * Math.sin(clock.elapsedTime * 0.9 + phase);
  });
  return (
    <group ref={g} position={[x, -0.4, 0.04]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.13, h, 0.06]} />
        <meshStandardMaterial color="#1b4fb8" emissive={C.blue} emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
}

export function AnalyticsPanel({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, animate = true, bars = [0.4, 0.7, 0.5, 0.9, 0.65, 1] }: {
  position?: V3; rotation?: V3; scale?: number; animate?: boolean; bars?: number[];
}) {
  const xs = bars.map((_, i) => -0.7 + i * 0.28);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <boxGeometry args={[1.8, 1.1, 0.04]} />
        <meshStandardMaterial color={C.panel} metalness={0.3} roughness={0.5} />
        <Edges color={C.blue} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.55 + i * 0.1, 0.45, 0.03]}>
          <boxGeometry args={[0.07, 0.03, 0.01]} />
          <meshBasicMaterial color={C.cyan} />
        </mesh>
      ))}
      {bars.map((b, i) => <Bar key={i} x={xs[i]} h={b * 0.6} phase={i} animate={animate} />)}
      <Line points={bars.map((b, i) => [xs[i], -0.3 + b * 0.62, 0.1] as V3)} color={C.green} lineWidth={2} />
    </group>
  );
}
