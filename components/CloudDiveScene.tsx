import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneProps, V3 } from './types';
import { C } from './three/theme';
import { SceneLights, Tag } from './three/helpers';

/*
  Journey (progress 0..1):
  0.00-0.25  SherkByte cloud mark
  0.25-0.50  dive in: the fold lines are cables (jacket, fiber core, twisted pair)
  0.50-0.70  folds re-route into a network diagram (entry, firewall, switching, exit)
  0.70-1.00  the diagram becomes lanes of traffic
  The SAME cables morph between the three layouts, so it reads as one continuous object.
*/

const LOGO_BLUE = '#1A62AB';
const ROWS = 10;
const smooth = (x: number) => { const t = THREE.MathUtils.clamp(x, 0, 1); return t * t * (3 - 2 * t); };

// Cloud silhouette: union of circles, traced into an outline
const CIRCLES: [number, number, number][] = [
  [-1.75, -0.22, 1.25], [0.27, 0.45, 1.34], [2.0, -0.56, 0.96], [-0.7, -0.6, 0.9], [0.4, -0.7, 0.9], [1.3, -0.7, 0.8]
];
const sdf = (x: number, y: number) => Math.min(...CIRCLES.map(([cx, cy, r]) => Math.hypot(x - cx, y - cy) - r));

function buildOutline(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const N = 140;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const dx = Math.cos(a), dy = Math.sin(a);
    let r = 0;
    while (r < 6 && sdf(dx * r, dy * r) < 0) r += 0.02;
    let lo = Math.max(0, r - 0.02), hi = r;
    for (let k = 0; k < 8; k++) { const mid = (lo + hi) / 2; if (sdf(dx * mid, dy * mid) < 0) lo = mid; else hi = mid; }
    pts.push(new THREE.Vector2(dx * hi, dy * hi));
  }
  return pts;
}

function span(y: number): [number, number] {
  let xl = NaN, xr = NaN;
  for (let x = -4; x <= 4; x += 0.05) if (sdf(x, y) < 0) { if (Number.isNaN(xl)) xl = x; xr = x; }
  return Number.isNaN(xl) ? [-1, 1] : [xl, xr];
}

// Layout 1: brain-like folds inside the cloud
function brainPaths(M: number): THREE.Vector3[][] {
  return Array.from({ length: ROWS }, (_, k) => {
    const y0 = -1.3 + k * (2.6 / (ROWS - 1));
    const [xl, xr] = span(y0);
    const amp = Math.abs(y0) > 1 ? 0.07 : 0.15;
    return Array.from({ length: M + 1 }, (_, i) => {
      const t = i / M;
      return new THREE.Vector3(
        xl + 0.2 + (xr - xl - 0.4) * t,
        y0 + amp * Math.sin(Math.PI * 2 * (1.4 + 0.25 * (k % 4)) * t + k * 1.3) + amp * 0.5 * Math.sin(Math.PI * 8 * t + k * 2),
        0.14 * Math.sin(Math.PI * 4 * t + k)
      );
    });
  });
}

// Layout 2: functional network diagram (entry points -> firewall -> core -> edge -> exit points)
export const NODES: Record<string, [number, number]> = {
  I0: [-4.2, 1], I1: [-4.2, 0], I2: [-4.2, -1], F: [-2.9, 0],
  S0: [-1, 0.9], S1: [-1, -0.9], R0: [1.2, 0.9], R1: [1.2, -0.9],
  E0: [4.2, 1], E1: [4.2, 0], E2: [4.2, -1]
};
const LABELS: Record<string, string> = { I1: 'Entry point', F: 'Firewall', S0: 'Core switch', R1: 'Edge router', E1: 'Exit point' };
const ROUTES = [
  ['I0', 'F', 'S0', 'R0', 'E0'], ['I0', 'F', 'S0', 'R1', 'E1'], ['I1', 'F', 'S0', 'R0', 'E1'], ['I1', 'F', 'S1', 'R1', 'E1'],
  ['I1', 'F', 'S1', 'R0', 'E0'], ['I2', 'F', 'S1', 'R1', 'E2'], ['I2', 'F', 'S1', 'R0', 'E2'], ['I0', 'S0', 'R1', 'E2'],
  ['I2', 'F', 'S1', 'S0', 'R0', 'E0'], ['I0', 'F', 'S0', 'R0', 'R1', 'E2']
];

