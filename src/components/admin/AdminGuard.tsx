import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, LogOut, MailCheck, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminGuardProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
}

const ADMIN_EMAIL = 'abrehankhan@gmail.com';

export function AdminGuard({
  currentPath,
  onNavigate,
  children,
}: AdminGuardProps) {
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
    if (status === 'unauthenticated') {
      const encodedNext = encodeURIComponent(currentPath || '/admin');
      onNavigate(`/login?next=${encodedNext}`);
    }
  }, [status, currentPath, onNavigate]);

  if (status === 'initializing' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#08080a] bg-arch-grid px-6 text-[#f4f4f0]">
        <div className="w-full max-w-md border border-white/15 bg-[#111114] p-8">
          <span className="font-mono-tabular text-xs tracking-[0.2em] text-[#e5a93c]">
            {status === 'initializing' ? 'VERIFYING STUDIO CREDENTIALS' : 'REDIRECTING TO SIGN IN'}
          </span>
          <div className="mt-4 h-[2px] w-full overflow-hidden bg-white/10">
            <div className="h-full w-1/2 animate-pulse bg-[#e5a93c]" />
          </div>
          <p className="mt-4 text-sm text-[#a1a1aa]">
            {status === 'initializing'
              ? 'Checking authenticated session with R & L Studio...'
              : 'Authentication is required to access the admin console.'}
          </p>
        </div>
      </div>
    );
  }

  const isAuthorizedEmail = user?.email?.toLowerCase() === ADMIN_EMAIL;

  if (!isAuthorizedEmail) {
    return (
      <div className="flex min-h-screen flex-col justify-between bg-[#08080a] bg-arch-grid text-[#f4f4f0]">
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

        <main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-5 py-16">
          <div className="w-full border border-rose-400/30 bg-[#111114] p-7 sm:p-10">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span className="font-mono-tabular text-xs tracking-[0.18em]">
                403 · ACCESS DENIED
              </span>
            </div>
            <h1
              className="mt-4 font-display text-2xl sm:text-3xl font-semibold text-[#f4f4f0]"
              style={{ textWrap: 'balance' }}
            >
              Restricted Studio Console
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
              This workspace is restricted to authorized R &amp; L Studio administrators.
              Signed-in account{' '}
              <span className="font-mono-tabular text-[#f4f4f0]">
                {user?.email || 'unknown'}
              </span>{' '}
              does not have administrative privileges.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="inline-flex min-h-[42px] items-center bg-[#e5a93c] px-5 py-2 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer whitespace-nowrap"
              >
                RETURN TO PUBLIC SITE
              </button>
              <button
                type="button"
                onClick={() => void signOut().then(() => onNavigate('/login?next=%2Fadmin'))}
                className="inline-flex min-h-[42px] items-center gap-2 border border-white/15 px-4 py-2 font-mono-tabular text-xs tracking-[0.12em] text-[#a1a1aa] hover:border-white/30 hover:text-[#f4f4f0] transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>SWITCH ACCOUNT</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 py-5 px-5 sm:px-6 md:px-12">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between font-mono-tabular text-[11px] text-[#71717a]">
            <span>R &amp; L STUDIO</span>
            <span>ACCESS CONTROLLED</span>
          </div>
        </footer>
      </div>
    );
  }

  if (!emailVerified || !isAdmin) {
    const handleResend = async () => {
      setBusy(true);
      setVerifMessage(null);
      setVerifError(null);
      try {
        await resendVerificationEmail();
        setVerifMessage('Verification email sent. Check your inbox and spam folder.');
      } catch (err) {
        setVerifError(
          err instanceof Error ? err.message : 'Unable to send verification email.',
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
        if (!verified) {
          setVerifError('Email is still unverified. Open the verification link first.');
        }
      } catch (err) {
        setVerifError(err instanceof Error ? err.message : 'Unable to refresh session.');
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080a] bg-arch-grid px-5 py-16 text-[#f4f4f0]">
        <div className="w-full max-w-lg border border-white/15 bg-[#111114] p-7 sm:p-10">
          <div className="flex items-center gap-3 text-[#e5a93c]">
            <MailCheck className="h-5 w-5 shrink-0" />
            <span className="font-mono-tabular text-xs tracking-[0.18em]">
              ADMIN EMAIL VERIFICATION REQUIRED
            </span>
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-[#f4f4f0]">
            Verify {user?.email}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
            Firestore security rules require a verified email token before permitting
            admin reads and writes. Verify your email or sign in with Google.
          </p>

          {verifMessage && (
            <p
              role="status"
              className="mt-4 border border-[#e5a93c]/40 bg-[#e5a93c]/10 px-4 py-3 text-xs text-[#f4f4f0]"
            >
              {verifMessage}
            </p>
          )}
          {verifError && (
            <p
              role="alert"
              className="mt-4 border border-rose-400/40 bg-rose-950/30 px-4 py-3 text-xs text-rose-200"
            >
              {verifError}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              disabled={busy}
              onClick={handleRefresh}
              className="inline-flex min-h-[42px] items-center gap-2 bg-[#e5a93c] px-5 py-2 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>I&apos;VE VERIFIED</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleResend}
              className="inline-flex min-h-[42px] items-center border border-white/20 px-4 py-2 text-xs font-medium tracking-[0.12em] text-[#f4f4f0] hover:border-[#e5a93c] disabled:opacity-50 cursor-pointer"
            >
              RESEND LINK
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex min-h-[42px] items-center gap-2 border border-white/15 px-4 py-2 font-mono-tabular text-xs tracking-[0.12em] text-[#a1a1aa] hover:text-[#f4f4f0] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
