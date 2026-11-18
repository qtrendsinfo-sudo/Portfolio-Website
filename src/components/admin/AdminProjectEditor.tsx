import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Plus, Save, Smartphone, Trash2 } from 'lucide-react';
import {
  type ProjectScreenshot,
  type StoreLink,
  type StudioProject,
} from '../../data/projects';
import { mapFirebaseErrorToMessage } from '../../lib/firebaseErrors';
import {
  fetchAdminProjectById,
  saveAdminProjectToFirestore,
} from '../../lib/firestoreService';

interface AdminProjectEditorProps {
  mode: 'create' | 'edit';
  projectId?: string;
  existingProjects: StudioProject[];
  onSaved: (saved: StudioProject, isNew: boolean) => void;
  onCancel: () => void;
}

const DEFAULT_STORE_PLATFORMS: StoreLink['platform'][] = [
  'Web App',
  'Google Play',
  'App Store',
  'APKPure',
  'Uptodown',
  'OPPO Store',
];

const CATEGORIES = [
  'Mobile Application',
  'Web Application',
  'SaaS Product',
  'UI/UX Design',
  'Digital Product',
  'Custom Software',
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

function buildEmptyProject(nextIndex: string): StudioProject {
  return {
    id: `project-${Date.now()}`,
    index: nextIndex,
    title: '',
    slug: '',
    subtitle: 'A real R & L Studio project.',
    description: '',
    category: 'Mobile Application',
    technologies: [],
    year: String(new Date().getFullYear()),
    status: 'Draft',
    featuredImage: '',
    gallery: [
      {
        id: 'shot-1',
        label: 'Primary Presentation',
        imageUrl: '',
        caption: 'Primary project showcase visual',
      },
    ],
    storeLinks: DEFAULT_STORE_PLATFORMS.map((platform) => ({ platform, url: '' })),
    published: false,
  };
}

function normalizeStoreLinks(links: StoreLink[]): StoreLink[] {
  const byPlatform = new Map(links.map((l) => [l.platform, l.url]));
  return DEFAULT_STORE_PLATFORMS.map((platform) => ({
    platform,
    url: byPlatform.get(platform) || '',
  }));
}

export function AdminProjectEditor({
  mode,
  projectId,
  existingProjects,
  onSaved,
  onCancel,
}: AdminProjectEditorProps) {
  const nextIndex = String(existingProjects.length + 1).padStart(2, '0');
  const cachedMatch =
    mode === 'edit' && projectId
      ? existingProjects.find((p) => p.id === projectId) ?? null
      : null;

  const [loadingProject, setLoadingProject] = useState(
    mode === 'edit' && !cachedMatch,
  );
  const [notFound, setNotFound] = useState(false);

  const [formId, setFormId] = useState<string>(
    () => cachedMatch?.id || `project-${Date.now()}`,
  );
  const [index, setIndex] = useState(() => cachedMatch?.index || nextIndex);
  const [title, setTitle] = useState(() => cachedMatch?.title || '');
  const [slug, setSlug] = useState(() => cachedMatch?.slug || '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [subtitle, setSubtitle] = useState(
    () => cachedMatch?.subtitle || 'A real R & L Studio project.',
  );
  const [category, setCategory] = useState(
    () => cachedMatch?.category || 'Mobile Application',
  );
  const [year, setYear] = useState(
    () => cachedMatch?.year || String(new Date().getFullYear()),
  );
  const [statusText, setStatusText] = useState(
    () => cachedMatch?.status || 'In Development',
  );
  const [description, setDescription] = useState(
    () => cachedMatch?.description || '',
  );
  const [techInput, setTechInput] = useState(() =>
    cachedMatch ? cachedMatch.technologies.join(', ') : '',
  );
  const [featuredImage, setFeaturedImage] = useState(
    () => cachedMatch?.featuredImage || '',
  );
  const [gallery, setGallery] = useState<ProjectScreenshot[]>(() =>
    cachedMatch && cachedMatch.gallery.length > 0
      ? cachedMatch.gallery
      : buildEmptyProject(nextIndex).gallery,
  );
  const [storeLinks, setStoreLinks] = useState<StoreLink[]>(() =>
    normalizeStoreLinks(cachedMatch?.storeLinks || []),
  );
  const [published, setPublished] = useState<boolean>(
    () => Boolean(cachedMatch?.published),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setPreviewError(false);
  }, [featuredImage]);

  useEffect(() => {
    if (mode !== 'edit' || !projectId) return;
    if (cachedMatch) {
      setLoadingProject(false);
      return;
    }

    let active = true;
    setLoadingProject(true);
    setNotFound(false);

    void fetchAdminProjectById(projectId)
      .then((fetched) => {
        if (!active) return;
        if (!fetched) {
          setNotFound(true);
          return;
        }
        setFormId(fetched.id);
        setIndex(fetched.index);
        setTitle(fetched.title);
        setSlug(fetched.slug);
        setSlugTouched(true);
        setSubtitle(fetched.subtitle);
        setCategory(fetched.category);
        setYear(fetched.year);
        setStatusText(fetched.status);
        setDescription(fetched.description);
        setTechInput(fetched.technologies.join(', '));
        setFeaturedImage(fetched.featuredImage);
        setGallery(
          fetched.gallery.length > 0
            ? fetched.gallery
            : buildEmptyProject(fetched.index).gallery,
        );
        setStoreLinks(normalizeStoreLinks(fetched.storeLinks));
        setPublished(Boolean(fetched.published));
      })
      .catch((err) => {
        if (active) {
          setError(mapFirebaseErrorToMessage(err, 'firestore'));
        }
      })
      .finally(() => {
        if (active) setLoadingProject(false);
      });

    return () => {
      active = false;
    };
  }, [mode, projectId, cachedMatch]);

  const primaryProjectUrl =
    storeLinks.find((s) => s.platform === 'Web App')?.url || '';

  const handlePrimaryUrlChange = (url: string) => {
    setStoreLinks((prev) =>
      prev.map((s) => (s.platform === 'Web App' ? { ...s, url } : s)),
    );
  };

  const handleStoreChange = (platform: StoreLink['platform'], url: string) => {
    setStoreLinks((prev) =>
      prev.map((s) => (s.platform === platform ? { ...s, url } : s)),
    );
  };

  const handleGalleryChange = (
    idx: number,
    field: keyof ProjectScreenshot,
    value: string,
  ) => {
    setGallery((prev) =>
      prev.map((shot, sIdx) => (sIdx === idx ? { ...shot, [field]: value } : shot)),
    );
  };

  const handleAddGallerySlot = () => {
    if (gallery.length >= 12) return;
    setGallery((prev) => [
      ...prev,
      {
        id: `shot-${Date.now()}`,
        label: `Interface Slot 0${prev.length + 1}`,
        imageUrl: '',
        caption: '',
      },
    ]);
  };

  const handleRemoveGallerySlot = (idx: number) => {
    setGallery((prev) => prev.filter((_, sIdx) => sIdx !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Project title is required.');
      return;
    }

    const derivedSlug = slugify(slug || cleanTitle);
    if (!derivedSlug || !/^[a-z0-9-]+$/.test(derivedSlug)) {
      setError('Slug must use lowercase letters, numbers, and hyphens only.');
      return;
    }

    const technologies = techInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20);

    const cleanFeaturedImage = featuredImage.trim();
    const cleanedGallery: ProjectScreenshot[] = (
      gallery.length > 0
        ? gallery
        : [
            {
              id: 'shot-1',
              label: 'Primary Presentation',
              imageUrl: cleanFeaturedImage,
              caption: `${cleanTitle} showcase presentation`,
            },
          ]
    )
      .slice(0, 12)
      .map((shot, idx) => ({
        id: shot.id || `shot-${idx + 1}`,
        label: shot.label.trim() || `View ${idx + 1}`,
        imageUrl:
          idx === 0 && !shot.imageUrl.trim() && cleanFeaturedImage
            ? cleanFeaturedImage
            : shot.imageUrl.trim(),
        caption: shot.caption?.trim() || undefined,
      }));

    // Keep storeLinks containing populated links plus default distribution slots cleanly
    const filteredStoreLinks = storeLinks
      .filter((s) => s.url.trim().length > 0 || ['APKPure', 'Uptodown', 'OPPO Store'].includes(s.platform))
      .slice(0, 10);

    const baseNewId = slugify(cleanTitle) || `project-${Date.now()}`;
    const uniqueNewId = existingProjects.some((p) => p.id === baseNewId)
      ? `${baseNewId.slice(0, 118)}-${Date.now().toString().slice(-6)}`
      : baseNewId;
    const resolvedId = mode === 'edit' ? formId : uniqueNewId;

    const projectPayload: StudioProject = {
      id: resolvedId,
      index: index.trim() || nextIndex,
      title: cleanTitle,
      slug: derivedSlug,
      subtitle: subtitle.trim() || 'A real R & L Studio project.',
      description: description.trim(),
      category: category.trim() || 'Digital Product',
      technologies,
      year: year.trim() || String(new Date().getFullYear()),
      status: statusText.trim() || (published ? 'Published' : 'Draft'),
      featuredImage: cleanFeaturedImage,
      gallery: cleanedGallery,
      storeLinks: filteredStoreLinks,
      published,
    };

    setSaving(true);
    try {
      const savedId = await saveAdminProjectToFirestore(projectPayload);
      onSaved({ ...projectPayload, id: savedId }, mode === 'create');
    } catch (err) {
      setError(mapFirebaseErrorToMessage(err, 'firestore'));
    } finally {
      setSaving(false);
    }
  };

  if (loadingProject) {
    return (
      <div className="mx-auto max-w-4xl border border-white/10 bg-[#111114] p-8">
        <span className="font-mono-tabular text-xs tracking-[0.18em] text-[#e5a93c]">
          LOADING PROJECT RECORD...
        </span>
        <div className="mt-4 h-[2px] w-full overflow-hidden bg-white/10">
          <div className="h-full w-1/2 animate-pulse bg-[#e5a93c]" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl border border-white/10 bg-[#111114] p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-[#f4f4f0]">
          Project Not Found
        </h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          The requested project document could not be found in Firestore.
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-6 bg-[#e5a93c] px-5 py-2.5 text-xs font-semibold tracking-[0.14em] text-[#08080a] cursor-pointer"
        >
          RETURN TO PROJECTS
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 font-mono-tabular text-xs tracking-[0.14em] text-[#a1a1aa] hover:text-[#e5a93c] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>BACK TO PROJECTS</span>
          </button>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#f4f4f0]">
            {mode === 'create' ? 'Add New Project' : `Edit ${title || 'Project'}`}
          </h1>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 border border-rose-400/40 bg-rose-950/30 p-4 text-xs text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border border-white/10 bg-[#111114] p-6 sm:p-8 flex flex-col gap-7"
      >
        {/* Publish Visibility Banner */}
        <div className="flex flex-col gap-3 border border-white/10 bg-[#08080a] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono-tabular text-xs tracking-[0.14em] text-[#f4f4f0]">
              PUBLIC VISIBILITY
            </p>
            <p className="mt-1 text-xs text-[#a1a1aa]">
              {published
                ? 'Published — visible on the public R & L Studio portfolio.'
                : 'Draft — hidden from public visitors until published.'}
            </p>
          </div>
          <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-[#e5a93c] cursor-pointer"
            />
            <span className="font-mono-tabular text-xs tracking-[0.12em] text-[#e5a93c]">
              {published ? 'PUBLISHED' : 'DRAFT'}
            </span>
          </label>
        </div>

        {/* Core Identity */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
          <label className="sm:col-span-2 flex flex-col gap-2">
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
              INDEX *
            </span>
            <input
              type="text"
              required
              maxLength={16}
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              placeholder="01"
              className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm font-mono-tabular text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
            />
          </label>

          <label className="sm:col-span-5 flex flex-col gap-2">
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
              PROJECT TITLE *
            </span>
            <input
              type="text"
              required
              maxLength={140}
              value={title}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                if (!slugTouched && mode === 'create') {
                  setSlug(slugify(val));
                }
              }}
              placeholder="e.g. COD Finder"
              className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
            />
          </label>

          <label className="sm:col-span-5 flex flex-col gap-2">
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
              URL SLUG *
            </span>
            <input
              type="text"
              required
              maxLength={140}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              placeholder="cod-finder"
              className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm font-mono-tabular text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
              SUBTITLE
            </span>
            <input
              type="text"
              maxLength={200}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="A real R & L Studio project."
              className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
              CATEGORY *
            </span>
            <select
              value={CATEGORIES.includes(category) ? category : '__custom'}
              onChange={(e) => {
                if (e.target.value !== '__custom') setCategory(e.target.value);
              }}
              className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              {!CATEGORIES.includes(category) && (
                <option value="__custom">{category}</option>
              )}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
              YEAR
            </span>
            <input
              type="text"
              maxLength={16}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2026"
              className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm font-mono-tabular text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
              STATUS LABEL
            </span>
            <input
              type="text"
              maxLength={80}
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="Published / Production"
              className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
            DESCRIPTION
          </span>
          <textarea
            rows={4}
            maxLength={3000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the architecture, user journey, and engineering execution..."
            className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
              TECHNOLOGIES (COMMA SEPARATED)
            </span>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="React Native, TypeScript, Firebase"
              className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
              PRIMARY PROJECT URL (WEB APP)
            </span>
            <input
              type="url"
              value={primaryProjectUrl}
              onChange={(e) => handlePrimaryUrlChange(e.target.value)}
              placeholder="https://..."
              className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
            />
          </label>
        </div>

        {/* Featured Image URL + Live Preview */}
        <div className="grid grid-cols-1 gap-5 border-t border-white/10 pt-6 sm:grid-cols-12 sm:items-start">
          <div className="sm:col-span-7 flex flex-col gap-2">
            <label className="flex flex-col gap-2">
              <span className="font-mono-tabular text-[11px] tracking-[0.14em] text-[#a1a1aa]">
                FEATURED IMAGE URL
              </span>
              <input
                type="text"
                maxLength={500}
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="/src/assets/images/cod_finder_showcase_1794914852787.jpg"
                className="border border-white/15 bg-[#08080a] px-3.5 py-2.5 text-sm text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
              />
            </label>
            <p className="text-xs text-[#71717a]">
              Supports relative studio assets or HTTPS image URLs.
            </p>
          </div>

          <div className="sm:col-span-5">
            <div className="aspect-[16/10] w-full overflow-hidden border border-white/10 bg-[#08080a]">
              {featuredImage.trim() && !previewError ? (
                <img
                  src={featuredImage.trim()}
                  alt={title || 'Featured project preview'}
                  referrerPolicy="no-referrer"
                  onError={() => setPreviewError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                  <Smartphone className="h-5 w-5 text-[#e5a93c]/60" />
                  <span className="font-mono-tabular text-[10px] tracking-[0.14em] text-[#71717a]">
                    IMAGE PREVIEW SLOT
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Slots */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono-tabular text-[11px] tracking-[0.16em] text-[#e5a93c]">
              GALLERY SCREENSHOT SLOTS ({gallery.length}/12)
            </span>
            {gallery.length < 12 && (
              <button
                type="button"
                onClick={handleAddGallerySlot}
                className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-1.5 font-mono-tabular text-[11px] text-[#d4d4d8] hover:border-[#e5a93c] hover:text-[#e5a93c] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ADD SLOT</span>
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {gallery.map((shot, idx) => (
              <div
                key={shot.id}
                className="grid grid-cols-1 gap-3 border border-white/10 bg-[#08080a] p-3.5 sm:grid-cols-12 sm:items-center"
              >
                <input
                  type="text"
                  value={shot.label}
                  onChange={(e) => handleGalleryChange(idx, 'label', e.target.value)}
                  placeholder="Label"
                  aria-label={`Gallery slot ${idx + 1} label`}
                  className="sm:col-span-3 border border-white/15 bg-[#111114] px-3 py-2 text-xs text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
                />
                <input
                  type="text"
                  value={shot.imageUrl}
                  onChange={(e) =>
                    handleGalleryChange(idx, 'imageUrl', e.target.value)
                  }
                  placeholder="Screenshot Image URL"
                  aria-label={`Gallery slot ${idx + 1} image URL`}
                  className="sm:col-span-5 border border-white/15 bg-[#111114] px-3 py-2 text-xs text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
                />
                <input
                  type="text"
                  value={shot.caption || ''}
                  onChange={(e) =>
                    handleGalleryChange(idx, 'caption', e.target.value)
                  }
                  placeholder="Optional caption"
                  aria-label={`Gallery slot ${idx + 1} caption`}
                  className="sm:col-span-3 border border-white/15 bg-[#111114] px-3 py-2 text-xs text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
                />
                <div className="sm:col-span-1 flex justify-end">
                  {gallery.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGallerySlot(idx)}
                      aria-label={`Remove gallery slot ${idx + 1}`}
                      className="inline-flex h-8 w-8 items-center justify-center border border-white/10 text-[#a1a1aa] hover:border-rose-400/50 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Distribution Links */}
        <div className="border-t border-white/10 pt-6">
          <span className="block font-mono-tabular text-[11px] tracking-[0.16em] text-[#e5a93c]">
            DISTRIBUTION &amp; STORE LINKS
          </span>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storeLinks.map((store) => (
              <label key={store.platform} className="flex flex-col gap-1.5">
                <span className="font-mono-tabular text-[11px] text-[#a1a1aa]">
                  {store.platform}
                </span>
                <input
                  type="url"
                  value={store.url}
                  onChange={(e) =>
                    handleStoreChange(store.platform, e.target.value)
                  }
                  placeholder="https://..."
                  className="border border-white/15 bg-[#08080a] px-3 py-2 text-xs text-[#f4f4f0] focus:border-[#e5a93c] focus:outline-none"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Submit Footer */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-6">
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="min-h-[44px] border border-white/15 px-5 py-2.5 text-xs font-medium tracking-[0.12em] text-[#a1a1aa] hover:text-[#f4f4f0] disabled:opacity-50 cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[44px] items-center gap-2 bg-[#e5a93c] px-6 py-2.5 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>
              {saving
                ? 'SAVING TO FIRESTORE...'
                : mode === 'create'
                  ? 'CREATE PROJECT'
                  : 'SAVE CHANGES'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
