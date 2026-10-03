import { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneProps } from './types';
import { C } from './three/theme';
import { SceneLights, TopologyGrid, makeCurve, Label } from './three/helpers';
import { ServerRack } from './three/ServerRack';
import { CloudNode } from './three/CloudNode';
import { NetworkConnection } from './three/NetworkConnection';
import { Packets } from './three/DataPacket';

// Editable labels. Text only; no official AWS or Google Cloud logos.
const LABELS = { aws: 'AWS', gcp: 'Google Cloud', onprem: 'On-premises' };

export default function CloudScene({ animate, lite }: SceneProps) {
  const link = useMemo(() => makeCurve([[-1.9, 0.2, 0], [-1.4, 1.0, 0], [-0.7, 1.4, 0], [-0.1, 1.5, 0]]), []);
  const cloudLink = useMemo(() => makeCurve([[0.5, 1.4, 0], [1.2, 1.2, -0.2], [1.9, 0.9, -0.5]]), []);
  const gateQ = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), link.getTangent(0.5)), [link]);
  const gateP = useMemo(() => link.getPoint(0.5), [link]);

  return (
    <>
      <SceneLights />
      <TopologyGrid y={-1.8} />
      <ServerRack units={4} position={[-2.2, -0.9, 0]} scale={0.85} animate={animate} />
      <Label position={[-2.2, -2.0, 0]} text={LABELS.onprem} />
      <CloudNode position={[0.2, 1.5, 0]} scale={1.15} label={LABELS.aws} animate={animate} />
      <CloudNode position={[2.2, 0.8, -0.5]} scale={0.9} label={LABELS.gcp} animate={animate} />

      <NetworkConnection curve={link} glow color={C.cyan} opacity={0.9} width={1.6} />
      <NetworkConnection curve={cloudLink} color={C.blue} opacity={0.6} />
      <mesh position={gateP} quaternion={gateQ}>
        <torusGeometry args={[0.28, 0.02, 8, 40]} />
        <meshBasicMaterial color={C.green} toneMapped={false} />
      </mesh>
      <Packets curve={link} count={lite ? 2 : 4} speed={0.1} animate={animate} />
      <Packets curve={cloudLink} count={2} speed={0.08} color={C.blue} animate={animate} />
    </>
  );
}
