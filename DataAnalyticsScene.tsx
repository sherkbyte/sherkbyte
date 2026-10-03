import { useMemo } from 'react';
import type { SceneProps, V3 } from './types';
import { C } from './three/theme';
import { SceneLights, makeCurve } from './three/helpers';
import { AnalyticsPanel } from './three/AnalyticsPanel';
import { NetworkConnection } from './three/NetworkConnection';
import { Packets } from './three/DataPacket';

export default function DataAnalyticsScene({ animate, lite }: SceneProps) {
  const ys = lite ? [-0.8, 0, 0.8] : [-1.1, -0.65, -0.2, 0.25, 0.7, 1.15];
  const sources = useMemo(() => ys.map((y, i) => ({
    pos: [-2.7, y, (i % 2) * 0.3] as V3,
    rot: [i * 0.4, i * 0.7, 0] as V3,
    curve: makeCurve([[-2.5, y, 0], [-1.6, y * 0.6, 0], [-0.7, y * 0.15, 0], [0.4, 0, 0.1]])
  })), [lite]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SceneLights />
      {sources.map((s, i) => (
        <group key={i}>
          <mesh position={s.pos} rotation={s.rot}>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial color="#35507a" metalness={0.3} roughness={0.6} />
          </mesh>
          <NetworkConnection curve={s.curve} color={C.blue} opacity={0.3} width={0.8} segments={24} />
          <Packets curve={s.curve} count={2} speed={0.1 + (i % 3) * 0.015} color={C.cyan} animate={animate} />
        </group>
      ))}
      <mesh position={[-0.7, 0, 0]}>
        <torusGeometry args={[0.35, 0.02, 8, 40]} />
        <meshBasicMaterial color={C.cyan} toneMapped={false} />
      </mesh>
      <AnalyticsPanel position={[1.7, 0, 0]} scale={1.35} rotation={[0, -0.2, 0]} animate={animate} />
    </>
  );
}
