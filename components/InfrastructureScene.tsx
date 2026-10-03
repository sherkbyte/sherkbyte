import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneProps } from './types';
import { C } from './three/theme';
import { SceneLights, makeCurve, Label } from './three/helpers';
import { ServerRack, ServerModule, NetworkSwitch, slotY } from './three/ServerRack';
import { NetworkConnection } from './three/NetworkConnection';
import { Packets } from './three/DataPacket';
import { ValidationIndicator } from './three/ValidationIndicator';

const UNITS = 6;
const SLOT = 3;

export default function InfrastructureScene({ animate, lite, stage }: SceneProps) {
  const mod = useRef<THREE.Group>(null);
  const out = stage === 'Decommission';
  const y = slotY(UNITS, SLOT);
  const cableA = useMemo(() => makeCurve([[1.3, -0.9, 0.45], [1.0, -0.6, 0.9], [0.5, y, 0.6]]), [y]);
  const cableB = useMemo(() => makeCurve([[2.1, -0.9, 0.45], [2.3, -0.3, 0.8], [1.9, 0.3, 0.5]]), []);
  const ledColor = stage === 'Validate' ? C.green : C.cyan;

  useFrame((_, d) => {
    if (!mod.current) return;
    const tz = out ? 3.2 : 0.1;
    mod.current.position.z = animate ? THREE.MathUtils.damp(mod.current.position.z, tz, 2.2, d) : tz;
  });

  return (
    <>
      <SceneLights />
      <group position={[-0.9, 0, 0]} rotation={[0, 0.45, 0]}>
        <ServerRack units={UNITS} emptySlot={SLOT} animate={animate} ledColor={ledColor} />
        <group ref={mod} position={[0, y, animate ? 3.2 : 0.1]}>
          <ServerModule animate={animate} ledColor={ledColor} />
        </group>
        <NetworkSwitch position={[1.7, -0.9, 0.3]} animate={animate} />
        <NetworkConnection curve={cableA} color={stage === 'Configure' ? C.cyan : C.blue} opacity={stage === 'Configure' ? 1 : 0.55} width={stage === 'Configure' ? 2.4 : 1.4} />
        <NetworkConnection curve={cableB} color={C.blue} opacity={0.5} />
        {!lite && <Packets curve={cableA} count={2} speed={0.12} animate={animate && !out} />}
        <ValidationIndicator position={[1.7, 0.1, 0.3]} size={0.22} animate={animate}
          force={stage === 'Validate' ? 'validated' : null} />
        <Label position={[1.7, -1.3, 0.3]} text="Core switch" />
      </group>
    </>
  );
}
