'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, type MutableRefObject } from 'react';
import { useMotion } from '@/lib/MotionContext';
import { hasWebGL, useInView } from '@/lib/useInView';
import SceneFallback from './SceneFallback';
import type { SceneKind } from './types';

// three.js, R3F and every scene are only downloaded once this container nears the viewport.
const SceneHost = dynamic(() => import('./SceneHost'), {
  ssr: false,
  loading: () => null
});

export default function LazyScene({ scene, className = '', stage, mode, progressRef }: {
  scene: SceneKind; className?: string; stage?: string | null;
  mode?: 'hero' | 'story'; progressRef?: MutableRefObject<number>;
}) {
  const { reduced, simplify, mobile } = useMotion();
  const { ref, inView, seen } = useInView<HTMLDivElement>();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [level, setLevel] = useState(0); // 0 full, 1 lite, 2 static fallback

  useEffect(() => setSupported(hasWebGL()), []);
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 8 : 8;
  const lite = simplify || mobile || level >= 1 || cores <= 4;
  const show = seen && supported === true && level < 2;

  return (
    <div ref={ref} className={`relative ${className}`} aria-hidden="true">
      <SceneFallback kind={scene} />
      {show && (
        <div className="absolute inset-0">
          <SceneHost
            scene={scene} animate={!reduced} lite={lite} active={inView} stage={stage} mode={mode} progressRef={progressRef}
            onDecline={() => setLevel((l) => Math.max(l, 1))}
            onFallback={() => setLevel(2)}
          />
        </div>
      )}
    </div>
  );
}
