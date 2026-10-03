import { useState, type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import { C } from './theme';
import { Tag } from './helpers';
import type { V3 } from '../types';

// Hover reveals a short label. Labels also exist as normal text elsewhere on the page.
export function Hotspot({ label, position, radius = 1, labelY, children }: {
  label: string; position: V3; radius?: number; labelY?: number; children: ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const set = (v: boolean) => {
    setHover(v);
    document.body.style.cursor = v ? 'pointer' : '';
    window.dispatchEvent(new Event('sb-redraw')); // lets static (reduced-motion) mode repaint
  };
  return (
    <group position={position}
      onPointerOver={(e) => { e.stopPropagation(); set(true); }}
      onPointerOut={() => set(false)}>
      {children}
      <mesh>
        <sphereGeometry args={[radius, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hover && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius * 0.95, 0.012, 8, 64]} />
            <meshBasicMaterial color={C.cyan} transparent opacity={0.6} toneMapped={false} />
          </mesh>
          <Html center position={[0, labelY ?? radius + 0.15, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
            <Tag hot>{label}</Tag>
          </Html>
        </>
      )}
    </group>
  );
}
