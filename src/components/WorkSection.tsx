import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Edit3,
  MonitorSmartphone,
  Settings,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { INITIAL_PROJECTS, type StudioProject } from '../data/projects';
import { useInView } from '../hooks/useInView';
import { fetchPublishedProjects } from '../lib/firestoreService';

interface WorkSectionProps {
  onNavigate?: (path: string) => void;
}

interface ProjectMediaFrameProps {
  project: StudioProject;
  reversed: boolean;
}

function ProjectMediaFrame({ project, reversed }: ProjectMediaFrameProps) {
  const [activeShotIdx, setActiveShotIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'studio' | 'device'>('studio');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

  const activeShot = project.gallery[activeShotIdx] ?? project.gallery[0];
  const displaySrc = activeShot?.imageUrl || project.featuredImage;

  useEffect(() => {
    setImgError(false);
  }, [displaySrc]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -ny * 3.5, y: nx * 4.5 });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className={`flex flex-col gap-4 ${reversed ? 'lg:order-1' : 'lg:order-2'}`}>
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="group relative aspect-[4/3] w-full overflow-hidden border border-white/10 bg-[#111114] transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {viewMode === 'studio' ? (
          displaySrc && !imgError ? (
            <img
              src={displaySrc}
              alt={`${project.title} — ${activeShot?.label || 'Product showcase'}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#141418] to-[#0a0a0d] p-6 sm:p-8 text-center">
              <Smartphone className="h-8 w-8 text-[#e5a93c]/70" />
              <p className="font-display text-lg font-medium text-[#f4f4f0]">
                {project.title}
              </p>
              <p className="max-w-xs font-mono-tabular text-xs text-[#71717a]">
                {activeShot?.caption || 'Product visual presentation'}
              </p>
            </div>
          )
        ) : (
          /* Precision Hardware Device Mockup Frame */
          <div className="flex h-full w-full items-center justify-center bg-[#09090c] bg-arch-grid p-4 sm:p-8">
            <div className="relative flex h-full max-h-[340px] w-[176px] sm:w-[196px] flex-col overflow-hidden rounded-[26px] border-[3px] border-[#2e2e36] bg-[#08080a] p-2 shadow-2xl">
              {/* Speaker notch */}
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-[#24242a]" />
              <div className="relative flex-1 overflow-hidden rounded-[18px] border border-white/10 bg-[#111114]">
                {displaySrc && !imgError ? (
                  <img
                    src={displaySrc}
                    alt={`${project.title} mobile device frame`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                    <Smartphone className="h-6 w-6 text-[#e5a93c]" />
                    <span className="font-display text-sm font-medium text-[#f4f4f0]">
                      {project.title}
                    </span>
                    <span className="font-mono-tabular text-[10px] text-[#71717a]">
                      SCREEN SLOT
                    </span>
                  </div>
                )}
              </div>
              {/* Home indicator */}
              <div className="mx-auto mt-2 h-1 w-14 rounded-full bg-white/25" />
            </div>
          </div>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08080a]/85 via-transparent to-transparent"
        />

        <div className="absolute bottom-3.5 left-4 right-4 sm:bottom-4 sm:left-5 sm:right-5 flex items-center justify-between gap-4">
          <span className="font-mono-tabular text-[10px] sm:text-[11px] tracking-[0.16em] text-[#f4f4f0]/90 truncate">
            {activeShot?.label || 'PRIMARY VIEW'}
          </span>
          <span className="font-mono-tabular text-[10px] sm:text-[11px] tracking-[0.14em] text-[#a1a1aa] shrink-0">
            {String(activeShotIdx + 1).padStart(2, '0')} /{' '}
            {String(Math.max(project.gallery.length, 1)).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Presentation Mode & Screenshot Slot Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {project.gallery.map((shot, idx) => (
            <button
              key={shot.id}
              type="button"
              onClick={() => setActiveShotIdx(idx)}
              className={`min-h-[36px] border px-3 py-1.5 font-mono-tabular text-[11px] tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                idx === activeShotIdx
                  ? 'border-[#e5a93c] bg-[#e5a93c]/10 text-[#e5a93c]'
                  : 'border-white/10 bg-[#111114] text-[#a1a1aa] hover:border-white/25 hover:text-[#f4f4f0]'
              }`}
            >
              {shot.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setViewMode((m) => (m === 'studio' ? 'device' : 'studio'))}
          className="inline-flex min-h-[36px] items-center gap-1.5 border border-white/10 bg-[#111114] px-3 py-1.5 font-mono-tabular text-[11px] tracking-[0.12em] text-[#a1a1aa] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <MonitorSmartphone className="h-3.5 w-3.5" />
          <span>{viewMode === 'studio' ? 'DEVICE FRAME' : 'STUDIO VIEW'}</span>
        </button>
      </div>
    </div>
  );
}

export function WorkSection({ onNavigate }: WorkSectionProps) {
  const { ref, visible } = useInView(0.08);
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<StudioProject[]>(INITIAL_PROJECTS);

  useEffect(() => {
    let active = true;
    void fetchPublishedProjects()
      .then((remote) => {
        if (!active) return;
        if (remote && remote.length > 0) {
          setProjects(remote.filter((p) => p.published));
        } else {
          setProjects(INITIAL_PROJECTS.filter((p) => p.published));
        }
      })
      .catch(() => {
        if (active) {
          setProjects(INITIAL_PROJECTS.filter((p) => p.published));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const scrollToProject = (id: string) => {
    const target = document.getElementById(`project-${id}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      ref={ref}
      id="work"
      aria-labelledby="work-heading"
      className={`relative border-t border-white/10 bg-[#08080a] py-20 sm:py-28 lg:py-36 reveal-section ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#e5a93c]">
              01 · PORTFOLIO
            </p>
            <h2
              id="work-heading"
              className="mt-3 font-display text-[clamp(1.85rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-[#f4f4f0]"
            >
              SELECTED WORK
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Project Index Jump Links */}
            <div className="flex flex-wrap items-center gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => scrollToProject(p.id)}
                  className="min-h-[38px] border border-white/10 bg-[#111114] px-3 py-1.5 font-mono-tabular text-[11px] tracking-[0.12em] text-[#a1a1aa] hover:border-[#e5a93c] hover:text-[#f4f4f0] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span className="text-[#e5a93c] mr-1.5">{p.index}</span>
                  {p.title.toUpperCase()}
                </button>
              ))}
            </div>

            {isAdmin && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/admin/projects')}
                className="inline-flex min-h-[38px] items-center gap-2 border border-[#e5a93c]/40 bg-[#e5a93c]/10 px-3.5 py-1.5 font-mono-tabular text-[11px] tracking-[0.12em] text-[#e5a93c] hover:bg-[#e5a93c] hover:text-[#08080a] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>MANAGE PORTFOLIO</span>
              </button>
            )}
          </div>
        </div>

        {/* Cinematic Case-Study Presentations */}
        <div className="divide-y divide-white/10">
          {projects.map((project, idx) => {
            const reversed = idx % 2 === 1;
            const populatedLinks = project.storeLinks.filter(
              (s) => Boolean(s.url && s.url.trim().length > 0),
            );
            const fallbackLinks =
              populatedLinks.length > 0 ? populatedLinks : project.storeLinks;

            return (
              <article
                id={`project-${project.id}`}
                key={project.id}
                className="scroll-mt-20 grid grid-cols-1 items-center gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-14 lg:py-24"
              >
                {/* Media Showcase Column */}
                <div className={`lg:col-span-7 ${reversed ? 'lg:order-1' : 'lg:order-2'}`}>
                  <ProjectMediaFrame project={project} reversed={reversed} />
                </div>

                {/* Editorial Case-Study Column */}
                <div
                  className={`flex flex-col justify-between lg:col-span-5 ${
                    reversed ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div>
                    {/* Clean unboxed typographic metadata */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-xs tracking-[0.14em] text-[#a1a1aa]">
                      <span className="text-[#e5a93c]">{project.index}</span>
                      <span aria-hidden="true">/</span>
                      <span>{project.category || 'Digital Product'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.year || '2026'}</span>
                      {project.status && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{project.status}</span>
                        </>
                      )}
                    </div>

                    <h3 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.025em] text-[#f4f4f0]">
                      {project.title}
                    </h3>

                    <p className="mt-2 font-mono-tabular text-xs tracking-[0.14em] text-[#a1a1aa]">
                      {project.subtitle}
                    </p>

                    <p className="mt-6 text-sm sm:text-base leading-relaxed text-[#d4d4d8]">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="mt-8 border-t border-white/10 pt-5">
                      <span className="block font-mono-tabular text-[11px] tracking-[0.18em] text-[#71717a]">
                        TECHNOLOGIES
                      </span>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-[#f4f4f0]">
                        {project.technologies.length > 0 ? (
                          project.technologies.map((tech, tIdx) => (
                            <span key={`${tech}-${tIdx}`} className="inline-flex items-center gap-3">
                              <span>{tech}</span>
                              {tIdx < project.technologies.length - 1 && (
                                <span aria-hidden="true" className="text-[#71717a]">
                                  ·
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#71717a]">Custom Technology Stack</span>
                        )}
                      </div>
                    </div>

                    {/* Store Distribution Links */}
                    {fallbackLinks.length > 0 && (
                      <div className="mt-6 border-t border-white/10 pt-5">
                        <span className="block font-mono-tabular text-[11px] tracking-[0.18em] text-[#71717a]">
                          DISTRIBUTION &amp; STORE LINKS
                        </span>
                        <div className="mt-3 flex flex-wrap items-center gap-2.5">
                          {fallbackLinks.map((store) => {
                            const hasUrl = Boolean(
                              store.url && store.url.trim().length > 0,
                            );
                            return hasUrl ? (
                              <a
                                key={store.platform}
                                href={store.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-[42px] items-center gap-2 border border-[#e5a93c]/50 bg-[#e5a93c]/10 px-4 py-2 font-mono-tabular text-xs tracking-[0.1em] text-[#e5a93c] hover:bg-[#e5a93c] hover:text-[#08080a] transition-colors whitespace-nowrap shrink-0"
                              >
                                <span>{store.platform}</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <span
                                key={store.platform}
                                className="inline-flex min-h-[42px] items-center gap-2 border border-white/10 bg-[#111114] px-3.5 py-2 font-mono-tabular text-xs tracking-[0.1em] text-[#71717a] whitespace-nowrap shrink-0"
                              >
                                <span>{store.platform}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verified Admin Direct Edit Shortcut */}
                  {isAdmin && onNavigate && (
                    <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/admin/projects/${project.id}/edit`)}
                        className="inline-flex min-h-[40px] items-center gap-2 text-xs font-mono-tabular tracking-[0.14em] text-[#a1a1aa] hover:text-[#e5a93c] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>EDIT IN ADMIN</span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
