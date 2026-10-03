import { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import type { SceneProps, V3 } from './types';
import { C } from './three/theme';
import { SceneLights, makeCurve, Label } from './three/helpers';
import { ValidationIndicator } from './three/ValidationIndicator';
import { NetworkConnection } from './three/NetworkConnection';
import { Packets } from './three/DataPacket';

const GRID: { p: V3; name: string }[] = [
  { p: [-1.1, 0.5, 0.05], name: 'Network' }, { p: [0, 0.5, 0.05], name: 'Backup' }, { p: [1.1, 0.5, 0.05], name: 'Access' },
  { p: [1.1, -0.5, 0.05], name: 'Cloud' }, { p: [0, -0.5, 0.05], name: 'Data' }, { p: [-1.1, -0.5, 0.05], name: 'AI' }
];

export default function QualityAssuranceScene({ animate, lite, stage }: SceneProps) {
  const path = useMemo(() => makeCurve(GRID.map((g) => g.p)), []);
  const force = stage === 'Validated' ? 'validated' : stage === 'Testing' ? 'testing' : null;
  return (
    <>
      <SceneLights />
      <mesh>
        <boxGeometry args={[3.7, 2.3, 0.06]} />
        <meshStandardMaterial color={C.panel} metalness={0.3} roughness={0.5} />
        <Edges color={C.blue} />
      </mesh>
      <NetworkConnection curve={path} color={C.blue} opacity={0.55} width={1.2} />
      <Packets curve={path} count={lite ? 2 : 4} speed={0.07} animate={animate} />
      {GRID.map((g, i) => (
        <group key={g.name}>
          <ValidationIndicator position={g.p} size={0.28} delay={1 + i * 1.1} cycle={10} animate={animate} force={force} />
          <Label position={[g.p[0], g.p[1] - 0.45, 0.05]} text={g.name} />
        </group>
      ))}
    </>
  );
}
