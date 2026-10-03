import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type * as THREE from 'three';
import { C } from './theme';

export function NetworkConnection({ curve, color = C.cyan, opacity = 0.55, width = 1.2, glow = false, segments = 48 }: {
  curve: THREE.Curve<THREE.Vector3>; color?: string; opacity?: number; width?: number; glow?: boolean; segments?: number;
}) {
  const pts = useMemo(() => curve.getPoints(segments), [curve, segments]);
  return (
    <>
      {glow && <Line points={pts} color={color} lineWidth={width * 4} transparent opacity={0.12} />}
      <Line points={pts} color={color} lineWidth={width} transparent opacity={opacity} />
    </>
  );
}
