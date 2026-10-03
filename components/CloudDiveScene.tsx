import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneProps } from './types';
import { C } from './three/theme';
import { SceneLights, Tag } from './three/helpers';
import { CloudNode } from './three/CloudNode';
import logo from './assets/sherkbyte-logo.jpg';

/*
  Journey (progress 0..1):
  0.00-0.04  the original SherkByte logo, untouched
  0.04-0.30  scroll begins: cloud folds appear as cables, camera dives in, logo fades
  0.30-0.55  folds re-route into a network diagram (Internet > Firewall > Router > Server > Switches > Computers)
  0.55-0.70  hold on the diagram
  0.70-1.00  the diagram becomes lanes of traffic
  The SAME cables morph between layouts, so it reads as one continuous object.
*/

const ROWS = 11;
const smooth = (x: number) => { const t = THREE.MathUtils.clamp(x, 0, 1); return t * t * (3 - 2 * t); };

// ---- logo plane placement (logo image is 1280 px wide; cloud centre is at px 622,232) ----
const WORLD_PER_PX = 0.0096;
const LOGO_W = 1280 * WORLD_PER_PX;
const LOGO_H = LOGO_W * (logo.height / logo.width);
const LOGO_POS: [number, number] = [(640 - 622) * WORLD_PER_PX, (232 - (1280 * logo.height) / logo.width / 2) * WORLD_PER_PX];

// ---- cloud interior (used only to place the starting "fold" cables) ----
const CIRCLES: [number, number, number][] = [
  [-1.75, -0.22, 1.25], [0.27, 0.45, 1.34], [2.0, -0.56, 0.96], [-0.7, -0.6, 0.9], [0.4, -0.7, 0.9], [1.3, -0.7, 0.8]
];
const sdf = (x: number, y: number) => Math.min(...CIRCLES.map(([cx, cy, r]) => Math.hypot(x - cx, y - cy) - r));
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

// Layout 2: network diagram laid out like the reference screenshot
type NodeDef = { id: string; kind: string; x: number; y: number; label?: string };
const MON_X = [0.06, 1.28, 2.44, 3.59];
const NODES: NodeDef[] = [
  { id: 'int', kind: 'cloud', x: -2.5, y: 2.94, label: 'The Internet' },
  { id: 'fw1', kind: 'fw', x: -0.84, y: 2.94, label: 'Firewall' },
  { id: 'rtr', kind: 'rtr', x: 0.65, y: 2.94, label: 'Router' },
  { id: 'srv', kind: 'srv', x: 2.16, y: 2.94, label: 'Server' },
  { id: 'fw2', kind: 'fw', x: -1.55, y: 0.84, label: 'Firewall' },
  { id: 'sw1', kind: 'sw', x: 0.65, y: 0.84, label: 'Switch' },
  { id: 'sw2', kind: 'sw', x: 2.96, y: 0.84, label: 'Switch' },
  { id: 'wap', kind: 'wap', x: -1.55, y: -1.37, label: 'Wireless Access Point' },
  { id: 'l1', kind: 'lap', x: -3.61, y: -0.53 },
  { id: 'l2', kind: 'lap', x: -3.61, y: -1.79 },
  ...MON_X.flatMap((x, i) => [-0.59, -1.89].map((y, j) => ({ id: `m${i}${j}`, kind: 'mon', x, y }))),
  { id: 'nc', kind: 'none', x: 1.85, y: -1.24, label: 'Network Computers' }
];

type P2 = [number, number];
const ROUTES: P2[][] = [
  [[-2.5, 2.94], [-0.84, 2.94], [0.65, 2.94], [2.16, 2.94]],                 // Internet > Firewall > Router > Server
  [[0.65, 2.94], [0.65, 1.79], [-1.55, 1.79], [-1.55, 0.84]],                // Router > Firewall
  [[0.65, 2.94], [0.65, 0.84]],                                               // Router > Switch
  [[0.65, 2.94], [0.65, 1.79], [2.96, 1.79], [2.96, 0.84]],                  // Router > Switch
  [[-1.55, 0.84], [-1.55, -1.37]],                                            // Firewall > Access point
  [[-1.55, -1.37], [-2.3, -1.37], [-2.3, -0.53], [-3.35, -0.53]],            // Access point > laptop
  [[-1.55, -1.37], [-2.3, -1.37], [-2.3, -1.79], [-3.35, -1.79]],            // Access point > laptop
  [[0.65, 0.84], [0.65, 0.12], [0.06, 0.12], [0.06, -1.75]],                 // Switch > computers
  [[0.65, 0.84], [0.65, 0.12], [1.28, 0.12], [1.28, -1.75]],
  [[2.96, 0.84], [2.96, 0.12], [2.44, 0.12], [2.44, -1.75]],
  [[2.96, 0.84], [2.96, 0.12], [3.59, 0.12], [3.59, -1.75]]
];