function diagPaths(M: number): THREE.Vector3[][] {
  return ROUTES.map((r, k) => {
    const j = (k - 4.5) * 0.045;
    const pts: [number, number][] = [];
    r.forEach((n, idx) => {
      const b = NODES[n];
      const end = n[0] === 'I' || n[0] === 'E';
      const p: [number, number] = [b[0], b[1] + (end ? 0 : j)];
      if (idx > 0) { const a = pts[pts.length - 1]; const mx = (a[0] + p[0]) / 2; pts.push([mx, a[1]], [mx, p[1]]); }
      pts.push(p);
    });
    const v = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1e-4);
    const z = ((k % 5) - 2) * 0.03;
    return new THREE.CatmullRomCurve3(v.map((p) => new THREE.Vector3(p[0], p[1], z)), false, 'catmullrom', 0.25).getSpacedPoints(M);
  });
}

// Layout 3: lanes that merge into trunks and fan back out, like traffic on a highway
function trafficPaths(M: number): THREE.Vector3[][] {
  return Array.from({ length: ROWS }, (_, k) => {
    const yb = -1.35 + k * 0.3;
    const trunk = [-0.9, 0, 0.9][Math.min(2, Math.floor((k * 3) / ROWS))];
    return Array.from({ length: M + 1 }, (_, i) => {
      const t = i / M;
      const bump = Math.exp(-(((t - 0.5) / 0.17) ** 2));
      return new THREE.Vector3(-4.4 + 8.8 * t, yb + (trunk - yb) * bump + Math.sin(Math.PI * 4 * t + k) * 0.05 * (1 - bump), 0);
    });
  });
}

function blend(p: number): [number, number, number] {
  if (p < 0.3) return [0, 0, 0];
  if (p < 0.55) return [0, 1, smooth((p - 0.3) / 0.25)];
  if (p < 0.7) return [1, 1, 0];
  if (p < 0.9) return [1, 2, smooth((p - 0.7) / 0.2)];
  return [2, 2, 0];
}

const KEYS: { p: number; pos: V3; t: V3 }[] = [
  { p: 0, pos: [0, 0.3, 10.5], t: [0.2, 0, 0] },
  { p: 0.18, pos: [0, 0.2, 9], t: [0, 0, 0] },
  { p: 0.32, pos: [-0.6, 0.3, 3.4], t: [-0.4, 0.1, 0] },
  { p: 0.5, pos: [0, 0, 9.5], t: [0, 0, 0] },
  { p: 0.7, pos: [0, 0, 9.5], t: [0, 0, 0] },
  { p: 0.9, pos: [0, -4.5, 8.5], t: [0, 0, 0] },
  { p: 1, pos: [0, -4.5, 8.5], t: [0, 0, 0] }
];
const TA = new THREE.Vector3();
const TB = new THREE.Vector3();
function camAt(p: number, pos: THREE.Vector3, tgt: THREE.Vector3) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const f = smooth((p - a.p) / (b.p - a.p));
  pos.set(...a.pos).lerp(TA.set(...b.pos), f);
  tgt.set(...a.t).lerp(TB.set(...b.t), f);
}

function helixGeo(curve: THREE.Curve<THREE.Vector3>, radius: number, phase: number, segs: number) {
  const frames = curve.computeFrenetFrames(segs, false);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const ang = t * 9 * Math.PI * 2 + phase;
    pts.push(curve.getPoint(t).addScaledVector(frames.normals[i], Math.cos(ang) * radius).addScaledVector(frames.binormals[i], Math.sin(ang) * radius));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segs, 0.008, 3, false);
}
const swap = (m: THREE.Mesh, g: THREE.BufferGeometry) => { m.geometry.dispose(); m.geometry = g; };

function NodeMesh({ id }: { id: string }) {
  if (id[0] === 'I' || id[0] === 'E') {
    return (
      <group>
        <mesh><boxGeometry args={[0.3, 0.22, 0.3]} /><meshStandardMaterial color="#0d1f38" metalness={0.4} roughness={0.5} /><Edges color={C.gold} /></mesh>
        <mesh position={[id[0] === 'I' ? 0.17 : -0.17, 0, 0]}><boxGeometry args={[0.04, 0.14, 0.2]} /><meshBasicMaterial color={C.gold} /></mesh>
      </group>
    );
  }
  if (id === 'F') {
    return <mesh><boxGeometry args={[0.1, 0.9, 0.3]} /><meshStandardMaterial color="#0d2547" emissive={C.green} emissiveIntensity={0.25} /><Edges color={C.green} /></mesh>;
  }
  if (id[0] === 'S') {
    return <mesh><boxGeometry args={[0.46, 0.18, 0.3]} /><meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} /><Edges color={C.blue} /></mesh>;
  }
  return <mesh rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.3, 0.3, 0.2]} /><meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} /><Edges color={C.cyan} /></mesh>;
}

