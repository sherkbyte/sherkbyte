'use client';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Ctx = {
  reduced: boolean; simplify: boolean; mobile: boolean;
  toggleReduced: () => void; toggleSimplify: () => void;
};
const MotionCtx = createContext<Ctx>({
  reduced: false, simplify: false, mobile: false, toggleReduced: () => {}, toggleSimplify: () => {}
});
export const useMotion = () => useContext(MotionCtx);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [system, setSystem] = useState(false);
  const [user, setUser] = useState<boolean | null>(null);
  const [simplify, setSimplify] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mm = window.matchMedia('(max-width: 767px)');
    const sync = () => { setSystem(mq.matches); setMobile(mm.matches); };
    sync();
    mq.addEventListener('change', sync);
    mm.addEventListener('change', sync);
    const r = localStorage.getItem('sb-reduce');
    if (r !== null) setUser(r === '1');
    setSimplify(localStorage.getItem('sb-simplify') === '1');
    return () => { mq.removeEventListener('change', sync); mm.removeEventListener('change', sync); };
  }, []);

  const reduced = user ?? system;
  useEffect(() => { document.documentElement.dataset.reduceMotion = String(reduced); }, [reduced]);

  const value = useMemo<Ctx>(() => ({
    reduced, simplify, mobile,
    toggleReduced: () => { const n = !reduced; setUser(n); localStorage.setItem('sb-reduce', n ? '1' : '0'); },
    toggleSimplify: () => { const n = !simplify; setSimplify(n); localStorage.setItem('sb-simplify', n ? '1' : '0'); }
  }), [reduced, simplify, mobile]);

  return <MotionCtx.Provider value={value}>{children}</MotionCtx.Provider>;
}
