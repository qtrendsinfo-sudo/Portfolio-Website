import { lazy, Suspense } from 'react';
import { ArrowDownRight } from 'lucide-react';

const HeroScene3D = lazy(() =>
  import('./HeroScene3D').then((m) => ({ default: m.HeroScene3D })),
);

interface HeroSectionProps {
  onSceneReady: () => void;
  onStartProject: () => void;
  onExploreWork: () => void;
}

export function HeroSection({
  onSceneReady,
  onStartProject,
  onExploreWork,
}: HeroSectionProps) {
  return (
    <section
      id="top"
      aria-label="R & L Studio Hero"
      className="relative flex min-h-screen w-full items-end sm:items-center overflow-hidden bg-[#08080a] pt-24 pb-24 sm:pb-20"
    >
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#08080a]"
          />
        }
      >
        <HeroScene3D onReady={onSceneReady} />
      </Suspense>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-6 md:px-12">
        <div className="max-w-3xl">
          <p className="mb-4 sm:mb-6 font-mono-tabular text-[11px] sm:text-xs tracking-[0.22em] text-[#e5a93c]">
            R &amp; L STUDIO — CREATIVE TECHNOLOGY STUDIO
          </p>

          <h1
            className="font-display text-[clamp(1.9rem,5.2vw,4.75rem)] font-semibold leading-[1.03] tracking-[-0.028em] text-[#f4f4f0] break-words"
            style={{ textWrap: 'balance' }}
          >
            WE TURN IDEAS INTO DIGITAL EXPERIENCES.
          </h1>

          <p className="mt-5 sm:mt-7 max-w-xl text-sm sm:text-lg leading-relaxed text-[#d4d4d8]">
            R &amp; L Studio designs and builds digital products, applications and
            experiences for ambitious ideas.
          </p>

          <p className="mt-3 font-mono-tabular text-[11px] sm:text-xs tracking-[0.14em] text-[#a1a1aa]">
            We don&apos;t just build software. We build digital experiences.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3.5 sm:gap-4">
            <button
              type="button"
              onClick={onStartProject}
              className="inline-flex min-h-[48px] items-center justify-center bg-[#e5a93c] px-7 py-3.5 text-xs font-semibold tracking-[0.16em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              START A PROJECT
            </button>

            <button
              type="button"
              onClick={onExploreWork}
              className="group inline-flex min-h-[48px] items-center justify-center gap-2 border border-white/20 bg-[#111114]/90 px-6 py-3.5 text-xs font-medium tracking-[0.16em] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>EXPLORE OUR WORK</span>
              <ArrowDownRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle architectural scroll datum */}
      <div className="pointer-events-none absolute bottom-6 left-5 sm:left-6 md:left-12 z-10 hidden sm:flex items-center gap-3">
        <span className="h-[1px] w-8 bg-[#e5a93c]" aria-hidden="true" />
        <span className="font-mono-tabular text-[11px] tracking-[0.2em] text-[#71717a]">
          SCROLL TO EXPLORE
        </span>
      </div>
    </section>
  );
}
