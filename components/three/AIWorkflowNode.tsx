import { useRef } from 'react';
import { Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { C } from './theme';
import type { V3 } from '../types';

export function AIWorkflowNode({ position, kind = 'process', size = 0.22, animate = true }: {
  position: V3; kind?: 'input' | 'process' | 'output'; size?: number; animate?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current && animate) { ref.current.rotation.y += d * 0.35; ref.current.rotation.x += d * 0.15; }
  });
  const color = kind === 'output' ? C.green : kind === 'input' ? C.cyan : C.blue;
  return (
    <mesh ref={ref} position={position}>
      {kind === 'process' ? <octahedronGeometry args={[size]} /> : <boxGeometry args={[size * 1.4, size * 1.4, size * 1.4]} />}
      <meshStandardMaterial color="#0d2547" emissive={color} emissiveIntensity={0.55} metalness={0.4} roughness={0.35} />
      <Edges color={color} />
    </mesh>
  );
}