function diagPaths(M: number): THREE.Vector3[][] {
  return ROUTES.map((pts, k) => {
    const v = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1e-4);
    const z = (k - 5) * 0.012;
    return new THREE.CatmullRomCurve3(v.map((p) => new THREE.Vector3(p[0], p[1], z)), false, 'catmullrom', 0.15).getSpacedPoints(M);
  });
}

// Layout 3: lanes that merge into trunks and fan back out, like traffic on a highway
function trafficPaths(M: number): THREE.Vector3[][] {
  return Array.from({ length: ROWS }, (_, k) => {
    const yb = (k - (ROWS - 1) / 2) * 0.3;
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

type Z = number | 'logo' | 'diag';
const KEYS: { p: number; pos: [number, number, Z]; t: [number, number, number] }[] = [
  { p: 0, pos: [LOGO_POS[0], LOGO_POS[1], 'logo'], t: [LOGO_POS[0], LOGO_POS[1], 0] },
  { p: 0.2, pos: [0, 0.1, 7.5], t: [0, 0, 0] },
  { p: 0.32, pos: [-0.6, 0.3, 3.4], t: [-0.4, 0.1, 0] },
  { p: 0.5, pos: [0, 0.5, 'diag'], t: [0, 0.5, 0] },
  { p: 0.7, pos: [0, 0.5, 'diag'], t: [0, 0.5, 0] },
  { p: 0.9, pos: [0, -4.8, 9.5], t: [0, 0, 0] },
  { p: 1, pos: [0, -4.8, 9.5], t: [0, 0, 0] }
];
const TA = new THREE.Vector3();
const TB = new THREE.Vector3();
function camAt(p: number, pos: THREE.Vector3, tgt: THREE.Vector3, fit: { logo: number; diag: number }) {
  const z = (v: Z) => (v === 'logo' ? fit.logo : v === 'diag' ? fit.diag : v);
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const f = smooth((p - a.p) / (b.p - a.p));
  pos.set(a.pos[0], a.pos[1], z(a.pos[2])).lerp(TA.set(b.pos[0], b.pos[1], z(b.pos[2])), f);
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

// ---- flat, blue, screenshot-style device icons (procedural, tiny) ----
const BD = '#1F4E9A', BM = '#3B82F6', BL = '#8EB8F5';
const Mt = ({ c, e = 0.25 }: { c: string; e?: number }) => (
  <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} metalness={0.2} roughness={0.55} />
);
const Bx = ({ p, s, c, e }: { p: [number, number, number]; s: [number, number, number]; c: string; e?: number }) => (
  <mesh position={p}><boxGeometry args={s} /><Mt c={c} e={e} /></mesh>
);
const Rod = ({ x }: { x: number }) => (
  <mesh position={[x, 0.08, 0]}><cylinderGeometry args={[0.012, 0.012, 0.26, 6]} /><Mt c={BL} /></mesh>
);

function Icon({ kind }: { kind: string }) {
  switch (kind) {
    case 'cloud':
      return <group scale={0.42}><CloudNode animate={false} color={BM} /></group>;
    case 'fw':
      return (
        <group>
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
            <Bx key={`${r}${c}`} p={[(c - 1) * 0.19 + (r % 2 ? 0.095 : 0) - 0.045, (r - 1) * 0.12 - 0.05, 0]} s={[0.17, 0.1, 0.14]} c={r % 2 ? BM : BD} />
          )))}
          <mesh position={[0, 0.26, 0]}><coneGeometry args={[0.08, 0.2, 10]} /><Mt c={C.cyan} e={0.7} /></mesh>
        </group>
      );
    case 'rtr':
      return (
        <group>
          <Bx p={[0, -0.05, 0]} s={[0.64, 0.14, 0.3]} c={BD} />
          <Rod x={-0.2} /><Rod x={0.2} />
          {[-0.2, -0.1, 0].map((x) => <Bx key={x} p={[x, -0.05, 0.16]} s={[0.04, 0.04, 0.02]} c={C.cyan} e={0.8} />)}
        </group>
      );
    case 'srv':
      return (
        <group>
          {[-0.2, 0, 0.2].map((y) => (
            <group key={y}>
              <Bx p={[0, y, 0]} s={[0.42, 0.16, 0.3]} c={BD} />
              <Bx p={[0.13, y, 0.16]} s={[0.05, 0.05, 0.02]} c={C.cyan} e={0.8} />
            </group>
          ))}
        </group>
      );
    case 'sw':
      return (
        <group>
          <Bx p={[0, 0, 0]} s={[0.5, 0.5, 0.1]} c={BD} />
          {[-0.12, 0.12].map((x) => [-0.12, 0.12].map((y) => <Bx key={`${x}${y}`} p={[x, y, 0.06]} s={[0.17, 0.17, 0.03]} c={BL} />))}
        </group>
      );
    case 'mon':
      return (
        <group>
          <Bx p={[0, 0.06, 0]} s={[0.46, 0.3, 0.05]} c={BD} />
          <Bx p={[0, 0.06, 0.03]} s={[0.4, 0.24, 0.02]} c={BM} e={0.15} />
          <Bx p={[0, -0.14, 0]} s={[0.06, 0.1, 0.04]} c={BD} />
          <Bx p={[0, -0.2, 0]} s={[0.22, 0.03, 0.1]} c={BD} />
        </group>
      );
    case 'lap':
      return (
        <group>
          <Bx p={[0, 0.05, 0]} s={[0.46, 0.3, 0.03]} c={BD} />
          <Bx p={[0, 0.05, 0.02]} s={[0.4, 0.24, 0.02]} c={BM} e={0.15} />
          <Bx p={[0, -0.13, 0.05]} s={[0.56, 0.04, 0.16]} c={BD} />
        </group>
      );
    case 'wap':
      return (
        <group>
          <Bx p={[0, -0.1, 0]} s={[0.5, 0.12, 0.28]} c={BD} />
          <Rod x={-0.16} /><Rod x={0.16} />
          {[0.14, 0.22].map((r) => (
            <mesh key={r} position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2 - 0.6]}>
              <torusGeometry args={[r, 0.012, 6, 20, 1.2]} /><Mt c={C.cyan} e={0.7} />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}

export default function CloudDiveScene({ animate, lite, progressRef }: SceneProps) {
  const M = lite ? 28 : 44;
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const tex = useTexture(logo.src);
  tex.colorSpace = THREE.SRGBColorSpace;

  const data = useMemo(() => {
    const idx = lite ? [0, 1, 2, 3, 4, 5, 7, 9] : Array.from({ length: ROWS }, (_, i) => i);
    const pick = (a: THREE.Vector3[][]) => idx.map((i) => a[i]);
    return { layouts: [pick(brainPaths(M)), pick(diagPaths(M)), pick(trafficPaths(M))] };
  }, [lite, M]);
  const n = data.layouts[0].length;

  const mats = useMemo(() => ({
    jacket: new THREE.MeshStandardMaterial({ color: '#2F78D6', emissive: '#1A62AB', emissiveIntensity: 0.35, transparent: true, opacity: 0.55, metalness: 0.2, roughness: 0.45 }),
    core: new THREE.MeshBasicMaterial({ color: C.cyan, toneMapped: false, transparent: true }),
    h1: new THREE.MeshBasicMaterial({ color: '#D9822B', transparent: true }),
    h2: new THREE.MeshBasicMaterial({ color: '#E9EEF5', transparent: true }),
    logo: new THREE.MeshBasicMaterial({ map: tex, color: '#ffffff', transparent: true, toneMapped: false, fog: false, depthWrite: false }),
    pk: new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true })
  }), [tex]);
  const WHITE = useMemo(() => new THREE.Color('#ffffff'), []);
  const NAVY = useMemo(() => new THREE.Color('#10294A'), []);
  const cJ1 = useMemo(() => new THREE.Color('#2F78D6'), []);
  const cJ2 = useMemo(() => new THREE.Color('#2A63B8'), []);

  const K = lite ? 50 : 140;
  const pkData = useMemo(() => Array.from({ length: K }, (_, i) => ({
    ci: i % n, spd: 0.05 + (i % 7) * 0.012, off: (i * 0.6180339) % 1, kind: i % 10 === 0 ? 2 : i % 5 === 0 ? 1 : 0
  })), [K, n]);

  const cableRoot = useRef<THREE.Group>(null);
  const logoMesh = useRef<THREE.Mesh>(null);
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

  useEffect(() => { tex.anisotropy = 8; tex.needsUpdate = true; }, [tex]);
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
    const radius = p < 0.7
      ? THREE.MathUtils.lerp(0.05, 0.022, smooth((p - 0.3) / 0.25))
      : THREE.MathUtils.lerp(0.022, 0.032, smooth((p - 0.7) / 0.2));
    const helix = !lite && p > 0.2 && p < 0.5;
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

    // camera: frame the whole logo at the start, and the whole diagram in the middle
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const aspect = size.width / Math.max(1, size.height);
    const fit = (w: number, h: number) => Math.max(h / 2 / tan, w / 2 / (tan * aspect)) * 1.05;
    camAt(p, wantP.current, wantT.current, { logo: fit(LOGO_W, LOGO_H), diag: fit(8.8, 6.4) });
    const k = animate ? 1 - Math.exp(-delta * 6) : 1;
    camera.position.lerp(wantP.current, k);
    look.current.lerp(wantT.current, k);
    camera.lookAt(look.current);

    // original logo: pristine at p=0, fades into a dark blueprint as the dive proceeds
    const logoO = 1 - smooth((p - 0.12) / 0.16);
    mats.logo.opacity = logoO;
    mats.logo.color.copy(WHITE).lerp(NAVY, smooth((p - 0.1) / 0.14));
    if (logoMesh.current) logoMesh.current.visible = logoO > 0.01;

    // cables and packets fade in as soon as scrolling starts
    const fadeIn = smooth((p - 0.04) / 0.12);
    mats.jacket.opacity = 0.55 * fadeIn;
    mats.core.opacity = mats.h1.opacity = mats.h2.opacity = mats.pk.opacity = fadeIn;
    if (cableRoot.current) cableRoot.current.visible = fadeIn > 0.01;

    const now = clock.elapsedTime;
    const first = built.current < 0;
    if (first || (Math.abs(p - built.current) > 0.0015 && (!animate || now - builtAt.current > 0.03))) {
      rebuild(p);
      built.current = p;
      builtAt.current = now;
    }
    mats.jacket.color.copy(cJ1).lerp(cJ2, smooth((p - 0.25) / 0.25));

    const traffic = smooth((p - 0.7) / 0.2);
    const vis = smooth((p - 0.38) / 0.14) * (1 - traffic);
    if (nodesRoot.current) {
      nodesRoot.current.visible = vis > 0.01;
      nodesRoot.current.children.forEach((c) => c.scale.setScalar(Math.max(vis, 0.001)));
    }
    const show = p > 0.5 && p < 0.72;
    if (show !== labelsOn.current) { labelsOn.current = show; setLabels(show); }

    const m = pk.current;
    if (m) {
      if (!animate || fadeIn < 0.01) m.count = 0;
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
      <mesh ref={logoMesh} position={[LOGO_POS[0], LOGO_POS[1], -0.2]} material={mats.logo}>
        <planeGeometry args={[LOGO_W, LOGO_H]} />
      </mesh>

      <group ref={cableRoot}>
        {data.layouts[0].map((_, k) => (
          <group key={k}>
            <mesh ref={setRef(k, 0)} material={mats.jacket} frustumCulled={false}><bufferGeometry /></mesh>
            <mesh ref={setRef(k, 1)} material={mats.core} frustumCulled={false}><bufferGeometry /></mesh>
            <mesh ref={setRef(k, 2)} material={mats.h1} frustumCulled={false}><bufferGeometry /></mesh>
            <mesh ref={setRef(k, 3)} material={mats.h2} frustumCulled={false}><bufferGeometry /></mesh>
          </group>
        ))}
      </group>

      <group ref={nodesRoot} visible={false}>
        {NODES.map((nd) => (
          <group key={nd.id} position={[nd.x, nd.y, 0.1]} scale={0.001}>
            <Icon kind={nd.kind} />
            {labels && nd.label && (
              <Html center position={[0, nd.kind === 'none' ? 0 : -0.42, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
                <Tag>{nd.label}</Tag>
              </Html>
            )}
          </group>
        ))}
      </group>

      <instancedMesh ref={pk} args={[undefined, undefined, K]} material={mats.pk} frustumCulled={false}>
        <boxGeometry args={[0.12, 0.05, 0.05]} />
      </instancedMesh>
    </>
  );
}
