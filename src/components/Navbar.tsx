import { useEffect, useState } from 'react';
import { LogOut, Menu, Shield, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onStartProject: () => void;
  onNavigate: (path: string) => void;
}

const NAV_LINKS = [
  { label: 'WORK', href: '#work', id: 'work' },
  { label: 'STUDIO', href: '#studio', id: 'studio' },
  { label: 'PROCESS', href: '#process', id: 'process' },
  { label: 'CONTACT', href: '#contact', id: 'contact' },
];

export function Navbar({ onStartProject, onNavigate }: NavbarProps) {
  const { user, status, isAdmin, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 32);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLinkClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const accountLabel =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'ACCOUNT';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
          scrolled || mobileOpen
            ? 'bg-[#08080a]/95 border-b border-white/10'
            : 'bg-gradient-to-b from-[#08080a]/85 via-[#08080a]/40 to-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-6 md:px-12">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display text-base sm:text-lg font-semibold tracking-[0.24em] text-[#f4f4f0] hover:text-[#e5a93c] transition-colors whitespace-nowrap shrink-0"
          >
            R &amp; L
          </a>

          {/* Zone 2: Clean Typography Nav Links */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7 lg:gap-9">
            {NAV_LINKS.map((link) => {
              const isActive = activeId === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative py-1.5 text-xs font-medium tracking-[0.18em] transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#f4f4f0]'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f0]'
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-0 h-[1px] w-full origin-left bg-[#e5a93c] transition-transform duration-200 ease-out ${
                      isActive
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Auth Access + Primary CTA + Mobile Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/admin');
                }}
                className="hidden lg:inline-flex min-h-[40px] items-center gap-1.5 border border-[#e5a93c]/45 bg-[#e5a93c]/10 px-3.5 py-2 font-mono-tabular text-[11px] tracking-[0.14em] text-[#e5a93c] hover:bg-[#e5a93c] hover:text-[#08080a] transition-colors whitespace-nowrap shrink-0"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>ADMIN</span>
              </a>
            )}

            {status === 'authenticated' && user ? (
              <div className="hidden lg:flex items-center gap-2">
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/login');
                  }}
                  title={user.email || 'Signed in account'}
                  className="inline-flex min-h-[40px] items-center gap-1.5 border border-white/15 bg-[#111114]/90 px-3.5 py-2 font-mono-tabular text-[11px] tracking-[0.12em] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors whitespace-nowrap shrink-0"
                >
                  <UserIcon className="h-3.5 w-3.5 text-[#e5a93c]" />
                  <span className="max-w-[110px] truncate uppercase">{accountLabel}</span>
                </a>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  aria-label="Sign out"
                  title="Sign out"
                  className="inline-flex h-[40px] w-[40px] items-center justify-center border border-white/15 bg-[#111114]/90 text-[#a1a1aa] hover:border-white/30 hover:text-[#f4f4f0] transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/login');
                }}
                className="hidden sm:inline-flex min-h-[40px] items-center justify-center border border-white/15 px-4 py-2 font-mono-tabular text-[11px] tracking-[0.14em] text-[#d4d4d8] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors whitespace-nowrap shrink-0"
              >
                {status === 'initializing' ? 'SESSION...' : 'SIGN IN'}
              </a>
            )}

            <button
              type="button"
              onClick={onStartProject}
              className="hidden sm:inline-flex min-h-[40px] items-center justify-center bg-[#e5a93c] px-5 py-2 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              START A PROJECT
            </button>

            <button
              type="button"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex md:hidden h-11 w-11 items-center justify-center border border-white/15 bg-[#111114] text-[#f4f4f0] hover:border-[#e5a93c] transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-30 flex flex-col justify-between bg-[#08080a] px-6 pt-24 pb-8 md:hidden overflow-y-auto"
        >
          <nav aria-label="Mobile links" className="flex flex-col border-t border-white/10">
            {NAV_LINKS.map((link, idx) => {
              const isActive = activeId === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  className={`flex min-h-[56px] items-center justify-between border-b border-white/10 py-4 font-display text-2xl font-medium tracking-tight transition-colors ${
                    isActive
                      ? 'text-[#e5a93c]'
                      : 'text-[#f4f4f0] active:text-[#e5a93c]'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="font-mono-tabular text-xs text-[#71717a]">
                    0{idx + 1}
                  </span>
                </a>
              );
            })}
          </nav>

          <div className="mt-8 flex flex-col gap-3">
            {isAdmin && (
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  onNavigate('/admin');
                }}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 border border-[#e5a93c]/50 bg-[#e5a93c]/10 py-3 font-mono-tabular text-xs tracking-[0.16em] text-[#e5a93c]"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>ADMIN DASHBOARD</span>
              </a>
            )}

            {status === 'authenticated' && user ? (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    onNavigate('/login');
                  }}
                  className="flex min-h-[48px] flex-1 items-center justify-center gap-2 border border-white/20 px-4 py-3 font-mono-tabular text-xs tracking-[0.14em] text-[#f4f4f0]"
                >
                  <UserIcon className="h-3.5 w-3.5 text-[#e5a93c]" />
                  <span className="truncate">{user.displayName || user.email}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void signOut();
                  }}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 border border-white/15 px-4 py-3 font-mono-tabular text-xs tracking-[0.12em] text-[#a1a1aa] cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>SIGN OUT</span>
                </button>
              </div>
            ) : (
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  onNavigate('/login');
                }}
                className="flex min-h-[48px] w-full items-center justify-center border border-white/20 py-3 font-mono-tabular text-xs tracking-[0.16em] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors"
              >
                CLIENT SIGN IN
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onStartProject();
              }}
              className="min-h-[48px] w-full bg-[#e5a93c] py-3.5 text-xs font-semibold tracking-[0.16em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer"
            >
              START A PROJECT
            </button>
            <p className="mt-1 font-mono-tabular text-[11px] tracking-[0.14em] text-[#71717a]">
              R &amp; L STUDIO · DIGITAL EXPERIENCES
            </p>
          </div>
        </div>
      )}
    </>
  );
}
