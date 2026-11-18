import { type User } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { handleFirestoreError, OperationType } from './firebaseErrors';
import type { StoreLink, StudioProject } from '../data/projects';

export type AuthProviderKind = 'google.com' | 'password';

export interface UserProfileDoc {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: AuthProviderKind;
}

export async function syncUserProfile(
  user: User,
  providerHint?: AuthProviderKind,
): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  const resolvedProvider: AuthProviderKind =
    providerHint ??
    (user.providerData.some((p) => p.providerId === 'google.com')
      ? 'google.com'
      : 'password');

  const safeDisplayName = (user.displayName || user.email?.split('@')[0] || 'Client')
    .trim()
    .slice(0, 120);
  const safeEmail = (user.email || '').trim().slice(0, 254);
  const safePhoto = user.photoURL ? user.photoURL.trim().slice(0, 500) : undefined;

  if (!safeEmail) return;

  let exists = false;
  try {
    const snap = await getDoc(userRef);
    exists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!exists) {
    const createPayload: Record<string, unknown> = {
      uid: user.uid,
      displayName: safeDisplayName,
      email: safeEmail,
      provider: resolvedProvider,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (safePhoto) {
      createPayload.photoURL = safePhoto;
    }

    try {
      await setDoc(userRef, createPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    const updatePayload: Record<string, unknown> = {
      displayName: safeDisplayName,
      email: safeEmail,
      provider: resolvedProvider,
      updatedAt: serverTimestamp(),
    };
    if (safePhoto) {
      updatePayload.photoURL = safePhoto;
    }

    try {
      await updateDoc(userRef, updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}

export interface InquirySubmissionInput {
  name: string;
  email: string;
  company: string;
  projectType:
    | 'Mobile Application'
    | 'Web Application'
    | 'SaaS Product'
    | 'UI/UX Design'
    | 'Digital Product'
    | 'Custom Software';
  budget: string;
  timeline: string;
  message: string;
}

export type InquiryStatus = 'new' | 'reviewed' | 'archived';

export interface AdminInquiryRecord extends InquirySubmissionInput {
  id: string;
  status: InquiryStatus;
  createdAt: Date | null;
}

export async function submitProjectInquiry(
  input: InquirySubmissionInput,
): Promise<string> {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  const sanitized = {
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().slice(0, 254),
    company: input.company.trim().slice(0, 140),
    projectType: input.projectType,
    budget: input.budget.trim().slice(0, 60),
    timeline: input.timeline.trim().slice(0, 60),
    message: input.message.trim().slice(0, 4000),
    status: 'new' as const,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'inquiries'), sanitized);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'inquiries');
  }
}

function mapProjectDoc(docId: string, data: DocumentData): StudioProject {
  const rawGallery = Array.isArray(data.gallery) ? data.gallery : [];
  const rawStores = Array.isArray(data.storeLinks) ? data.storeLinks : [];

  return {
    id: String(data.id || docId),
    index: String(data.index || '01'),
    title: String(data.title || 'Untitled Project'),
    slug: String(data.slug || docId),
    subtitle: String(data.subtitle || 'A real R & L Studio project.'),
    description: String(data.description || ''),
    category: String(data.category || 'Digital Product'),
    technologies: Array.isArray(data.technologies)
      ? data.technologies.map(String)
      : [],
    year: String(data.year || ''),
    status: String(data.status || ''),
    featuredImage: String(data.featuredImage || ''),
    gallery: rawGallery.map((g: Record<string, unknown>, idx: number) => ({
      id: String(g.id || `shot-${idx}`),
      label: String(g.label || `View ${idx + 1}`),
      imageUrl: String(g.imageUrl || ''),
      caption: g.caption ? String(g.caption) : undefined,
    })),
    storeLinks: rawStores.map((s: Record<string, unknown>) => ({
      platform: String(s.platform || 'Web App') as StoreLink['platform'],
      url: String(s.url || ''),
    })),
    published: Boolean(data.published),
  };
}

export async function fetchPublishedProjects(): Promise<StudioProject[] | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    const q = query(collection(db, 'projects'), where('published', '==', true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const list = snapshot.docs.map((d) => mapProjectDoc(d.id, d.data()));
    list.sort((a, b) => a.index.localeCompare(b.index));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  }
}

export async function fetchAllAdminProjects(): Promise<StudioProject[]> {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  try {
    const snapshot = await getDocs(collection(db, 'projects'));
    const list = snapshot.docs.map((d) => mapProjectDoc(d.id, d.data()));
    list.sort((a, b) => a.index.localeCompare(b.index));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  }
}

export async function fetchAdminProjectById(
  projectId: string,
): Promise<StudioProject | null> {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  const cleanId = projectId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `projects/${cleanId}`;

  try {
    const snap = await getDoc(doc(db, 'projects', cleanId));
    if (!snap.exists()) return null;
    return mapProjectDoc(snap.id, snap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveAdminProjectToFirestore(
  project: StudioProject,
): Promise<string> {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  const cleanId =
    project.id
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 128) || `project-${Date.now()}`;

  const rawSlug = (project.slug || project.title || cleanId)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
  const fallbackSlug = cleanId
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
  const cleanSlug = rawSlug || fallbackSlug || `project-${Date.now()}`;

  const payload = {
    id: cleanId,
    index: (project.index || '01').trim().slice(0, 16) || '01',
    title: project.title.trim().slice(0, 140),
    slug: cleanSlug,
    subtitle: (project.subtitle || '').trim().slice(0, 200),
    description: (project.description || '').trim().slice(0, 3000),
    category: (project.category || 'Digital Product').trim().slice(0, 80),
    technologies: project.technologies
      .map((t) => t.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 20),
    year: (project.year || String(new Date().getFullYear())).trim().slice(0, 16),
    status: (project.status || (project.published ? 'Published' : 'Draft'))
      .trim()
      .slice(0, 80),
    featuredImage: (project.featuredImage || '').trim().slice(0, 500),
    gallery: project.gallery.slice(0, 12).map((shot, idx) => ({
      id: shot.id || `shot-${idx + 1}`,
      label: shot.label.trim().slice(0, 80) || `View ${idx + 1}`,
      imageUrl: shot.imageUrl.trim().slice(0, 500),
      caption: (shot.caption || '').trim().slice(0, 240),
    })),
    storeLinks: project.storeLinks.slice(0, 10).map((link) => ({
      platform: link.platform,
      url: link.url.trim().slice(0, 500),
    })),
    published: Boolean(project.published),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'projects', cleanId), payload);
    return cleanId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `projects/${cleanId}`);
  }
}

export async function deleteAdminProject(projectId: string): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  const cleanId = projectId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `projects/${cleanId}`;

  try {
    await deleteDoc(doc(db, 'projects', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedInitialProjectsToFirestore(
  projects: StudioProject[],
): Promise<void> {
  for (const project of projects) {
    await saveAdminProjectToFirestore(project);
  }
}

export async function fetchAdminInquiries(): Promise<AdminInquiryRecord[]> {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  try {
    const snapshot = await getDocs(collection(db, 'inquiries'));
    const list: AdminInquiryRecord[] = snapshot.docs.map((d) => {
      const data = d.data();
      const rawCreatedAt = data.createdAt;
      let createdAt: Date | null = null;
      if (rawCreatedAt instanceof Timestamp) {
        createdAt = rawCreatedAt.toDate();
      } else if (
        rawCreatedAt &&
        typeof (rawCreatedAt as { toDate?: () => Date }).toDate === 'function'
      ) {
        createdAt = (rawCreatedAt as { toDate: () => Date }).toDate();
      }

      const rawStatus = String(data.status || 'new');
      const status: InquiryStatus =
        rawStatus === 'reviewed' || rawStatus === 'archived' ? rawStatus : 'new';

      return {
        id: d.id,
        name: String(data.name || ''),
        email: String(data.email || ''),
        company: String(data.company || ''),
        projectType: String(
          data.projectType || 'Digital Product',
        ) as InquirySubmissionInput['projectType'],
        budget: String(data.budget || ''),
        timeline: String(data.timeline || ''),
        message: String(data.message || ''),
        status,
        createdAt,
      };
    });

    list.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'inquiries');
  }
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  const cleanId = inquiryId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `inquiries/${cleanId}`;

  try {
    await updateDoc(doc(db, 'inquiries', cleanId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAdminInquiry(inquiryId: string): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  const cleanId = inquiryId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  const path = `inquiries/${cleanId}`;

  try {
    await deleteDoc(doc(db, 'inquiries', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
