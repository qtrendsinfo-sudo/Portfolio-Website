import { type ReactNode, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  LogOut,
  MailCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthLayoutProps {
  kicker: string;
  title: string;
  subtitle: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
}

export function AuthLayout({
  kicker,
  title,
  subtitle,
  onNavigate,
  children,
}: AuthLayoutProps) {
  const {
    user,
    status,
    isAdmin,
    emailVerified,
    resendVerificationEmail,
    refreshUserSession,
    signOut,
  } = useAuth();
  const [verifMessage, setVerifMessage] = useState<string | null>(null);
  const [verifError, setVerifError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;
    const params = new URLSearchParams(window.location.search);
    const nextPath = params.get('next');
    if (nextPath && nextPath.startsWith('/admin')) {
      onNavigate(nextPath);
    }
  }, [status, user, onNavigate]);

  const handleResend = async () => {
    setBusy(true);
    setVerifMessage(null);
    setVerifError(null);
    try {
      await resendVerificationEmail();
      setVerifMessage('Verification email sent. Check your inbox and spam folder.');
    } catch (err) {
      setVerifError(
        err instanceof Error ? err.message : 'Unable to resend verification email.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async () => {
    setBusy(true);
    setVerifMessage(null);
    setVerifError(null);
    try {
      const verified = await refreshUserSession();
      if (verified) {
        setVerifMessage('Email address verified.');
      } else {
        setVerifError('Email is still unverified. Open the link in your inbox first.');
      }
    } catch (err) {
      setVerifError(err instanceof Error ? err.message : 'Unable to refresh session.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] bg-arch-grid text-[#f4f4f0] flex flex-col justify-between">
      {/* Minimal Studio Top Bar */}
      <header className="border-b border-white/10 bg-[#08080a]/90">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-6 md:px-12">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="font-display text-base sm:text-lg font-semibold tracking-[0.24em] text-[#f4f4f0] hover:text-[#e5a93c] transition-colors whitespace-nowrap"
          >
            R &amp; L
          </a>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex min-h-[40px] items-center gap-2 font-mono-tabular text-xs tracking-[0.14em] text-[#a1a1aa] hover:text-[#e5a93c] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>BACK TO STUDIO</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-5 py-12 sm:px-6 md:px-12">
        <div className="grid w-full max-w-5xl grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Editorial Left Column */}
          <div className="lg:col-span-5">
            <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#e5a93c]">
              {kicker}
            </p>
            <h1
              className="mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.028em] text-[#f4f4f0]"
              style={{ textWrap: 'balance' }}
            >
              {title}
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#a1a1aa]">
              {subtitle}
            </p>
            <div className="mt-8 hidden lg:block border-t border-white/10 pt-6">
              <p className="font-mono-tabular text-[11px] tracking-[0.16em] text-[#71717a]">
                R &amp; L STUDIO · AUTHENTICATION GATEWAY
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#71717a]">
                Verified studio administrators can access the management console at /admin.
              </p>
            </div>
          </div>

          {/* Interactive Auth Surface */}
          <div className="lg:col-span-7">
            <div className="border border-white/15 bg-[#111114] p-6 sm:p-10">
              {status === 'initializing' ? (
                <div role="status" className="flex flex-col gap-4 py-10">
                  <span className="font-mono-tabular text-xs tracking-[0.2em] text-[#e5a93c]">
                    VERIFYING SESSION
                  </span>
                  <div className="h-[2px] w-full overflow-hidden bg-white/10">
                    <div className="h-full w-1/2 animate-pulse bg-[#e5a93c]" />
                  </div>
                  <p className="text-sm text-[#a1a1aa]">
                    Connecting to R &amp; L Studio authentication state...
                  </p>
                </div>
              ) : status === 'authenticated' && user ? (
                <div className="flex flex-col gap-6 py-2">
                  {!emailVerified ? (
                    <>
                      <div className="flex items-center gap-3 text-[#e5a93c]">
                        <MailCheck className="h-5 w-5 shrink-0" />
                        <span className="font-mono-tabular text-xs tracking-[0.18em]">
                          EMAIL VERIFICATION REQUIRED
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-semibold text-[#f4f4f0]">
                        Confirm your email address
                      </h2>
                      <p className="text-sm leading-relaxed text-[#d4d4d8]">
                        We sent a verification link to{' '}
                        <span className="font-medium text-[#f4f4f0]">{user.email}</span>.
                        Verify your inbox to unlock full account verification status.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-[#e5a93c]">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="font-mono-tabular text-xs tracking-[0.18em]">
                          SIGNED IN
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-semibold text-[#f4f4f0]">
                        Welcome, {user.displayName || user.email}
                      </h2>
                      <p className="text-sm leading-relaxed text-[#a1a1aa]">
                        {isAdmin
                          ? 'Your verified administrator session is active. You can open the R & L Studio Admin Console or return to the public showcase.'
                          : 'Your account is authenticated and synced with R & L Studio.'}
                      </p>
                    </>
                  )}

                  {verifMessage && (
                    <p
                      role="status"
                      className="border border-[#e5a93c]/40 bg-[#e5a93c]/10 px-4 py-3 text-xs text-[#f4f4f0]"
                    >
                      {verifMessage}
                    </p>
                  )}

                  {verifError && (
                    <p
                      role="alert"
                      className="border border-rose-400/40 bg-rose-950/30 px-4 py-3 text-xs text-rose-200"
                    >
                      {verifError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                    {!emailVerified && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={handleRefresh}
                          className="inline-flex min-h-[44px] items-center gap-2 bg-[#e5a93c] px-5 py-2.5 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] disabled:opacity-60 cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>I&apos;VE VERIFIED</span>
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={handleResend}
                          className="inline-flex min-h-[44px] items-center border border-white/20 px-5 py-2.5 text-xs font-medium tracking-[0.12em] text-[#f4f4f0] hover:border-[#e5a93c] disabled:opacity-60 cursor-pointer"
                        >
                          RESEND LINK
                        </button>
                      </>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onNavigate('/admin')}
                        className="inline-flex min-h-[44px] items-center gap-2 bg-[#e5a93c] px-5 py-2.5 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] cursor-pointer"
                      >
                        <span>OPEN ADMIN CONSOLE</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onNavigate('/')}
                      className={`inline-flex min-h-[44px] items-center px-5 py-2.5 text-xs font-semibold tracking-[0.14em] cursor-pointer ${
                        isAdmin
                          ? 'border border-white/20 text-[#f4f4f0] hover:border-[#e5a93c]'
                          : 'bg-[#e5a93c] text-[#08080a] hover:bg-[#f0ba54]'
                      }`}
                    >
                      RETURN TO STUDIO
                    </button>

                    <button
                      type="button"
                      onClick={() => void signOut()}
                      className="inline-flex min-h-[44px] items-center gap-2 border border-white/15 px-4 py-2.5 text-xs font-mono-tabular tracking-[0.12em] text-[#a1a1aa] hover:border-white/30 hover:text-[#f4f4f0] cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>SIGN OUT</span>
                    </button>
                  </div>
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-5 px-5 sm:px-6 md:px-12">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between font-mono-tabular text-[11px] text-[#71717a]">
          <span>R &amp; L STUDIO</span>
          <span>SECURE SESSION ACCESS</span>
        </div>
      </footer>
    </div>
  );
}
