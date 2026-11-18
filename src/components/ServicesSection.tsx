import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { STUDIO_SERVICES } from '../data/studioData';
import { useInView } from '../hooks/useInView';

interface ServicesSectionProps {
  onSelectServiceForProject: (projectType: string) => void;
}

export function ServicesSection({
  onSelectServiceForProject,
}: ServicesSectionProps) {
  const { ref, visible } = useInView(0.08);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = STUDIO_SERVICES[selectedIdx];

  return (
    <section
      ref={ref}
      id="services"
      aria-labelledby="services-heading"
      className={`relative border-t border-white/10 bg-[#08080a] py-20 sm:py-28 lg:py-36 reveal-section ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-6 md:px-12">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#e5a93c]">
              03 · CAPABILITIES
            </p>
            <h2
              id="services-heading"
              className="mt-3 font-display text-[clamp(1.85rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-[#f4f4f0]"
            >
              WHAT WE DESIGN &amp; ENGINEER
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#a1a1aa]">
            Multidisciplinary studio disciplines structured to carry digital products
            from architectural foundation to live release.
          </p>
        </div>

        {/* Interactive Typographic Index + Synchronized Detail */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7 divide-y divide-white/10 border-t border-b border-white/10">
            {STUDIO_SERVICES.map((service, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <div key={service.id} className="flex flex-col">
                  <button
                    type="button"
                    aria-expanded={isSelected}
                    onClick={() => setSelectedIdx(idx)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={`group flex min-h-[72px] w-full items-center justify-between gap-4 py-5 sm:py-6 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-[#f4f4f0]'
                        : 'text-[#71717a] hover:text-[#d4d4d8]'
                    }`}
                  >
                    <div className="flex items-baseline gap-4 sm:gap-8 min-w-0">
                      <span
                        className={`font-mono-tabular text-xs tracking-[0.14em] shrink-0 transition-colors ${
                          isSelected ? 'text-[#e5a93c]' : 'text-[#52525b]'
                        }`}
                      >
                        {service.index}
                      </span>
                      <span className="font-display text-xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.02em] transition-transform duration-200 group-hover:translate-x-1.5">
                        {service.name}
                      </span>
                    </div>

                    <ArrowUpRight
                      className={`h-5 w-5 shrink-0 transition-all duration-200 ${
                        isSelected
                          ? 'text-[#e5a93c] opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'
                      }`}
                    />
                  </button>

                  {/* Mobile / Tablet Inline Detail Expansion */}
                  {isSelected && (
                    <div className="pb-6 pl-9 sm:pl-14 pr-2 lg:hidden">
                      <p className="text-sm leading-relaxed text-[#d4d4d8]">
                        {service.summary}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono-tabular text-xs text-[#a1a1aa]">
                        {service.scope.map((item, sIdx) => (
                          <span key={item}>
                            {item}
                            {sIdx < service.scope.length - 1 ? ' · ' : ''}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onSelectServiceForProject(service.projectTypeOption)
                        }
                        className="mt-5 inline-flex min-h-[44px] items-center gap-2 bg-[#e5a93c] px-5 py-2.5 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer"
                      >
                        <span>SCOPE THIS SERVICE</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Synchronized Architectural Detail Pane */}
          <div className="hidden lg:block lg:col-span-5">
            <div
              key={current.id}
              className="flex h-full flex-col justify-between border border-white/10 bg-[#111114] p-10"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-mono-tabular text-xs tracking-[0.18em] text-[#e5a93c]">
                    DISCIPLINE {current.index}
                  </span>
                  <span className="font-mono-tabular text-xs text-[#71717a]">
                    R &amp; L STUDIO
                  </span>
                </div>

                <h3 className="mt-6 font-display text-3xl font-semibold tracking-tight text-[#f4f4f0]">
                  {current.name}
                </h3>

                <p className="mt-4 text-base leading-relaxed text-[#d4d4d8]">
                  {current.summary}
                </p>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <span className="block font-mono-tabular text-[11px] tracking-[0.18em] text-[#71717a]">
                    CORE FOCUS AREAS
                  </span>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {current.scope.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm text-[#f4f4f0]"
                      >
                        <span
                          aria-hidden="true"
                          className="h-[1px] w-4 bg-[#e5a93c]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() => onSelectServiceForProject(current.projectTypeOption)}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 bg-[#e5a93c] px-5 py-3 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer"
                >
                  <span>START A {current.name.toUpperCase()} PROJECT</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
