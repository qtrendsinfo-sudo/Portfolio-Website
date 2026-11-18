import { useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

interface ForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { sendPasswordReset, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSentTo(null);

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(trimmed);
      setSentTo(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      kicker="RECOVERY"
      title="RESET YOUR ACCESS KEY."
      subtitle="Enter the email registered with R & L Studio and we will dispatch a password reset link."
      onNavigate={onNavigate}
    >
      <div className="flex flex-col gap-6">
        {!isConfigured && (
          <div
            role="alert"
            className="flex items-start gap-2.5 border border-[#e5a93c]/40 bg-[#e5a93c]/10 p-4 text-xs text-[#f4f4f0]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#e5a93c]" />
            <span>
              Firebase environment configuration is missing. Add your Firebase project
              credentials to enable password recovery.
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 border border-rose-400/40 bg-rose-950/30 p-4 text-xs leading-relaxed text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {sentTo ? (
          <div role="status" className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-3 text-[#e5a93c]">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="font-mono-tabular text-xs tracking-[0.18em]">
                RESET LINK DISPATCHED
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#f4f4f0]">
              Check your inbox
            </h2>
            <p className="text-sm leading-relaxed text-[#d4d4d8]">
              If an account exists for{' '}
              <span className="font-medium text-[#f4f4f0]">{sentTo}</span>, a password
              reset email has been sent via Firebase Authentication.
            </p>
            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="inline-flex min-h-[44px] items-center gap-2 bg-[#e5a93c] px-6 py-2.5 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer"
              >
                <span>BACK TO SIGN IN</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="inline-flex min-h-[44px] items-center border border-white/15 px-5 py-2.5 text-xs font-mono-tabular tracking-[0.12em] text-[#a1a1aa] hover:border-white/30 hover:text-[#f4f4f0] transition-colors cursor-pointer"
              >
                TRY ANOTHER EMAIL
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="reset-email"
                className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#a1a1aa]"
              >
                REGISTERED EMAIL
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-2 w-full border border-white/15 bg-[#08080a] px-4 py-3 text-sm text-[#f4f4f0] placeholder:text-[#52525b] focus:border-[#e5a93c] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="mt-1 inline-flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#e5a93c] px-6 py-3.5 text-xs font-semibold tracking-[0.16em] text-[#08080a] hover:bg-[#f0ba54] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>{loading ? 'DISPATCHING RESET LINK...' : 'SEND RESET LINK'}</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <div className="border-t border-white/10 pt-5 text-center sm:text-left">
              <p className="text-xs text-[#a1a1aa]">
                Remembered your credentials?{' '}
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/login');
                  }}
                  className="font-medium text-[#e5a93c] hover:underline"
                >
                  Return to sign in
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
