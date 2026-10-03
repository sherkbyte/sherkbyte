'use client';
import { useMotion } from '@/lib/MotionContext';

export default function ReduceMotionToggle() {
  const { reduced, simplify, toggleReduced, toggleSimplify } = useMotion();
  const base = 'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400';
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Visual preferences">
      <button type="button" onClick={toggleReduced} aria-pressed={reduced}
        className={`${base} ${reduced ? 'border-cyan-400 bg-cyan-400/15 text-white' : 'border-slate-600 text-slate-200 hover:border-slate-400'}`}>
        Reduce Motion: {reduced ? 'On' : 'Off'}
      </button>
      <button type="button" onClick={toggleSimplify} aria-pressed={simplify}
        className={`${base} ${simplify ? 'border-cyan-400 bg-cyan-400/15 text-white' : 'border-slate-600 text-slate-200 hover:border-slate-400'}`}>
        Simplify Visuals: {simplify ? 'On' : 'Off'}
      </button>
    </div>
  );
}
