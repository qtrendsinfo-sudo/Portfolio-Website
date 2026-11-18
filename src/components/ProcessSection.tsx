import { useRef, useState } from 'react';
import { PROCESS_STAGES } from '../data/studioData';
import { useInView } from '../hooks/useInView';

export function ProcessSection() {
  const { ref, visible } = useInView(0.08);
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeStage = PROCESS_STAGES[activeIndex];

  const selectAndFocus = (nextIdx: number) => {
    setActiveIndex(nextIdx);
    tabRefs.current[nextIdx]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      selectAndFocus((idx + 1) % PROCESS_STAGES.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      selectAndFocus((idx - 1 + PROCESS_STAGES.length) % PROCESS_STAGES.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectAndFocus(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      selectAndFocus(PROCESS_STAGES.length - 1);
    }
  };

  return (
    <section
      ref={ref}
      id="process"
      aria-labelledby="process-heading"
      className={`relative border-t border-white/10 bg-[#0b0b0e] py-20 sm:py-28 lg:py-36 reveal-section ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-6 md:px-12">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#e5a93c]">
              02 · METHODOLOGY
            </p>
            <h2
              id="process-heading"
              className="mt-3 font-display text-[clamp(1.85rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-[#f4f4f0]"
            >
              HOW WE BUILD
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#a1a1aa]">
            Select or arrow through any stage in our digital execution system to
            inspect how concepts move into production.
          </p>
        </div>

        {/* Interactive Node Conduit System */}
        <div className="mt-10 sm:mt-14">
          <div className="relative">
            {/* Desktop SVG Architectural Signal Conduit */}
            <div
              aria-hidden="true"
              className="pointer-events-none hidden lg:block mb-4 px-8"
            >
              <svg viewBox="0 0 1000 32" className="h-8 w-full overflow-visible">
                <line
                  x1="0"
                  y1="16"
                  x2="1000"
                  y2="16"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1.5"
                />
                <line
                  x1="0"
                  y1="16"
                  x2={(activeIndex / (PROCESS_STAGES.length - 1)) * 1000}
                  y2="16"
                  stroke="#e5a93c"
                  strokeWidth="2"
                  className="transition-all duration-300 ease-out"
                />
                {PROCESS_STAGES.map((stage, idx) => {
                  const cx = (idx / (PROCESS_STAGES.length - 1)) * 1000;
                  const isActive = idx === activeIndex;
                  const isPassed = idx <= activeIndex;
                  return (
                    <g key={stage.id}>
                      <circle
                        cx={cx}
                        cy="16"
                        r={isActive ? 7 : 4.5}
                        fill={isActive ? '#e5a93c' : isPassed ? '#111114' : '#0b0b0e'}
                        stroke={isPassed ? '#e5a93c' : 'rgba(255,255,255,0.28)'}
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div
              role="tablist"
              aria-label="Build process stages"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4"
            >
              {PROCESS_STAGES.map((stage, idx) => {
                const isActive = idx === activeIndex;
                const isPassed = idx <= activeIndex;

                return (
                  <button
                    key={stage.id}
                    ref={(el) => {
                      tabRefs.current[idx] = el;
                    }}
                    type="button"
                    role="tab"
                    tabIndex={isActive ? 0 : -1}
                    aria-selected={isActive}
                    aria-controls={`process-panel-${stage.id}`}
                    id={`process-tab-${stage.id}`}
                    onClick={() => setActiveIndex(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`group relative flex min-h-[104px] flex-col justify-between border p-4 text-left transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? 'border-[#e5a93c] bg-[#16161b]'
                        : 'border-white/10 bg-[#08080a] hover:border-white/25 hover:bg-[#111114]'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={`font-mono-tabular text-xs tracking-[0.14em] ${
                          isPassed ? 'text-[#e5a93c]' : 'text-[#71717a]'
                        }`}
                      >
                        {stage.step}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 border transition-colors ${
                          isActive
                            ? 'border-[#e5a93c] bg-[#e5a93c]'
                            : isPassed
                              ? 'border-[#e5a93c] bg-transparent'
                              : 'border-white/25 bg-transparent'
                        }`}
                      />
                    </div>

                    <div>
                      <span className="block font-display text-base sm:text-lg font-semibold tracking-tight text-[#f4f4f0]">
                        {stage.title}
                      </span>
                      <span className="mt-1 block font-mono-tabular text-[10px] sm:text-[11px] text-[#71717a] truncate">
                        {idx < PROCESS_STAGES.length - 1
                          ? `↓ ${PROCESS_STAGES[idx + 1].title}`
                          : '→ SHIPPED'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Stage Architectural Breakdown */}
          <div
            key={activeStage.id}
            role="tabpanel"
            id={`process-panel-${activeStage.id}`}
            aria-labelledby={`process-tab-${activeStage.id}`}
            className="mt-6 sm:mt-8 grid grid-cols-1 gap-8 border border-white/10 bg-[#111114] p-6 sm:p-10 lg:grid-cols-12 lg:items-center"
          >
            <div className="lg:col-span-4 lg:border-r lg:border-white/10 lg:pr-8">
              <div className="font-mono-tabular text-xs tracking-[0.2em] text-[#e5a93c]">
                STAGE {activeStage.step} / 06
              </div>
              <h3 className="mt-2 font-display text-2xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f0]">
                {activeStage.title}
              </h3>
              <p className="mt-3 font-mono-tabular text-xs text-[#a1a1aa]">
                {activeStage.focus}
              </p>
            </div>

            <div className="lg:col-span-8 flex flex-col justify-between gap-6">
              <p className="text-sm sm:text-lg leading-relaxed text-[#d4d4d8]">
                {activeStage.summary}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div>
                  <span className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#71717a]">
                    PRIMARY OUTPUT
                  </span>
                  <span className="mt-1 block text-sm font-medium text-[#f4f4f0]">
                    {activeStage.deliverable}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activeIndex === 0}
                    onClick={() => selectAndFocus(Math.max(0, activeIndex - 1))}
                    className="min-h-[42px] border border-white/15 px-4 py-2 font-mono-tabular text-xs text-[#a1a1aa] hover:border-[#e5a93c] hover:text-[#f4f4f0] disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                  >
                    PREV
                  </button>
                  <button
                    type="button"
                    disabled={activeIndex === PROCESS_STAGES.length - 1}
                    onClick={() =>
                      selectAndFocus(Math.min(PROCESS_STAGES.length - 1, activeIndex + 1))
                    }
                    className="min-h-[42px] border border-white/15 px-4 py-2 font-mono-tabular text-xs text-[#a1a1aa] hover:border-[#e5a93c] hover:text-[#f4f4f0] disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
