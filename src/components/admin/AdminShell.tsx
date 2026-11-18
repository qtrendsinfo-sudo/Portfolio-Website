import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type AdminSection =
  | 'overview'
  | 'projects'
  | 'project-new'
  | 'project-edit'
  | 'inquiries';

interface AdminShellProps {
  activeSection: AdminSection;
  breadcrumb: string;
  onNavigate: (path: string) => void;
  toast?: { type: 'success' | 'error'; message: string } | null;
  onDismissToast?: () => void;
  children: ReactNode;
}

const SIDEBAR_ITEMS: {
  id: 'overview' | 'projects' | 'inquiries';
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: 'overview', label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { id: 'inquiries', label: 'Inquiries', path: '/admin/inquiries', icon: Inbox },
];

export function AdminShell({
  activeSection,
  breadcrumb,
  onNavigate,
  toast,
  onDismissToast,
  children,
}: AdminShellProps) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const normalizedNav =
    activeSection === 'project-new' || activeSection === 'project-edit'
      ? 'projects'
      : activeSection;

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await signOut();
    onNavigate('/login');
  };

  const renderNavContent = () => (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Block */}
        <div className="border-b border-white/10 px-6 py-5">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate('/');
            }}
            className="font-display text-lg font-semibold tracking-[0.22em] text-[#f4f4f0] hover:text-[#e5a93c] transition-colors whitespace-nowrap"
          >
            R &amp; L
          </a>
          <p className="mt-1 font-mono-tabular text-[10px] tracking-[0.18em] text-[#71717a]">
            STUDIO ADMIN CONSOLE
          </p>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Admin sidebar navigation" className="px-3 py-5 flex flex-col gap-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = normalizedNav === item.id;
            return (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  onNavigate(item.path);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[44px] items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border border-[#e5a93c]/40 bg-[#e5a93c]/10 text-[#e5a93c]'
                    : 'border border-transparent text-[#a1a1aa] hover:bg-white/[0.03] hover:text-[#f4f4f0]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}

          <div className="my-3 border-t border-white/10" />

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate('/');
            }}
            className="flex min-h-[42px] items-center justify-between px-3.5 py-2 font-mono-tabular text-xs tracking-[0.12em] text-[#a1a1aa] hover:text-[#e5a93c] transition-colors whitespace-nowrap"
          >
            <span>PUBLIC WEBSITE</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </nav>
      </div>

      {/* Admin Identity & Logout */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 px-2">
          <p className="font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
            SIGNED IN AS
          </p>
          <p className="mt-1 truncate text-xs font-medium text-[#f4f4f0]">
            {user?.displayName || 'Studio Admin'}
          </p>
          <p className="truncate font-mono-tabular text-[11px] text-[#a1a1aa]">
            {user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex min-h-[42px] w-full items-center justify-center gap-2 border border-white/15 bg-[#08080a] px-4 py-2 font-mono-tabular text-xs tracking-[0.14em] text-[#d4d4d8] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors cursor-pointer whitespace-nowrap"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f4f4f0] lg:flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-[260px] lg:shrink-0 lg:border-r lg:border-white/10 lg:bg-[#0d0d10]">
        <div className="sticky top-0 h-screen overflow-y-auto">
          {renderNavContent()}
        </div>
      </aside>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation menu"
          className="fixed inset-0 z-50 flex lg:hidden"
        >
          <div
            className="fixed inset-0 bg-black/75"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-white/15 bg-[#0d0d10]">
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center border border-white/15 text-[#a1a1aa] hover:text-[#f4f4f0] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            {renderNavContent()}
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Contextual Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-[#08080a]/95 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open admin menu"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center border border-white/15 bg-[#111114] text-[#f4f4f0] hover:border-[#e5a93c] lg:hidden cursor-pointer shrink-0"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <p className="truncate font-mono-tabular text-xs tracking-[0.14em] text-[#a1a1aa]">
                <span className="text-[#e5a93c]">ADMIN</span>
                <span className="mx-2 text-[#52525b]">/</span>
                <span className="text-[#f4f4f0]">{breadcrumb}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeSection === 'project-new' || activeSection === 'project-edit' ? (
              <button
                type="button"
                onClick={() => onNavigate('/admin/projects')}
                className="inline-flex min-h-[38px] items-center border border-white/15 px-4 py-2 font-mono-tabular text-xs tracking-[0.12em] text-[#d4d4d8] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors cursor-pointer whitespace-nowrap"
              >
                ALL PROJECTS
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('/admin/projects/new')}
                className="inline-flex min-h-[38px] items-center gap-2 bg-[#e5a93c] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>NEW PROJECT</span>
              </button>
            )}
          </div>
        </header>

        {/* Feedback Toast Banner */}
        {toast && (
          <div className="mx-5 mt-5 sm:mx-8">
            <div
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={`flex items-center justify-between gap-4 border px-4 py-3 text-xs ${
                toast.type === 'error'
                  ? 'border-rose-400/40 bg-rose-950/30 text-rose-200'
                  : 'border-[#e5a93c]/40 bg-[#e5a93c]/10 text-[#f4f4f0]'
              }`}
            >
              <span>{toast.message}</span>
              {onDismissToast && (
                <button
                  type="button"
                  onClick={onDismissToast}
                  aria-label="Dismiss notification"
                  className="text-[#a1a1aa] hover:text-[#f4f4f0] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
