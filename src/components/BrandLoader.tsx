import { useEffect, useState } from 'react';

interface BrandLoaderProps {
  sceneReady: boolean;
  onComplete: () => void;
}

export function BrandLoader({ sceneReady, onComplete }: BrandLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setProgress(100);
      setExiting(true);
      const t = window.setTimeout(onComplete, 80);
      return () => window.clearTimeout(t);
    }

    let rafId = 0;
    let exitTimer = 0;
    const startTime = performance.now();
    const minDuration = 440;
    const maxCapBeforeReady = 90;

    const finish = () => {
      setProgress(100);
      setExiting(true);
      exitTimer = window.setTimeout(onComplete, 420);
    };

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const timeFraction = Math.min(1, elapsed / minDuration);

      setProgress((prev) => {
        const target = sceneReady
          ? 100
          : Math.min(maxCapBeforeReady, Math.round(timeFraction * 90));
        if (sceneReady && timeFraction >= 1) return 100;
        const step = Math.max(2, Math.ceil((target - prev) * 0.28));
        return Math.min(target, prev + step);
      });

      if (sceneReady && elapsed >= minDuration) {
        finish();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const failsafe = window.setTimeout(finish, 2000);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(failsafe);
      window.clearTimeout(exitTimer);
    };
  }, [sceneReady, onComplete]);

  return (
    <div
      role="status"
      aria-label="Initializing R & L Studio experience"
      className={`fixed inset-0 z-50 flex flex-col justify-between bg-[#08080a] px-6 py-7 sm:px-12 sm:py-10 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        exiting
          ? 'opacity-0 -translate-y-3 pointer-events-none'
          : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <span className="font-display text-base sm:text-lg font-semibold tracking-[0.24em] text-[#f4f4f0]">
          R &amp; L
        </span>
        <button
          type="button"
          onClick={() => {
            setProgress(100);
            setExiting(true);
            window.setTimeout(onComplete, 200);
          }}
          className="min-h-[36px] px-2 font-mono-tabular text-[11px] tracking-[0.18em] text-[#a1a1aa] hover:text-[#e5a93c] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          ENTER STUDIO
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono-tabular text-[11px] tracking-[0.22em] text-[#e5a93c]">
              R &amp; L STUDIO
            </span>
            <p className="font-mono-tabular text-xs sm:text-sm tracking-[0.2em] text-[#a1a1aa]">
              INITIALIZING EXPERIENCE
            </p>
          </div>
          <span className="font-mono-tabular text-3xl sm:text-5xl font-medium tracking-tight text-[#f4f4f0]">
            {String(progress).padStart(2, '0')}
            <span className="text-lg sm:text-2xl text-[#71717a]">%</span>
          </span>
        </div>

        <div className="relative h-[2px] w-full overflow-hidden bg-white/10">
          <div
            className="h-full bg-[#e5a93c] transition-transform duration-150 ease-out origin-left"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </div>

        <div className="flex items-center justify-between font-mono-tabular text-[10px] tracking-[0.18em] text-[#52525b]">
          <span>00</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#71717a] font-mono-tabular tracking-[0.14em]">
        <span>DIGITAL ARCHITECTURE</span>
        <span>0 — 100%</span>
      </div>
    </div>
  );
}
