import { ArrowRight, ArrowUpRight, Database, FolderKanban, Inbox } from 'lucide-react';
import { INITIAL_PROJECTS, type StudioProject } from '../../data/projects';
import { type AdminInquiryRecord } from '../../lib/firestoreService';

interface AdminOverviewProps {
  projects: StudioProject[];
  inquiries: AdminInquiryRecord[];
  loading: boolean;
  error: string | null;
  seeding: boolean;
  onRetry: () => void;
  onSeedInitial: () => Promise<void>;
  onNavigate: (path: string) => void;
}

function formatDateShort(date: Date | null): string {
  if (!date) return 'Pending timestamp';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function AdminOverview({
  projects,
  inquiries,
  loading,
  error,
  seeding,
  onRetry,
  onSeedInitial,
  onNavigate,
}: AdminOverviewProps) {
  const totalProjects = projects.length;
  const publishedProjects = projects.filter((p) => p.published).length;
  const draftProjects = totalProjects - publishedProjects;
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;

  const metrics = [
    { label: 'Total Projects', value: totalProjects, accent: false },
    { label: 'Published Projects', value: publishedProjects, accent: true },
    { label: 'Draft / Unpublished', value: draftProjects, accent: false },
    { label: 'Total Inquiries', value: totalInquiries, accent: false },
    { label: 'New Inquiries', value: newInquiries, accent: newInquiries > 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono-tabular text-xs tracking-[0.2em] text-[#e5a93c]">
            STUDIO TELEMETRY
          </p>
          <h1
            className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#f4f4f0]"
            style={{ textWrap: 'balance' }}
          >
            Portfolio &amp; Inquiry Overview
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!loading && projects.length === 0 && (
            <button
              type="button"
              disabled={seeding}
              onClick={() => void onSeedInitial()}
              className="inline-flex min-h-[40px] items-center gap-2 border border-[#e5a93c]/50 bg-[#e5a93c]/10 px-4 py-2 font-mono-tabular text-xs tracking-[0.12em] text-[#e5a93c] hover:bg-[#e5a93c] hover:text-[#08080a] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Database className="h-3.5 w-3.5" />
              <span>
                {seeding
                  ? 'SEEDING PROJECTS...'
                  : `SEED INITIAL (${INITIAL_PROJECTS.length})`}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="inline-flex min-h-[40px] items-center border border-white/15 px-4 py-2 font-mono-tabular text-xs tracking-[0.12em] text-[#a1a1aa] hover:border-white/30 hover:text-[#f4f4f0] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            {loading ? 'SYNCING...' : 'REFRESH DATA'}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 border border-rose-400/40 bg-rose-950/30 p-4 text-xs text-rose-200"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="border border-rose-300/40 px-3 py-1.5 font-mono-tabular text-[11px] hover:bg-rose-400/20 cursor-pointer"
          >
            RETRY
          </button>
        </div>
      )}

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border border-white/10 bg-[#111114] p-5 flex flex-col justify-between gap-4"
          >
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa] uppercase">
              {metric.label}
            </span>
            {loading ? (
              <div className="h-9 w-16 animate-pulse bg-white/10" />
            ) : (
              <span
                className={`font-display text-3xl sm:text-4xl font-semibold tabular-nums ${
                  metric.accent ? 'text-[#e5a93c]' : 'text-[#f4f4f0]'
                }`}
              >
                {metric.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Split Summary Panels */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Projects Snapshot */}
        <section className="border border-white/10 bg-[#111114] p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <FolderKanban className="h-4 w-4 text-[#e5a93c]" />
              <h2 className="font-display text-lg font-semibold text-[#f4f4f0]">
                Portfolio Projects
              </h2>
            </div>
            <a
              href="/admin/projects"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/admin/projects');
              }}
              className="inline-flex items-center gap-1.5 font-mono-tabular text-[11px] tracking-[0.12em] text-[#e5a93c] hover:underline whitespace-nowrap"
            >
              <span>MANAGE</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {loading ? (
            <div className="mt-5 flex flex-col gap-3">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-12 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#a1a1aa]">
                No Firestore projects recorded yet.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/projects/new')}
                  className="bg-[#e5a93c] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#08080a] hover:bg-[#f0ba54] cursor-pointer"
                >
                  ADD PROJECT
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {projects.slice(0, 5).map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#f4f4f0]">
                      <span className="mr-2 font-mono-tabular text-xs text-[#e5a93c]">
                        {project.index}
                      </span>
                      {project.title}
                    </p>
                    <p className="mt-0.5 truncate font-mono-tabular text-[11px] text-[#71717a]">
                      {project.category} · {project.published ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/admin/projects/${project.id}/edit`)}
                    className="inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 font-mono-tabular text-[11px] text-[#d4d4d8] hover:border-[#e5a93c] hover:text-[#e5a93c] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>EDIT</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Latest Inquiries Snapshot */}
        <section className="border border-white/10 bg-[#111114] p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Inbox className="h-4 w-4 text-[#e5a93c]" />
              <h2 className="font-display text-lg font-semibold text-[#f4f4f0]">
                Recent Inquiries
              </h2>
            </div>
            <a
              href="/admin/inquiries"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/admin/inquiries');
              }}
              className="inline-flex items-center gap-1.5 font-mono-tabular text-[11px] tracking-[0.12em] text-[#e5a93c] hover:underline whitespace-nowrap"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {loading ? (
            <div className="mt-5 flex flex-col gap-3">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-12 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#a1a1aa]">
                No client project inquiries submitted yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {inquiries.slice(0, 5).map((inquiry) => (
                <li
                  key={inquiry.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#f4f4f0]">
                      {inquiry.name}
                      {inquiry.company ? (
                        <span className="text-[#a1a1aa]"> · {inquiry.company}</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 truncate font-mono-tabular text-[11px] text-[#71717a]">
                      {inquiry.projectType} ·{' '}
                      <span
                        className={
                          inquiry.status === 'new'
                            ? 'text-[#e5a93c]'
                            : 'text-[#a1a1aa]'
                        }
                      >
                        {inquiry.status.toUpperCase()}
                      </span>{' '}
                      · {formatDateShort(inquiry.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('/admin/inquiries')}
                    className="inline-flex items-center gap-1 border border-white/10 px-3 py-1.5 font-mono-tabular text-[11px] text-[#d4d4d8] hover:border-[#e5a93c] hover:text-[#e5a93c] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>INSPECT</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
