import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseResolvedConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

const provisionedModules = import.meta.glob<Partial<FirebaseResolvedConfig>>(
  '/firebase-applet-config.json',
  { eager: true, import: 'default' },
);
const provisionedConfig: Partial<FirebaseResolvedConfig> =
  provisionedModules['/firebase-applet-config.json'] ?? {};

const envConfig: Partial<FirebaseResolvedConfig> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || undefined,
};

const resolvedConfig: FirebaseResolvedConfig = {
  apiKey: envConfig.apiKey || provisionedConfig.apiKey || '',
  authDomain: envConfig.authDomain || provisionedConfig.authDomain || '',
  projectId: envConfig.projectId || provisionedConfig.projectId || '',
  storageBucket: envConfig.storageBucket || provisionedConfig.storageBucket || '',
  messagingSenderId:
    envConfig.messagingSenderId || provisionedConfig.messagingSenderId || '',
  appId: envConfig.appId || provisionedConfig.appId || '',
  firestoreDatabaseId:
    envConfig.firestoreDatabaseId || provisionedConfig.firestoreDatabaseId || undefined,
};

export const isFirebaseConfigured = Boolean(
  resolvedConfig.apiKey &&
    resolvedConfig.authDomain &&
    resolvedConfig.projectId &&
    resolvedConfig.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(resolvedConfig);
  auth = getAuth(app);
  db = resolvedConfig.firestoreDatabaseId
    ? getFirestore(app, resolvedConfig.firestoreDatabaseId)
    : getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return false;
    }
    return true;
  }
}

void testFirestoreConnection();

export { app, auth, db, googleProvider };
