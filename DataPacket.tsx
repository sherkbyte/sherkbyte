import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { C } from './theme';

// Small packet that travels along a curve. Hidden entirely when motion is reduced.
export function DataPacket({ curve, speed = 0.1, offset = 0, color = C.cyan, size = 0.06, animate = true }: {
  curve: THREE.Curve<THREE.Vector3>; speed?: number; offset?: number; color?: string; size?: number; animate?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !animate) return;
    const t = (clock.elapsedTime * speed + offset) % 1;
    ref.current.position.copy(curve.getPoint(t));
    const edge = Math.min(t, 1 - t) * 8; // soft fade in/out, no flashing
    ref.current.scale.setScalar(Math.min(1, edge));
  });
  if (!animate) return null;
  return (
    <mesh ref={ref} scale={0}>
      <boxGeometry args={[size * 1.6, size, size]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

export function Packets({ curve, count, speed, color, animate }: {
  curve: THREE.Curve<THREE.Vector3>; count: number; speed?: number; color?: string; animate: boolean;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <DataPacket key={i} curve={curve} speed={speed} offset={i / count} color={color} animate={animate} />
      ))}
    </>
  );
}
