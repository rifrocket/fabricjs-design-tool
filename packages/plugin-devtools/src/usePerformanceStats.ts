import { useEffect, useState } from "react";

export interface PerfStats {
  fps: number;
}

const SAMPLE_WINDOW_MS = 1000;

// `active` is the caller's responsibility (e.g. tied to whether a dev-tools panel is actually
// visible) — a stray always-on rAF loop is an easy way to hurt the very performance this hook
// is meant to report on.
export function usePerformanceStats(active: boolean): PerfStats {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frameCount = 0;
    let windowStart = performance.now();
    let rafId: number;

    const tick = () => {
      frameCount += 1;
      const now = performance.now();
      const elapsed = now - windowStart;
      if (elapsed >= SAMPLE_WINDOW_MS) {
        setFps(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        windowStart = now;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  return { fps };
}
