import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { C } from './theme';
import type { V3 } from '../types';

export const makeCurve = (pts: V3[]) =>
  new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.4);

export function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 6]} intensity={0.9} color="#9cc3ff" />
      <pointLight position={[-4, 1, 3]} intensity={18} distance={14} color={C.blue} />
      <pointLight position={[4, 2, 2]} intensity={10} distance={12} color={C.cyan} />
    </>
  );
}

export function TopologyGrid({ y = -2.6 }: { y?: number }) {
  const ref = useRef<THREE.GridHelper>(null);
  useEffect(() => {
    const m = ref.current?.material as THREE.LineBasicMaterial | undefined;
    if (m) { m.transparent = true; m.opacity = 0.35; }
  }, []);
  return <gridHelper ref={ref} args={[44, 44, C.edge, C.dim]} position={[0, y, -2]} />;
}

export function Tag({ children, hot = false }: { children: React.ReactNode; hot?: boolean }) {
  return <span className={hot ? 'sb-tag sb-tag-hot' : 'sb-tag'}>{children}</span>;
}

export function Label({ position, text }: { position: V3; text: string }) {
  return (
    <Html center position={position} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
      <Tag>{text}</Tag>
    </Html>
  );
}

export function useStaticMemo<T>(f: () => T): T { // eslint-disable-line
  return useMemo(f, []); // eslint-disable-line react-hooks/exhaustive-deps
}