export default function CloudDiveScene({ animate, lite, progressRef }: SceneProps) {
  const M = lite ? 28 : 44;
  const camera = useThree((s) => s.camera);

  const data = useMemo(() => {
    const idx = lite ? [0, 2, 3, 5, 7, 9] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const pick = (a: THREE.Vector3[][]) => idx.map((i) => a[i]);
    return { outline: buildOutline(), layouts: [pick(brainPaths(M)), pick(diagPaths(M)), pick(trafficPaths(M))] };
  }, [lite, M]);
  const n = data.layouts[0].length;

  const logo = useMemo(() => {
    const fill = new THREE.ShapeGeometry(new THREE.Shape(data.outline));
    const loop = new THREE.CatmullRomCurve3(data.outline.map((p) => new THREE.Vector3(p.x, p.y, 0)), true);
    const ring = new THREE.TubeGeometry(loop, 160, 0.07, 8, true);
    const arrow = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(2.14, 2.2), new THREE.Vector2(2.45, 1.45), new THREE.Vector2(3.34, 1.14), new THREE.Vector2(1.83, 0.76)
    ]));
    return { fill, ring, arrow };
  }, [data]);

  const mats = useMemo(() => ({
    jacket: new THREE.MeshStandardMaterial({ color: '#2F78D6', emissive: LOGO_BLUE, emissiveIntensity: 0.35, transparent: true, opacity: 0.55, metalness: 0.2, roughness: 0.45 }),
    core: new THREE.MeshBasicMaterial({ color: C.cyan, toneMapped: false }),
    h1: new THREE.MeshBasicMaterial({ color: '#D9822B' }),
    h2: new THREE.MeshBasicMaterial({ color: '#E9EEF5' }),
    fill: new THREE.MeshBasicMaterial({ color: '#EAF3FF', transparent: true, depthWrite: false }),
    ring: new THREE.MeshBasicMaterial({ color: LOGO_BLUE, transparent: true }),
    arrow: new THREE.MeshBasicMaterial({ color: LOGO_BLUE, transparent: true, side: THREE.DoubleSide })
  }), []);
  const cJ1 = useMemo(() => new THREE.Color('#2F78D6'), []);
  const cJ2 = useMemo(() => new THREE.Color('#1B3F73'), []);

  const K = lite ? 50 : 140;
  const pkData = useMemo(() => Array.from({ length: K }, (_, i) => ({
    ci: i % n, spd: 0.05 + (i % 7) * 0.012, off: (i * 0.6180339) % 1, kind: i % 10 === 0 ? 2 : i % 5 === 0 ? 1 : 0
  })), [K, n]);

  const logoGroup = useRef<THREE.Group>(null);
  const nodesRoot = useRef<THREE.Group>(null);
  const pk = useRef<THREE.InstancedMesh>(null);
  const meshes = useRef<THREE.Mesh[][]>([]);
  const curves = useRef<THREE.CatmullRomCurve3[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const look = useRef(new THREE.Vector3());
  const wantP = useRef(new THREE.Vector3());
  const wantT = useRef(new THREE.Vector3());
  const sp = useRef(progressRef?.current ?? 0.6);
  const built = useRef(-1);
  const builtAt = useRef(-1);
  const acc = useRef(0);
  const labelsOn = useRef(false);
  const [labels, setLabels] = useState(false);

  useEffect(() => { window.dispatchEvent(new Event('sb-redraw')); }, [labels]);
  useEffect(() => {
    const m = pk.current;
    if (!m) return;
    const cols = [C.cyan, C.green, C.gold].map((c) => new THREE.Color(c));
    pkData.forEach((d, i) => m.setColorAt(i, cols[d.kind]));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [pkData]);

  const rebuild = (p: number) => {
    const [a, b, f] = blend(p);
    const radius = THREE.MathUtils.lerp(0.05, 0.03, smooth((p - 0.3) / 0.3));
    const helix = !lite && p > 0.2 && p < 0.8;
    data.layouts[0].forEach((_, k) => {
      const A = data.layouts[a][k], B = data.layouts[b][k];
      const pts = f === 0 ? A : A.map((v, i) => new THREE.Vector3().lerpVectors(v, B[i], f));
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      curves.current[k] = curve;
      const ms = meshes.current[k];
      if (!ms || ms.length < 4) return;
      swap(ms[0], new THREE.TubeGeometry(curve, M * 2, radius, 6, false));
      swap(ms[1], new THREE.TubeGeometry(curve, M, radius * 0.28, 4, false));
      ms[2].visible = ms[3].visible = helix;
      if (helix) {
        swap(ms[2], helixGeo(curve, radius * 0.6, 0, M * 2));
        swap(ms[3], helixGeo(curve, radius * 0.6, Math.PI, M * 2));
      }
    });
  };

  useFrame(({ clock }, delta) => {
    const target = progressRef?.current ?? 0.6;
    sp.current = animate ? THREE.MathUtils.damp(sp.current, target, 5, delta) : target;
    const p = sp.current;

    camAt(p, wantP.current, wantT.current);
    const k = animate ? 1 - Math.exp(-delta * 6) : 1;
    camera.position.lerp(wantP.current, k);
    look.current.lerp(wantT.current, k);
    camera.lookAt(look.current);

    const ringO = 1 - smooth((p - 0.14) / 0.18);
    mats.fill.opacity = (1 - smooth((p - 0.06) / 0.14)) * 0.92;
    mats.ring.opacity = ringO;
    mats.arrow.opacity = ringO;
    if (logoGroup.current) logoGroup.current.visible = ringO > 0.01 || mats.fill.opacity > 0.01;

    const now = clock.elapsedTime;
    const first = built.current < 0;
    if (first || (Math.abs(p - built.current) > 0.0015 && (!animate || now - builtAt.current > 0.03))) {
      rebuild(p);
      built.current = p;
      builtAt.current = now;
    }
    mats.jacket.color.copy(cJ1).lerp(cJ2, smooth((p - 0.25) / 0.25));

    const traffic = smooth((p - 0.7) / 0.2);
    const vis = smooth((p - 0.38) / 0.14) * (1 - 0.6 * traffic);
    if (nodesRoot.current) {
      nodesRoot.current.visible = vis > 0.01;
      nodesRoot.current.children.forEach((c) => c.scale.setScalar(Math.max(vis, 0.001)));
    }
    const show = p > 0.5 && p < 0.72;
    if (show !== labelsOn.current) { labelsOn.current = show; setLabels(show); }

    const m = pk.current;
    if (m) {
      if (!animate) m.count = 0;
      else {
        acc.current += delta * (0.7 + 0.9 * traffic);
        const dens = 0.12 + 0.33 * smooth((p - 0.3) / 0.25) + 0.55 * traffic;
        m.count = Math.floor(K * dens);
        for (let i = 0; i < m.count; i++) {
          const d = pkData[i];
          const c = curves.current[d.ci];
          if (!c) continue;
          const t = (acc.current * d.spd * (d.kind === 2 ? 0.55 : 1) + d.off) % 1;
          dummy.position.copy(c.getPoint(t));
          dummy.scale.set(1 + traffic * 0.6, 1, 1);
          dummy.updateMatrix();
          m.setMatrixAt(i, dummy.matrix);
        }
        m.instanceMatrix.needsUpdate = true;
      }
    }
  });

  const setRef = (k: number, j: number) => (m: THREE.Mesh | null) => {
    if (m) { (meshes.current[k] ??= [])[j] = m; }
  };

  return (
    <>
      <SceneLights />
      <group ref={logoGroup} position={[0, 0, -0.05]}>
        <mesh geometry={logo.fill} material={mats.fill} />
        <mesh geometry={logo.ring} material={mats.ring} />
        <mesh geometry={logo.arrow} material={mats.arrow} />
      </group>

      {data.layouts[0].map((_, k) => (
        <group key={k}>
          <mesh ref={setRef(k, 0)} material={mats.jacket} frustumCulled={false}><bufferGeometry /></mesh>
          <mesh ref={setRef(k, 1)} material={mats.core} frustumCulled={false}><bufferGeometry /></mesh>
          <mesh ref={setRef(k, 2)} material={mats.h1} frustumCulled={false}><bufferGeometry /></mesh>
          <mesh ref={setRef(k, 3)} material={mats.h2} frustumCulled={false}><bufferGeometry /></mesh>
        </group>
      ))}

      <group ref={nodesRoot} visible={false}>
        {Object.entries(NODES).map(([id, [x, y]]) => (
          <group key={id} position={[x, y, 0.06]} scale={0.001}>
            <NodeMesh id={id} />
            {labels && LABELS[id] && (
              <Html center position={[0, 0.5, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
                <Tag>{LABELS[id]}</Tag>
              </Html>
            )}
          </group>
        ))}
      </group>

      <instancedMesh ref={pk} args={[undefined, undefined, K]} frustumCulled={false}>
        <boxGeometry args={[0.12, 0.05, 0.05]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}
