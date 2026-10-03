import { useRef } from 'react';
import { Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { C } from './theme';
import type { V3 } from '../types';

export const rackHeight = (units: number) => units * 0.34 + 0.3;
export const slotY = (units: number, i: number) => -rackHeight(units) / 2 + 0.3 + i * 0.34;

export function Led({ position, color, phase = 0, animate = true }: { position: V3; color: string; phase?: number; animate?: boolean }) {
  const m = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (m.current && animate) m.current.opacity = 0.75 + 0.25 * Math.sin(clock.elapsedTime * 1.1 + phase); // slow, never flashing
  });
  return (
    <mesh position={position}>
      <boxGeometry args={[0.05, 0.05, 0.02]} />
      <meshBasicMaterial ref={m} color={color} transparent toneMapped={false} />
    </mesh>
  );
}

export function ServerModule({ position = [0, 0, 0], width = 1.05, ledColor = C.cyan, animate = true, phase = 0 }: {
  position?: V3; width?: number; ledColor?: string; animate?: boolean; phase?: number;
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, 0.26, 0.8]} />
        <meshStandardMaterial color={C.metal} metalness={0.6} roughness={0.4} />
        <Edges color={C.edge} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-width / 2 + 0.14 + i * 0.09, 0, 0.405]}>
          <boxGeometry args={[0.05, 0.13, 0.01]} />
          <meshBasicMaterial color="#06101d" />
        </mesh>
      ))}
      <Led position={[width / 2 - 0.1, 0.04, 0.41]} color={ledColor} phase={phase} animate={animate} />
      <Led position={[width / 2 - 0.18, 0.04, 0.41]} color={C.blue} phase={phase + 1.5} animate={animate} />
    </group>
  );
}

export function ServerRack({ units = 7, emptySlot, animate = true, ledColor = C.cyan, position = [0, 0, 0], scale = 1 }: {
  units?: number; emptySlot?: number; animate?: boolean; ledColor?: string; position?: V3; scale?: number;
}) {
  const h = rackHeight(units);
  return (
    <group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[1.25, h, 0.7]} />
        <meshStandardMaterial color="#081628" metalness={0.5} roughness={0.55} />
        <Edges color={C.blue} />
      </mesh>
      {Array.from({ length: units }).map((_, i) =>
        i === emptySlot ? null : <ServerModule key={i} position={[0, slotY(units, i), 0.1]} animate={animate} ledColor={ledColor} phase={i} />
      )}
    </group>
  );
}

export function NetworkSwitch({ position = [0, 0, 0], animate = true, ledColor = C.green }: { position?: V3; animate?: boolean; ledColor?: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.5, 0.16, 0.6]} />
        <meshStandardMaterial color={C.metal} metalness={0.6} roughness={0.4} />
        <Edges color={C.edge} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i}>
          <mesh position={[-0.6 + i * 0.17, -0.01, 0.305]}>
            <boxGeometry args={[0.1, 0.07, 0.01]} />
            <meshBasicMaterial color="#06101d" />
          </mesh>
          <Led position={[-0.6 + i * 0.17, 0.05, 0.31]} color={ledColor} phase={i * 0.8} animate={animate} />
        </group>
      ))}
    </group>
  );
}
