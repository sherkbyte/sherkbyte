'use client';
import { Suspense, lazy, useEffect, type MutableRefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import type { SceneKind, V3 } from './types';

const scenes = {
  hero: lazy(() => import('./HeroScene')),
  infrastructure: lazy(() => import('./InfrastructureScene')),
  cloud: lazy(() => import('./CloudScene')),
  data: lazy(() => import('./DataAnalyticsScene')),
  ai: lazy(() => import('./AIIntegrationScene')),
  qa: lazy(() => import('./QualityAssuranceScene'))
};
const cams: Record<SceneKind, { pos: V3; fov: number }> = {
  hero: { pos: [0, 0.4, 13], fov: 38 },
  infrastructure: { pos: [2.6, 0.8, 6.5], fov: 35 },
  cloud: { pos: [0, 0.6, 8], fov: 36 },
  data: { pos: [0, 0.4, 7.5], fov: 36 },
  ai: { pos: [0, 0.3, 8], fov: 36 },
  qa: { pos: [0, 0, 6.2], fov: 36 }
};

// Renders on demand at a capped frame rate; paused when off-screen or tab hidden.
// With reduced motion it paints a still frame (and repaints on hover) instead of looping.
function FrameLimiter({ active, animate, fps }: { active: boolean; animate: boolean; fps: number }) {
  const advance = useThree((s) => s.advance);
  const size = useThree((s) => s.size);

  useEffect(() => {
    if (animate) return;
    const paint = () => advance(performance.now() / 1000);
    const ids = [60, 250, 800, 1600].map((ms) => window.setTimeout(paint, ms));
    window.addEventListener('sb-redraw', paint);
    return () => { ids.forEach(clearTimeout); window.removeEventListener('sb-redraw', paint); };
  }, [advance, animate, size]);

  useEffect(() => {
    if (!animate || !active) return;
    let raf = 0, last = 0;
    const interval = 1000 / fps;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || now - last < interval * 0.9) return;
      last = now;
      advance(now / 1000);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [advance, animate, active, fps]);
  return null;
}

export type HostProps = {
  scene: SceneKind; animate: boolean; lite: boolean; active: boolean; stage?: string | null;
  mode?: 'hero' | 'story'; progressRef?: MutableRefObject<number>;
  onDecline: () => void; onFallback: () => void;
};

export default function SceneHost({ scene, animate, lite, active, stage, mode, progressRef, onDecline, onFallback }: HostProps) {
  const Scene = scenes[scene];
  const cam = cams[scene];
  const fps = lite ? 30 : 60;
  return (
    <Canvas
      frameloop="never"
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      camera={{ position: cam.pos, fov: cam.fov, near: 0.1, far: 60 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onFallback(); })}
      style={{ width: '100%', height: '100%' }}
    >
      <fog attach="fog" args={['#07111F', 16, 34]} />
      <FrameLimiter active={active} animate={animate} fps={fps} />
      {animate && <PerformanceMonitor flipflops={3} bounds={() => [lite ? 22 : 40, 120]} onDecline={onDecline} onFallback={onFallback} />}
      <Suspense fallback={null}>
        <Scene animate={animate} lite={lite} stage={stage} mode={mode} progressRef={progressRef} />
      </Suspense>
    </Canvas>
  );
}
