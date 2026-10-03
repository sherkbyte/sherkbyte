'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMotion } from '@/lib/MotionContext';
import type { Service } from '@/lib/services';
import LazyScene from './LazyScene';

export default function ServiceCard({ s }: { s: Service }) {
  const { reduced } = useMotion();
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const stage = hover ?? pinned;

  return (
    <motion.article
      id={s.id}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-line bg-panel/70"
    >
      <div className="relative h-60">
        <LazyScene scene={s.scene} stage={stage} className="h-full w-full" />
        {s.overlay && (
          <p className="absolute bottom-3 left-3 rounded-md border border-cyan-400/50 bg-ink/95 px-3 py-1 text-sm font-semibold text-white">
            {s.overlay}
          </p>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 className="text-xl font-semibold text-white">{s.title}</h3>
        <p className="text-slate-300">{s.summary}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          {s.bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>
        {s.stages && (
          <div className="flex flex-wrap gap-2" role="group" aria-label={`${s.title} visual stages`}>
            {s.stages.map((st) => (
              <button key={st} type="button" aria-pressed={pinned === st}
                onMouseEnter={() => setHover(st)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(st)} onBlur={() => setHover(null)}
                onClick={() => setPinned(pinned === st ? null : st)}
                className={`rounded-md border px-3 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${pinned === st ? 'border-cyan-400 bg-cyan-400/15 text-white' : 'border-slate-600 text-slate-200 hover:border-slate-400'}`}>
                {st}
              </button>
            ))}
          </div>
        )}
        <a href="#contact" className="mt-auto text-sm font-semibold text-cyan-400 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
          Discuss {s.title.split(' ')[0].toLowerCase()} needs →
        </a>
      </div>
    </motion.article>
  );
}
