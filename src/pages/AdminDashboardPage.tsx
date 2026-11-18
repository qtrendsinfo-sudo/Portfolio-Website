import { useCallback, useEffect, useState } from 'react';
import { AdminGuard } from '../components/admin/AdminGuard';
import { AdminInquiriesView } from '../components/admin/AdminInquiriesView';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminProjectEditor } from '../components/admin/AdminProjectEditor';
import { AdminProjectsView } from '../components/admin/AdminProjectsView';
import { AdminShell, type AdminSection } from '../components/admin/AdminShell';
import { useAuth } from '../contexts/AuthContext';
import { INITIAL_PROJECTS, type StudioProject } from '../data/projects';
import { mapFirebaseErrorToMessage } from '../lib/firebaseErrors';
import {
  deleteAdminInquiry,
  deleteAdminProject,
  fetchAdminInquiries,
  fetchAllAdminProjects,
  saveAdminProjectToFirestore,
  seedInitialProjectsToFirestore,
  updateInquiryStatus,
  type AdminInquiryRecord,
  type InquiryStatus,
} from '../lib/firestoreService';

interface AdminDashboardPageProps {
  section: AdminSection;
  projectId?: string;
  currentPath: string;
  onNavigate: (path: string) => void;
}

function AdminWorkspaceContent({
  section,
  projectId,
  onNavigate,
}: Omit<AdminDashboardPageProps, 'currentPath'>) {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      setToast({ type, message });
      window.setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, 5000);
    },
    [],
  );

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const [projList, inquiryList] = await Promise.all([
        fetchAllAdminProjects(),
        fetchAdminInquiries(),
      ]);
      setProjects(projList);
      setInquiries(inquiryList);
    } catch (err) {
      setError(mapFirebaseErrorToMessage(err, 'firestore'));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const handleSeedInitial = async () => {
    setSeeding(true);
    try {
      await seedInitialProjectsToFirestore(INITIAL_PROJECTS);
      await loadAdminData();
      showToast('success', 'Seeded initial COD Finder and Ipay Finder projects into Firestore.');
    } catch (err) {
      showToast('error', mapFirebaseErrorToMessage(err, 'firestore'));
    } finally {
      setSeeding(false);
    }
  };

  const handleTogglePublish = async (project: StudioProject) => {
    const nextPublished = !project.published;
    try {
      await saveAdminProjectToFirestore({
        ...project,
        published: nextPublished,
      });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, published: nextPublished } : p,
        ),
      );
      showToast(
        'success',
        `"${project.title}" is now ${nextPublished ? 'published publicly' : 'unpublished (draft)'}.`,
      );
    } catch (err) {
      showToast('error', mapFirebaseErrorToMessage(err, 'firestore'));
    }
  };

  const handleDeleteProject = async (project: StudioProject) => {
    try {
      await deleteAdminProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      showToast('success', `Deleted project "${project.title}" from Firestore.`);
    } catch (err) {
      showToast('error', mapFirebaseErrorToMessage(err, 'firestore'));
    }
  };

  const handleProjectSaved = (saved: StudioProject, isNew: boolean) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      const next = exists
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [...prev, saved];
      next.sort((a, b) => a.index.localeCompare(b.index));
      return next;
    });
    showToast(
      'success',
      isNew
        ? `Created "${saved.title}" in Firestore.`
        : `Updated "${saved.title}" in Firestore.`,
    );
    onNavigate('/admin/projects');
  };

  const handleUpdateInquiryStatus = async (
    inquiry: AdminInquiryRecord,
    nextStatus: InquiryStatus,
  ) => {
    try {
      await updateInquiryStatus(inquiry.id, nextStatus);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, status: nextStatus } : i)),
      );
      showToast(
        'success',
        `Marked inquiry from ${inquiry.name} as ${nextStatus.toUpperCase()}.`,
      );
    } catch (err) {
      showToast('error', mapFirebaseErrorToMessage(err, 'firestore'));
    }
  };

  const handleDeleteInquiry = async (inquiry: AdminInquiryRecord) => {
    try {
      await deleteAdminInquiry(inquiry.id);
      setInquiries((prev) => prev.filter((i) => i.id !== inquiry.id));
      showToast('success', `Deleted inquiry from ${inquiry.name}.`);
    } catch (err) {
      showToast('error', mapFirebaseErrorToMessage(err, 'firestore'));
    }
  };

  const breadcrumb = (() => {
    switch (section) {
      case 'overview':
        return 'OVERVIEW';
      case 'projects':
        return 'PROJECTS';
      case 'project-new':
        return 'PROJECTS / NEW';
      case 'project-edit':
        return 'PROJECTS / EDIT';
      case 'inquiries':
        return 'INQUIRIES';
    }
  })();

  return (
    <AdminShell
      activeSection={section}
      breadcrumb={breadcrumb}
      onNavigate={onNavigate}
      toast={toast}
      onDismissToast={() => setToast(null)}
    >
      {section === 'overview' && (
        <AdminOverview
          projects={projects}
          inquiries={inquiries}
          loading={loading}
          error={error}
          seeding={seeding}
          onRetry={() => void loadAdminData()}
          onSeedInitial={handleSeedInitial}
          onNavigate={onNavigate}
        />
      )}

      {section === 'projects' && (
        <AdminProjectsView
          projects={projects}
          loading={loading}
          error={error}
          seeding={seeding}
          onRetry={() => void loadAdminData()}
          onSeedInitial={handleSeedInitial}
          onTogglePublish={handleTogglePublish}
          onDeleteProject={handleDeleteProject}
          onNavigate={onNavigate}
        />
      )}

      {section === 'project-new' && (
        <AdminProjectEditor
          mode="create"
          existingProjects={projects}
          onSaved={handleProjectSaved}
          onCancel={() => onNavigate('/admin/projects')}
        />
      )}

      {section === 'project-edit' && (
        <AdminProjectEditor
          mode="edit"
          projectId={projectId}
          existingProjects={projects}
          onSaved={handleProjectSaved}
          onCancel={() => onNavigate('/admin/projects')}
        />
      )}

      {section === 'inquiries' && (
        <AdminInquiriesView
          inquiries={inquiries}
          loading={loading}
          error={error}
          onRetry={() => void loadAdminData()}
          onUpdateStatus={handleUpdateInquiryStatus}
          onDeleteInquiry={handleDeleteInquiry}
        />
      )}
    </AdminShell>
  );
}

export function AdminDashboardPage({
  section,
  projectId,
  currentPath,
  onNavigate,
}: AdminDashboardPageProps) {
  return (
    <AdminGuard currentPath={currentPath} onNavigate={onNavigate}>
      <AdminWorkspaceContent
        section={section}
        projectId={projectId}
        onNavigate={onNavigate}
      />
    </AdminGuard>
  );
}
