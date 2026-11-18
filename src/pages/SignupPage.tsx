import { useState } from 'react';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';

interface SignupPageProps {
  onNavigate: (path: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const { signUpWithEmail, signInWithGoogle, isConfigured } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      kicker="CREATE ACCOUNT"
      title="JOIN R & L STUDIO."
      subtitle="Register your profile to receive email verification and manage your R & L Studio account."
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
              credentials to enable account registration.
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
          onClick={handleGoogleSignup}
          className="flex min-h-[48px] w-full items-center justify-center gap-3 border border-white/20 bg-[#08080a] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <span>CONTINUE WITH GOOGLE</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="h-[1px] flex-1 bg-white/10" />
          <span className="font-mono-tabular text-[11px] tracking-[0.16em] text-[#71717a]">
            OR REGISTER WITH EMAIL
          </span>
          <span className="h-[1px] flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSignup} noValidate className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="signup-name"
              className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#a1a1aa]"
            >
              NAME
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="mt-2 w-full border border-white/15 bg-[#08080a] px-4 py-3 text-sm text-[#f4f4f0] placeholder:text-[#52525b] focus:border-[#e5a93c] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#a1a1aa]"
            >
              EMAIL
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-2 w-full border border-white/15 bg-[#08080a] px-4 py-3 text-sm text-[#f4f4f0] placeholder:text-[#52525b] focus:border-[#e5a93c] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="signup-password"
                className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#a1a1aa]"
              >
                PASSWORD
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="mt-2 w-full border border-white/15 bg-[#08080a] px-4 py-3 text-sm text-[#f4f4f0] placeholder:text-[#52525b] focus:border-[#e5a93c] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="signup-confirm"
                className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#a1a1aa]"
              >
                CONFIRM PASSWORD
              </label>
              <input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="mt-2 w-full border border-white/15 bg-[#08080a] px-4 py-3 text-sm text-[#f4f4f0] placeholder:text-[#52525b] focus:border-[#e5a93c] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isConfigured}
            className="mt-2 inline-flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#e5a93c] px-6 py-3.5 text-xs font-semibold tracking-[0.16em] text-[#08080a] hover:bg-[#f0ba54] disabled:opacity-50 transition-colors cursor-pointer"
          >
            <span>{loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </form>

        <div className="border-t border-white/10 pt-5 text-center sm:text-left">
          <p className="text-xs text-[#a1a1aa]">
            Already have an account?{' '}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/login');
              }}
              className="font-medium text-[#e5a93c] hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
