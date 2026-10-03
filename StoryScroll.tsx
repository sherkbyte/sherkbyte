'use client';
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useMotion } from '@/lib/MotionContext';
import { STORY } from '@/lib/services';
import LazyScene from './LazyScene';

export default function StoryScroll() {
  const { reduced, mobile } = useMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progress.current = v;
    setStep(Math.round(v * (STORY.length - 1)));
  });

  const heading = (
    <h2 className="text-3xl font-semibold text-white md:text-4xl">One connected system, start to finish</h2>
  );

  // Mobile and reduced motion: plain, fully readable list. No scroll-linked camera.
  if (mobile || reduced) {
    return (
      <section id="approach" className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="story-h">
        <div id="story-h">{heading}</div>
        <ol className="mt-8 grid gap-4 md:grid-cols-2">
          {STORY.map((s, i) => (
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
    <section id="approach" aria-label="How the technology stack connects">
      <div ref={wrap} className="relative" style={{ height: `${STORY.length * 100}vh` }}>
        <div className="sticky top-0 grid h-screen items-center gap-8 px-6 lg:grid-cols-[minmax(320px,440px)_1fr] lg:px-12">
          <div className="rounded-2xl border border-line bg-ink p-8">
            {heading}
            <ol className="sr-only">
              {STORY.map((s) => <li key={s.key}>{s.key}: {s.msg} {s.detail}</li>)}
            </ol>
            <div aria-live="polite" className="mt-6 min-h-[9rem]">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">{step + 1} / {STORY.length} · {STORY[step].key}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{STORY[step].msg}</p>
                  <p className="mt-2 text-slate-300">{STORY[step].detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-4 flex gap-2" aria-hidden="true">
              {STORY.map((s, i) => <span key={s.key} className={`h-1.5 flex-1 rounded ${i <= step ? 'bg-cyan-400' : 'bg-line'}`} />)}
            </div>
          </div>
          <div className="h-[60vh] overflow-hidden rounded-2xl border border-line lg:h-[80vh]">
            <LazyScene scene="hero" mode="story" progressRef={progress} className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
