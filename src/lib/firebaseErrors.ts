import { auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function extractFirebaseCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string') return code;
  }
  if (error instanceof Error) {
    if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
      return 'permission-denied';
    }
    if (error.message.includes('unavailable') || error.message.includes('client is offline')) {
      return 'unavailable';
    }
  }
  return '';
}

export type ErrorContext = 'auth' | 'google' | 'signup' | 'reset' | 'firestore';

export function mapFirebaseErrorToMessage(
  error: unknown,
  context: ErrorContext = 'auth',
): string {
  const code = extractFirebaseCode(error);

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please verify your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Please choose a stronger password with at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion.';
    case 'auth/cancelled-popup-request':
      return 'Only one sign-in request can run at a time. Please try again.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in popup. Please allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not yet enabled on the Firebase project. Please enable the Email/Password provider in Firebase Authentication.';
    case 'auth/too-many-requests':
      return 'Too many attempts were made. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Check your internet access and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact R & L Studio.';
    case 'permission-denied':
      return context === 'firestore'
        ? 'Your request could not be saved due to database validation or access rules.'
        : 'You do not have permission to complete this action.';
    case 'unavailable':
      return 'Database service is temporarily unreachable. Please check your connection and try again.';
    default:
      if (context === 'google') {
        return 'Google sign-in could not be completed. Please try again.';
      }
      if (context === 'signup') {
        return 'We could not create your account right now. Please try again.';
      }
      if (context === 'reset') {
        return 'We could not send a password reset link right now. Verify the email and try again.';
      }
      if (context === 'firestore') {
        return 'Unable to reach R & L Studio database right now. Please try again shortly.';
      }
      return 'Authentication could not be completed. Please try again.';
  }
}
