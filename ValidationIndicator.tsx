import { useRef } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C } from './theme';
import type { V3 } from '../types';

const GOLD = new THREE.Color(C.gold);
const GREEN = new THREE.Color(C.green);
const CHECK: V3[] = [[-0.45, 0, 0], [-0.12, -0.35, 0], [0.5, 0.38, 0]];

// "Testing" (muted gold, orbiting dot) fades to "Validated" (green check). Loops slowly; no flashing.
export function ValidationIndicator({ position, size = 0.3, delay = 1, cycle = 9, animate = true, force }: {
  position: V3; size?: number; delay?: number; cycle?: number; animate?: boolean; force?: 'testing' | 'validated' | null;
}) {
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const check = useRef<THREE.Group>(null);
  const dot = useRef<THREE.Mesh>(null);
  const v = useRef(animate ? 0 : 1);

  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime;
    const target = force ? (force === 'validated' ? 1 : 0) : animate ? ((t % cycle) > delay ? 1 : 0) : 1;
    v.current = animate || force ? THREE.MathUtils.damp(v.current, target, 3, d) : target;
    ring.current?.color.copy(GOLD).lerp(GREEN, v.current);
    check.current?.scale.setScalar(Math.max(0.001, v.current) * size * 0.7);
    if (dot.current) {
      dot.current.visible = v.current < 0.5;
      const a = animate ? t * 1.6 : 0;
      dot.current.position.set(Math.cos(a) * size, Math.sin(a) * size, 0.02);
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[size * 0.92, 32]} />
        <meshBasicMaterial color={C.panel} transparent opacity={0.85} />
      </mesh>
      <mesh>
        <torusGeometry args={[size, 0.025, 8, 48]} />
        <meshBasicMaterial ref={ring} color={C.gold} toneMapped={false} />
      </mesh>
      <group ref={check} scale={0.001}>
        <Line points={CHECK} color={C.green} lineWidth={3} />
      </group>
      <mesh ref={dot}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={C.gold} toneMapped={false} />
      </mesh>
    </group>
  );
}
