import { useState } from 'react';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { signInWithEmail, signInWithGoogle, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      kicker="CLIENT ACCESS"
      title="SIGN IN TO R & L STUDIO."
      subtitle="Access your studio account using your verified email or Google identity."
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
              credentials to enable authentication.
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

        <button
          type="button"
          disabled={loading || !isConfigured}
          onClick={handleGoogleLogin}
          className="flex min-h-[48px] w-full items-center justify-center gap-3 border border-white/20 bg-[#08080a] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <span>CONTINUE WITH GOOGLE</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="h-[1px] flex-1 bg-white/10" />
          <span className="font-mono-tabular text-[11px] tracking-[0.16em] text-[#71717a]">
            OR EMAIL
          </span>
          <span className="h-[1px] flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleEmailLogin} noValidate className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="login-email"
              className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#a1a1aa]"
            >
              EMAIL
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-2 w-full border border-white/15 bg-[#08080a] px-4 py-3 text-sm text-[#f4f4f0] placeholder:text-[#52525b] focus:border-[#e5a93c] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="login-password"
                className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#a1a1aa]"
              >
                PASSWORD
              </label>
              <a
                href="/forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/forgot-password');
                }}
                className="font-mono-tabular text-[11px] tracking-[0.1em] text-[#a1a1aa] hover:text-[#e5a93c] transition-colors"
              >
                FORGOT PASSWORD?
              </a>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full border border-white/15 bg-[#08080a] px-4 py-3 text-sm text-[#f4f4f0] placeholder:text-[#52525b] focus:border-[#e5a93c] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isConfigured}
            className="mt-1 inline-flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#e5a93c] px-6 py-3.5 text-xs font-semibold tracking-[0.16em] text-[#08080a] hover:bg-[#f0ba54] disabled:opacity-50 transition-colors cursor-pointer"
          >
            <span>{loading ? 'SIGNING IN...' : 'SIGN IN'}</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </form>

        <div className="border-t border-white/10 pt-5 text-center sm:text-left">
          <p className="text-xs text-[#a1a1aa]">
            New to R &amp; L Studio?{' '}
            <a
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/signup');
              }}
              className="font-medium text-[#e5a93c] hover:underline"
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
