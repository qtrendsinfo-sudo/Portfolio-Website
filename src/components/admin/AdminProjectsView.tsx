import { useMemo, useState } from 'react';
import {
  Database,
  Edit3,
  Eye,
  EyeOff,
  FolderKanban,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { INITIAL_PROJECTS, type StudioProject } from '../../data/projects';
import { ConfirmDialog } from '../ConfirmDialog';

type PublishFilter = 'all' | 'published' | 'draft';

interface AdminProjectsViewProps {
  projects: StudioProject[];
  loading: boolean;
  error: string | null;
  seeding: boolean;
  onRetry: () => void;
  onSeedInitial: () => Promise<void>;
  onTogglePublish: (project: StudioProject) => Promise<void>;
  onDeleteProject: (project: StudioProject) => Promise<void>;
  onNavigate: (path: string) => void;
}

export function AdminProjectsView({
  projects,
  loading,
  error,
  seeding,
  onRetry,
  onSeedInitial,
  onTogglePublish,
  onDeleteProject,
  onNavigate,
}: AdminProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PublishFilter>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StudioProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((project) => {
      if (filter === 'published' && !project.published) return false;
      if (filter === 'draft' && project.published) return false;
      if (!q) return true;
      return (
        project.title.toLowerCase().includes(q) ||
        project.slug.toLowerCase().includes(q) ||
        project.category.toLowerCase().includes(q)
      );
    });
  }, [projects, searchQuery, filter]);

  const handleToggle = async (project: StudioProject) => {
    setTogglingId(project.id);
    try {
      await onTogglePublish(project);
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await onDeleteProject(pendingDelete);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const publishedCount = projects.filter((p) => p.published).length;
  const draftCount = projects.length - publishedCount;

  return (
    <div className="mx-auto max-w-6xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono-tabular text-xs tracking-[0.2em] text-[#e5a93c]">
            FIRESTORE PORTFOLIO
          </p>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#f4f4f0]">
            Projects Management
          </h1>
          <p className="mt-1.5 text-sm text-[#a1a1aa]">
            Only published projects appear on the public portfolio. Drafts remain hidden.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!loading && projects.length === 0 && (
            <button
              type="button"
              disabled={seeding}
              onClick={() => void onSeedInitial()}
              className="inline-flex min-h-[42px] items-center gap-2 border border-white/20 bg-[#111114] px-4 py-2 font-mono-tabular text-xs tracking-[0.12em] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Database className="h-3.5 w-3.5" />
              <span>
                {seeding
                  ? 'SEEDING...'
                  : `SEED INITIAL (${INITIAL_PROJECTS.length})`}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('/admin/projects/new')}
            className="inline-flex min-h-[42px] items-center gap-2 bg-[#e5a93c] px-5 py-2 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>ADD NEW PROJECT</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#71717a]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title..."
            aria-label="Search projects by title"
            className="w-full border border-white/15 bg-[#111114] py-2.5 pr-4 pl-10 text-sm text-[#f4f4f0] placeholder:text-[#71717a] focus:border-[#e5a93c] focus:outline-none"
          />
        </div>

        <div
          role="tablist"
          aria-label="Filter projects by publish state"
          className="inline-flex border border-white/10 bg-[#111114] p-1"
        >
          {(
            [
              { id: 'all', label: `All (${projects.length})` },
              { id: 'published', label: `Published (${publishedCount})` },
              { id: 'draft', label: `Drafts (${draftCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`min-h-[34px] px-3.5 py-1.5 font-mono-tabular text-xs tracking-[0.1em] transition-colors cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#e5a93c] text-[#08080a] font-semibold'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
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

      {/* Loading State */}
      {loading ? (
        <div className="border border-white/10 bg-[#111114] divide-y divide-white/10">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-20 animate-pulse bg-white/10" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-44 animate-pulse bg-white/10" />
                  <div className="h-3 w-28 animate-pulse bg-white/5" />
                </div>
              </div>
              <div className="h-9 w-36 animate-pulse bg-white/10" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty Firestore Collection */
        <div className="border border-white/10 bg-[#111114] px-6 py-16 text-center">
          <FolderKanban className="mx-auto h-8 w-8 text-[#e5a93c]/70" />
          <h2 className="mt-4 font-display text-xl font-semibold text-[#f4f4f0]">
            No projects in Firestore yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#a1a1aa]">
            Create a new project from scratch or seed the initial R &amp; L Studio
            portfolio entries (COD Finder and Ipay Finder) into Firestore.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin/projects/new')}
              className="min-h-[42px] bg-[#e5a93c] px-5 py-2 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] cursor-pointer"
            >
              ADD NEW PROJECT
            </button>
            <button
              type="button"
              disabled={seeding}
              onClick={() => void onSeedInitial()}
              className="min-h-[42px] border border-white/20 px-5 py-2 font-mono-tabular text-xs tracking-[0.12em] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] disabled:opacity-50 cursor-pointer"
            >
              {seeding ? 'SEEDING...' : 'SEED COD FINDER & IPAY FINDER'}
            </button>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Filtered Empty State */
        <div className="border border-white/10 bg-[#111114] px-6 py-14 text-center">
          <p className="text-sm text-[#a1a1aa]">
            No projects match your current filter or search term.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilter('all');
            }}
            className="mt-4 border border-white/15 px-4 py-2 font-mono-tabular text-xs text-[#f4f4f0] hover:border-[#e5a93c] cursor-pointer"
          >
            CLEAR FILTERS
          </button>
        </div>
      ) : (
        /* Structured Project Rows */
        <div className="border border-white/10 bg-[#111114] divide-y divide-white/10">
          {filteredProjects.map((project) => {
            const isToggling = togglingId === project.id;
            return (
              <div
                key={project.id}
                className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {/* Thumbnail Preview with Fallback */}
                  <div className="h-14 w-20 shrink-0 overflow-hidden border border-white/10 bg-[#08080a]">
                    {project.featuredImage ? (
                      <img
                        src={project.featuredImage}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono-tabular text-[10px] text-[#71717a]">
                        NO IMG
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11px] text-[#a1a1aa]">
                      <span className="text-[#e5a93c]">{project.index}</span>
                      <span aria-hidden="true">/</span>
                      <span>{project.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.year}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          project.published
                            ? 'text-emerald-400'
                            : 'text-[#71717a]'
                        }
                      >
                        {project.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                    <h2 className="mt-1 truncate font-display text-lg font-semibold text-[#f4f4f0]">
                      {project.title}
                    </h2>
                    <p className="mt-0.5 truncate font-mono-tabular text-[11px] text-[#71717a]">
                      /{project.slug} · {project.technologies.length} tech
                    </p>
                  </div>
                </div>

                {/* Row Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => void handleToggle(project)}
                    className={`inline-flex min-h-[38px] items-center gap-1.5 border px-3.5 py-1.5 font-mono-tabular text-[11px] tracking-[0.1em] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                      project.published
                        ? 'border-white/15 bg-[#08080a] text-[#d4d4d8] hover:border-amber-400/50 hover:text-[#e5a93c]'
                        : 'border-[#e5a93c]/50 bg-[#e5a93c]/10 text-[#e5a93c] hover:bg-[#e5a93c] hover:text-[#08080a]'
                    }`}
                  >
                    {project.published ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>{isToggling ? 'UPDATING...' : 'UNPUBLISH'}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isToggling ? 'UPDATING...' : 'PUBLISH'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/admin/projects/${project.id}/edit`)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 border border-white/15 bg-[#08080a] px-3.5 py-1.5 font-mono-tabular text-[11px] tracking-[0.1em] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>EDIT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendingDelete(project)}
                    aria-label={`Delete ${project.title}`}
                    className="inline-flex min-h-[38px] items-center gap-1.5 border border-white/10 bg-[#08080a] px-3 py-1.5 font-mono-tabular text-[11px] tracking-[0.1em] text-[#a1a1aa] hover:border-rose-400/50 hover:text-rose-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">DELETE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete ? `Delete "${pendingDelete.title}"?` : 'Delete project?'}
        description="This permanently removes the project document from Firestore and cannot be undone."
        confirmLabel="DELETE PROJECT"
        busy={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
