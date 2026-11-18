import { useState } from 'react';
import { Compass, Minus, Plus, SlidersHorizontal } from 'lucide-react';
import { STUDIO_LOCATION_CONFIG } from '../data/studioData';
import { useInView } from '../hooks/useInView';

export function LocationMapSection() {
  const { ref, visible } = useInView(0.08);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editingLocation, setEditingLocation] = useState(false);
  const [regionLabel, setRegionLabel] = useState(
    STUDIO_LOCATION_CONFIG.regionPlaceholder,
  );
  const [coordinates, setCoordinates] = useState(
    STUDIO_LOCATION_CONFIG.coordinatesLabel,
  );

  return (
    <section
      ref={ref}
      aria-labelledby="location-heading"
      className={`relative border-t border-white/10 bg-[#08080a] py-20 sm:py-24 reveal-section ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 border border-white/10 bg-[#111114] lg:grid-cols-12">
          {/* Configurable Placeholder Location Metadata */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-5 lg:border-r lg:border-white/10">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono-tabular text-[11px] tracking-[0.18em] text-[#e5a93c]">
                  PLACEHOLDER CONFIGURATION
                </p>
                <button
                  type="button"
                  onClick={() => setEditingLocation((v) => !v)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-white/15 px-2.5 py-1 font-mono-tabular text-[10px] tracking-[0.12em] text-[#a1a1aa] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>{editingLocation ? 'DONE' : 'CONFIGURE'}</span>
                </button>
              </div>

              <h2
                id="location-heading"
                className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#f4f4f0]"
              >
                {regionLabel}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
                {STUDIO_LOCATION_CONFIG.operatingMode}
              </p>

              {editingLocation && (
                <div className="mt-5 flex flex-col gap-3 border border-white/10 bg-[#08080a] p-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono-tabular text-[10px] tracking-[0.14em] text-[#a1a1aa]">
                      LOCATION LABEL
                    </span>
                    <input
                      type="text"
                      value={regionLabel}
                      onChange={(e) => setRegionLabel(e.target.value)}
                      className="border border-white/15 bg-[#111114] px-3 py-2 text-xs text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono-tabular text-[10px] tracking-[0.14em] text-[#a1a1aa]">
                      COORDINATE STRING
                    </span>
                    <input
                      type="text"
                      value={coordinates}
                      onChange={(e) => setCoordinates(e.target.value)}
                      className="border border-white/15 bg-[#111114] px-3 py-2 font-mono-tabular text-xs text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="mt-8 sm:mt-10 flex flex-col gap-4 border-t border-white/10 pt-6">
              <div>
                <span className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#71717a]">
                  COORDINATE PLACEHOLDER
                </span>
                <span className="mt-1 block font-mono-tabular text-sm text-[#f4f4f0]">
                  {coordinates}
                </span>
              </div>
              <p className="font-mono-tabular text-xs leading-relaxed text-[#71717a]">
                {STUDIO_LOCATION_CONFIG.note}
              </p>
            </div>
          </div>

          {/* Dark Architectural Coordinate Grid Map */}
          <div className="relative min-h-[280px] sm:min-h-[340px] overflow-hidden bg-[#08080a] lg:col-span-7">
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox="0 0 800 440"
                className="h-full w-full"
                aria-label="Configurable studio coordinate grid map placeholder"
              >
                <defs>
                  <pattern
                    id="rl-map-grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="800" height="440" fill="url(#rl-map-grid)" />

                <circle
                  cx="400"
                  cy="220"
                  r="175"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <circle
                  cx="400"
                  cy="220"
                  r="115"
                  fill="none"
                  stroke="rgba(229,169,60,0.28)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <circle
                  cx="400"
                  cy="220"
                  r="48"
                  fill="rgba(229,169,60,0.06)"
                  stroke="rgba(229,169,60,0.55)"
                  strokeWidth="1"
                />

                <line
                  x1="0"
                  y1="220"
                  x2="800"
                  y2="220"
                  stroke="rgba(255,255,255,0.08)"
                />
                <line
                  x1="400"
                  y1="0"
                  x2="400"
                  y2="440"
                  stroke="rgba(255,255,255,0.08)"
                />

                <rect x="394" y="214" width="12" height="12" fill="#e5a93c" />
                <text
                  x="418"
                  y="224"
                  fill="#f4f4f0"
                  fontSize="12"
                  fontFamily="IBM Plex Mono, monospace"
                  letterSpacing="2"
                >
                  {regionLabel.toUpperCase()}
                </text>
              </svg>
            </div>

            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 border border-white/15 bg-[#111114] p-1">
              <button
                type="button"
                aria-label="Zoom out coordinate grid"
                onClick={() => setZoomLevel((z) => Math.max(0.85, +(z - 0.15).toFixed(2)))}
                className="flex h-9 w-9 items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f0] cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Reset coordinate grid zoom"
                onClick={() => setZoomLevel(1)}
                className="flex h-9 w-9 items-center justify-center text-[#e5a93c] hover:text-[#f0ba54] cursor-pointer"
              >
                <Compass className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Zoom in coordinate grid"
                onClick={() => setZoomLevel((z) => Math.min(1.45, +(z + 0.15).toFixed(2)))}
                className="flex h-9 w-9 items-center justify-center text-[#a1a1aa] hover:text-[#f4f4f0] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
