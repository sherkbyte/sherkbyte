'use client';
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useMotion } from '@/lib/MotionContext';
import LazyScene from './LazyScene';

const DIVE = [
  { key: 'The mark', msg: 'Every cloud has a structure.', detail: 'Look closer at the SherkByte mark.' },
  { key: 'The folds', msg: 'Look closer. The folds are wiring.', detail: 'Fiber and copper runs: the physical layer behind every cloud service.' },
  { key: 'The network', msg: 'Every path has an entry, a checkpoint, and an exit.', detail: 'Internet, firewall, router, servers, switches, access points, and workstations, mapped as one working network.' },
  { key: 'The traffic', msg: 'Then the network becomes movement.', detail: 'Zoom out and the diagram turns into traffic: packets, lanes, merges, and capacity.' }
];

const HOLD = 0.08; // the original logo stays untouched for the first 8% of the scroll

export default function CloudDive() {
  const { reduced, mobile } = useMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const fixed = useRef(0.6); // static view: the network diagram
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const eff = Math.max(0, (v - HOLD) / (1 - HOLD));
    progress.current = eff;
    setStarted(eff > 0.01);
    setStep(Math.min(DIVE.length - 1, Math.floor(eff * DIVE.length)));
  });

  const heading = <h2 className="text-3xl font-semibold text-white md:text-4xl">Inside the cloud</h2>;

  if (mobile || reduced) {
    return (
      <section id="inside" className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="dive-h">
        <div id="dive-h">{heading}</div>
        <div className="mt-6 h-[360px] overflow-hidden rounded-2xl border border-line md:h-[460px]">
          <LazyScene scene="dive" mode="story" progressRef={fixed} className="h-full w-full" />
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-2">
          {DIVE.map((s, i) => (
            <li key={s.key} className="rounded-xl border border-line bg-panel/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{i + 1}. {s.key}</p>
              <p className="mt-2 text-lg font-semibold text-white">{s.msg}</p>
              <p className="mt-1 text-slate-300">{s.detail}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section id="inside" aria-label="Inside the SherkByte cloud: from logo to network to traffic">
      <div ref={wrap} className="relative" style={{ height: `${DIVE.length * 130}vh` }}>
        <div className="sticky top-0 grid h-screen items-center gap-8 px-6 lg:grid-cols-[minmax(320px,420px)_1fr] lg:px-12">
          <div className="rounded-2xl border border-line bg-ink p-8">
            {heading}
            <ol className="sr-only">{DIVE.map((s) => <li key={s.key}>{s.key}: {s.msg} {s.detail}</li>)}</ol>
            <div aria-live="polite" className="mt-6 min-h-[10rem]">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{step + 1} / {DIVE.length} · {DIVE[step].key}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{DIVE[step].msg}</p>
                  <p className="mt-2 text-slate-300">{DIVE[step].detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <p className={`mt-2 text-sm font-medium text-cyan-400 transition-opacity ${started ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true">
              Scroll to look inside ↓
            </p>
            <div className="mt-4 flex gap-2" aria-hidden="true">
              {DIVE.map((s, i) => <span key={s.key} className={`h-1.5 flex-1 rounded ${i <= step ? 'bg-cyan-400' : 'bg-line'}`} />)}
            </div>
          </div>
          <div className="h-[60vh] overflow-hidden rounded-2xl border border-line lg:h-[82vh]">
            <LazyScene scene="dive" mode="story" progressRef={progress} className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
