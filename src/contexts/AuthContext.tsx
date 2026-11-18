import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { mapFirebaseErrorToMessage } from '../lib/firebaseErrors';
import { syncUserProfile } from '../lib/firestoreService';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isConfigured: boolean;
  isAdmin: boolean;
  emailVerified: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUserSession: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_EMAIL = 'abrehankhan@gmail.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    isFirebaseConfigured ? 'initializing' : 'unauthenticated',
  );

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setStatus('unauthenticated');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setStatus(firebaseUser ? 'authenticated' : 'unauthenticated');

      if (firebaseUser) {
        void syncUserProfile(firebaseUser).catch((err) => {
          console.warn('User profile sync deferred:', err);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const assertAuthAvailable = () => {
    if (!auth || !isFirebaseConfigured) {
      throw new Error(
        'Firebase authentication is not configured for this environment.',
      );
    }
    return auth;
  };

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const firebaseAuth = assertAuthAvailable();
    try {
      const cred = await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );
      await syncUserProfile(cred.user, 'password').catch(() => {});
    } catch (error) {
      throw new Error(mapFirebaseErrorToMessage(error, 'auth'));
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const firebaseAuth = assertAuthAvailable();
      try {
        const cred = await createUserWithEmailAndPassword(
          firebaseAuth,
          email.trim(),
          password,
        );
        const cleanName = name.trim();
        if (cleanName) {
          await updateProfile(cred.user, { displayName: cleanName });
        }
        await sendEmailVerification(cred.user);
        await syncUserProfile(cred.user, 'password');
      } catch (error) {
        throw new Error(mapFirebaseErrorToMessage(error, 'signup'));
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    const firebaseAuth = assertAuthAvailable();
    if (!googleProvider) {
      throw new Error('Google sign-in provider is unavailable.');
    }
    try {
      const cred = await signInWithPopup(firebaseAuth, googleProvider);
      await syncUserProfile(cred.user, 'google.com');
    } catch (error) {
      throw new Error(mapFirebaseErrorToMessage(error, 'google'));
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const firebaseAuth = assertAuthAvailable();
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
    } catch (error) {
      throw new Error(mapFirebaseErrorToMessage(error, 'reset'));
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    const firebaseAuth = assertAuthAvailable();
    if (!firebaseAuth.currentUser) {
      throw new Error('Please sign in first to resend the verification email.');
    }
    try {
      await sendEmailVerification(firebaseAuth.currentUser);
    } catch (error) {
      throw new Error(mapFirebaseErrorToMessage(error, 'auth'));
    }
  }, []);

  const refreshUserSession = useCallback(async () => {
    const firebaseAuth = assertAuthAvailable();
    if (!firebaseAuth.currentUser) return false;
    try {
      await reload(firebaseAuth.currentUser);
      const refreshed = firebaseAuth.currentUser;
      setUser(refreshed);
      return Boolean(refreshed?.emailVerified);
    } catch (error) {
      throw new Error(mapFirebaseErrorToMessage(error, 'auth'));
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  const isAdmin = Boolean(
    user &&
      user.email?.toLowerCase() === ADMIN_EMAIL &&
      user.emailVerified,
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isConfigured: isFirebaseConfigured,
        isAdmin,
        emailVerified: Boolean(user?.emailVerified),
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        resendVerificationEmail,
        refreshUserSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
