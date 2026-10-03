import { useMemo } from 'react';
import { Edges, Line } from '@react-three/drei';
import type { SceneProps, V3 } from './types';
import { C } from './three/theme';
import { SceneLights, makeCurve, Label } from './three/helpers';
import { AIWorkflowNode } from './three/AIWorkflowNode';
import { NetworkConnection } from './three/NetworkConnection';
import { Packets } from './three/DataPacket';

const NODES: V3[] = [[-1.2, 0.45, 0], [-0.2, -0.4, 0], [0.8, 0.4, 0], [1.6, -0.2, 0]];

export default function AIIntegrationScene({ animate, lite }: SceneProps) {
  const pipe = useMemo(() => makeCurve([[-2.4, 0, 0], ...NODES, [2.5, 0, 0]]), []);
  const nodes = lite ? NODES.slice(0, 3) : NODES;
  return (
    <>
      <SceneLights />
      <mesh position={[-2.8, 0, 0]}>
        <boxGeometry args={[0.9, 0.6, 0.05]} />
        <meshStandardMaterial color={C.panel} />
        <Edges color={C.cyan} />
      </mesh>
      {[0.15, 0, -0.15].map((y, i) => (
        <mesh key={i} position={[-2.9 + i * 0.03, y, 0.04]}>
          <boxGeometry args={[0.55 - i * 0.1, 0.05, 0.01]} />
          <meshBasicMaterial color={C.cyan} />
        </mesh>
      ))}
      <Label position={[-2.8, -0.55, 0]} text="Prompt" />

      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[3.5, 1.9, 1]} />
        <meshBasicMaterial color={C.blue} transparent opacity={0.04} depthWrite={false} />
        <Edges color={C.edge} />
      </mesh>
      <Label position={[0.2, 1.1, 0]} text="Secure pipeline" />

      <NetworkConnection curve={pipe} glow color={C.cyan} opacity={0.8} />
      {nodes.map((p, i) => <AIWorkflowNode key={i} position={p} animate={animate} />)}
      {nodes.slice(1).map((p, i) => <Line key={i} points={[nodes[i], p]} color={C.blue} lineWidth={1} transparent opacity={0.5} />)}
      <Packets curve={pipe} count={lite ? 3 : 6} speed={0.09} animate={animate} />

      <mesh position={[2.9, 0, 0]}>
        <boxGeometry args={[0.9, 0.6, 0.05]} />
        <meshStandardMaterial color={C.panel} />
        <Edges color={C.green} />
      </mesh>
      <Line points={[[2.65, 0, 0.05], [2.85, -0.12, 0.05], [3.15, 0.14, 0.05]] as V3[]} color={C.green} lineWidth={3} />
      <Label position={[2.9, -0.55, 0]} text="Output" />
    </>
  );
}
