import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneProps, V3 } from './types';
import { C } from './three/theme';
import { SceneLights, TopologyGrid, makeCurve } from './three/helpers';
import { Hotspot } from './three/Hotspot';
import { ServerRack, NetworkSwitch } from './three/ServerRack';
import { CloudNode } from './three/CloudNode';
import { AnalyticsPanel } from './three/AnalyticsPanel';
import { AIWorkflowNode } from './three/AIWorkflowNode';
import { ValidationIndicator } from './three/ValidationIndicator';
import { NetworkConnection } from './three/NetworkConnection';
import { Packets } from './three/DataPacket';

// Camera waypoints for scroll storytelling: Infrastructure -> Cloud -> Data -> AI -> QA overview
const WP: { p: V3; t: V3 }[] = [
  { p: [-3.4, 0.2, 8.5], t: [-3.5, -0.5, 0] },
  { p: [-1.2, 2.4, 7.5], t: [-1.0, 1.8, -0.5] },
  { p: [1.6, 0.6, 7.0], t: [1.6, 0.2, 0] },
  { p: [3.8, 1.2, 6.5], t: [3.9, 1.1, 0] },
  { p: [0, 0.4, 13.5], t: [0.2, 0.2, 0] }
];
const smooth = (x: number) => x * x * (3 - 2 * x);
const A = new THREE.Vector3();
const B = new THREE.Vector3();

function Rig({ animate, lite, mode, progressRef }: SceneProps) {
  const camera = useThree((s) => s.camera);
  const look = useRef(new THREE.Vector3(0.3, 0.2, 0));
  const wantP = useRef(new THREE.Vector3());
  const wantT = useRef(new THREE.Vector3(0.3, 0.2, 0));

  useFrame(({ pointer }, delta) => {
    if (mode === 'story' && animate) {
      const x = THREE.MathUtils.clamp(progressRef?.current ?? 0, 0, 1) * (WP.length - 1);
      const i = Math.min(Math.floor(x), WP.length - 2);
      const f = smooth(x - i);
      wantP.current.set(...WP[i].p).lerp(A.set(...WP[i + 1].p), f);
      wantT.current.set(...WP[i].t).lerp(B.set(...WP[i + 1].t), f);
    } else {
      const scroll = animate && typeof window !== 'undefined' ? Math.min(window.scrollY / 900, 1) : 0;
      const px = animate ? pointer.x * 0.7 : 0;
      const py = animate ? pointer.y * 0.3 : 0;
      wantP.current.set(px + scroll * 1.6, 0.4 + py + scroll * 0.5, lite ? 14 : 13);
      wantT.current.set(0.3, 0.2, 0);
    }
    const k = animate ? 1 - Math.exp(-delta * 3) : 1;
    camera.position.lerp(wantP.current, k);
    look.current.lerp(wantT.current, k);
    camera.lookAt(look.current);
  });
  return null;
}

export default function HeroScene(props: SceneProps) {
  const { animate, lite } = props;
  const c = useMemo(() => ({
    main: makeCurve([[-3.6, 0.62, 0], [-3.2, 1.5, -0.3], [-1.4, 1.9, -0.6], [0.3, 1.3, -0.3], [1.7, 0.95, 0], [2.8, 1.0, 0], [3.9, 1.2, 0]]),
    net: makeCurve([[-3.0, -1.6, 0.5], [-1.8, -2.0, 0.8], [0.3, -1.8, 0.6], [2.2, -1.5, 0.5], [3.4, -1.4, 0.4]]),
    cloud: makeCurve([[-1.4, 1.9, -0.6], [-0.3, 2.5, -1.1], [0.7, 2.6, -1.6]]),
    qa: makeCurve([[1.7, -0.3, 0], [2.6, -1.0, 0.3], [3.7, -1.4, 0.4]])
  }), []);

  const aiNodes: V3[] = [[-0.5, 0.3, 0], [0.1, 0.6, 0.1], [0.6, 0.1, 0], [0, -0.4, 0.1], [0.7, -0.5, 0]];
  const nodes = lite ? aiNodes.slice(0, 3) : aiNodes;

  return (
    <>
      <Rig {...props} />
      <SceneLights />
      <TopologyGrid />

      <Hotspot label="Infrastructure" position={[-3.6, -0.9, 0]} radius={1.6} labelY={1.9}>
        <ServerRack units={7} animate={animate} />
        {!lite && <NetworkSwitch position={[1.5, -1.05, 0.4]} animate={animate} />}
      </Hotspot>

      <Hotspot label="Cloud" position={[-1.4, 1.9, -0.6]} radius={0.9} labelY={0.8}>
        <CloudNode scale={1.1} animate={animate} />
      </Hotspot>
      {!lite && <CloudNode position={[0.7, 2.6, -1.6]} scale={0.7} animate={animate} />}

      <Hotspot label="Data Analytics" position={[1.7, 0.3, 0]} radius={1.2} labelY={1.0}>
        <AnalyticsPanel rotation={[0, -0.25, 0]} animate={animate} />
      </Hotspot>
      {!lite && <AnalyticsPanel position={[1.0, -1.5, -0.8]} scale={0.55} rotation={[0, -0.25, 0]} animate={animate} bars={[0.8, 0.5, 0.7, 0.4, 0.9, 0.6]} />}

      <Hotspot label="AI Integration" position={[3.9, 1.2, 0]} radius={1.2} labelY={1.1}>
        {nodes.map((p, i) => <AIWorkflowNode key={i} position={p} size={0.14} kind={i === nodes.length - 1 ? 'output' : 'process'} animate={animate} />)}
        {nodes.slice(1).map((p, i) => <Line key={i} points={[nodes[i], p]} color={C.blue} lineWidth={1} transparent opacity={0.6} />)}
      </Hotspot>

      <Hotspot label="Quality Assurance" position={[3.9, -1.4, 0.4]} radius={1.1} labelY={0.9}>
        {[-0.6, 0, 0.6].map((x, i) => <ValidationIndicator key={i} position={[x, 0, 0]} size={0.22} delay={1 + i * 2} animate={animate} />)}
      </Hotspot>

      <NetworkConnection curve={c.main} glow width={1.8} color={C.cyan} opacity={0.9} />
      <NetworkConnection curve={c.net} color={C.blue} opacity={0.45} />
      {!lite && <NetworkConnection curve={c.cloud} color={C.blue} opacity={0.4} />}
      {!lite && <NetworkConnection curve={c.qa} color={C.green} opacity={0.35} />}

      <Packets curve={c.main} count={lite ? 3 : 7} speed={0.08} animate={animate} />
      <Packets curve={c.net} count={lite ? 2 : 3} speed={0.06} color={C.blue} animate={animate} />
      {!lite && <Packets curve={c.qa} count={2} speed={0.07} color={C.green} animate={animate} />}
    </>
  );
}
