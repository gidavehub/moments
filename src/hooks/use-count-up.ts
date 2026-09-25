import { useEffect, useRef, useState } from 'react';

import { useReduced } from '@/theme';

/** Counts a number up (expo-out) whenever the target changes. JS-driven; for text only. */
export function useCountUp(target: number, ms = 900) {
  const reduced = useReduced();
  const [v, setV] = useState(reduced ? target : 0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    const span = reduced ? 1 : ms;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / span);
      const e = 1 - Math.pow(1 - p, 4);
      setV(a + (target - a) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduced]);
  return v;
}
