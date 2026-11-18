import { useState } from 'react';
import { STUDIO_HERO_IMAGE } from '../data/studioData';
import { useInView } from '../hooks/useInView';

const PRINCIPLES = [
  {
    index: '01',
    title: 'Product Thinking',
    copy: 'We evaluate every feature against user clarity and operational purpose before committing engineering time.',
  },
  {
    index: '02',
    title: 'Architectural Design',
    copy: 'Typography, motion, and spatial hierarchy are treated as structural engineering—never surface decoration.',
  },
  {
    index: '03',
    title: 'Precision Engineering',
    copy: 'Modular codebases, responsive frame budgets, and clean contracts built to evolve beyond version one.',
  },
];

export function StudioSection() {
  const { ref, visible } = useInView(0.08);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section
      ref={ref}
      id="studio"
      aria-labelledby="studio-heading"
      className={`relative border-t border-white/10 bg-[#0b0b0e] py-20 sm:py-28 lg:py-36 reveal-section ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#e5a93c]">
              04 · THE STUDIO
            </p>
            <h2
              id="studio-heading"
              className="mt-4 font-display text-[clamp(1.9rem,4.4vw,4rem)] font-semibold leading-[1.03] tracking-[-0.028em] text-[#f4f4f0]"
              style={{ textWrap: 'balance' }}
            >
              WE BUILD THINGS PEOPLE REMEMBER.
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-sm sm:text-lg leading-relaxed text-[#d4d4d8]">
              R &amp; L Studio combines product thinking, design and engineering to
              turn ambitious ideas into usable digital products.
            </p>
          </div>
        </div>

        {/* Full-Width Architectural Studio Frame */}
        <div className="relative mt-10 sm:mt-14 aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden border border-white/10 bg-[#111114]">
          {!imgFailed ? (
            <img
              src={STUDIO_HERO_IMAGE}
              alt="R & L Studio architectural workspace"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#141418] to-[#08080a] p-12 text-center">
              <span className="font-display text-2xl tracking-[0.22em] text-[#f4f4f0]">
                R &amp; L STUDIO
              </span>
            </div>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08080a]/80 via-transparent to-transparent"
          />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            <span className="font-mono-tabular text-[10px] sm:text-xs tracking-[0.16em] text-[#f4f4f0]">
              R &amp; L STUDIO · PRODUCT ARCHITECTURE
            </span>
            <span className="font-mono-tabular text-[10px] sm:text-xs tracking-[0.14em] text-[#e5a93c]">
              DESIGN + SYSTEMS + SOFTWARE
            </span>
          </div>
        </div>

        {/* Three Editorial Pillars */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 divide-y divide-white/10 border-t border-b border-white/10 md:grid-cols-3 md:divide-y-0 md:divide-x">
          {PRINCIPLES.map((item) => (
            <div key={item.index} className="py-7 sm:py-8 md:px-8 first:md:pl-0 last:md:pr-0">
              <span className="font-mono-tabular text-xs tracking-[0.18em] text-[#e5a93c]">
                {item.index}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-[#f4f4f0]">
                {item.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#a1a1aa]">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
