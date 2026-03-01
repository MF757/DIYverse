import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase/browserClient';
import { getStoragePath, PROJECT_ASSETS_BUCKET } from '../lib/storage';
import { Container, Button, Input, Textarea } from '../components/ui';
import { ImageUpload } from '../components/upload/ImageUpload';
import { TagInput } from '../components/upload/TagInput';
import { BOMEditor } from '../components/upload/BOMEditor';
import { FileUpload } from '../components/upload/FileUpload';
import { InstructionBuilder } from '../components/upload/InstructionBuilder';
import {
  TITLE_MAX_LENGTH,
  SLUG_MAX_LENGTH,
  serializeDescriptionWithMetadata,
  parseDescriptionWithMetadata,
  type ProjectMetadata,
  type MaterialItem,
  type InstructionStep,
  type FileRef,
} from '../types/projectUpload';
import type { ImageFile } from '../components/upload/ImageUpload';
import type { PendingFile } from '../components/upload/FileUpload';
import {
  loadProjectBom,
  loadProjectInstructionSteps,
  loadProjectFiles,
  loadProjectImages,
  saveProjectBom,
  saveProjectInstructionSteps,
  saveProjectFiles,
  saveProjectImages,
} from '../lib/projectData';
import styles from './ProjectUploadPage.module.css';

const DRAFT_KEY = 'diyverse-project-draft';

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
}

function uniqueFilename(original: string): string {
  const ext = original.includes('.') ? original.slice(original.lastIndexOf('.')) : '';
  const base = original.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9_-]/gi, '_');
  return `${base}_${Date.now()}${ext}`;
}

interface FormState {
  title: string;
  slug: string;
  description: string;
  images: ImageFile[];
  thumbnailIndex: number;
  tags: string[];
  materials: MaterialItem[];
  instructionMode: 'maker' | 'upload';
  instructionSteps: InstructionStep[];
  stepImageFiles: Record<string, File>;
  customInstructionFile: File | null;
  files: PendingFile[];
  isPublic: boolean;
}

const initialForm: FormState = {
  title: '',
  slug: '',
  description: '',
  images: [],
  thumbnailIndex: 0,
  tags: [],
  materials: [],
  instructionMode: 'maker',
  instructionSteps: [],
  stepImageFiles: {},
  customInstructionFile: null,
  files: [],
  isPublic: true,
};

function loadDraft(): Partial<FormState> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      ...initialForm,
      title: typeof parsed.title === 'string' ? parsed.title : '',
      slug: typeof parsed.slug === 'string' ? parsed.slug : '',
      description: typeof parsed.description === 'string' ? parsed.description : '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t): t is string => typeof t === 'string') : [],
      materials: Array.isArray(parsed.materials)
        ? (parsed.materials as MaterialItem[]).map((m) => ({
            id: typeof m.id === 'string' ? m.id : crypto.randomUUID(),
            name: typeof m.name === 'string' ? m.name : '',
            quantity: typeof m.quantity === 'string' ? m.quantity : '1',
            link: m.link != null && typeof m.link === 'string' ? m.link : null,
          }))
        : [],
      instructionMode: parsed.instructionMode === 'upload' ? 'upload' : 'maker',
      instructionSteps: Array.isArray(parsed.instructionSteps)
        ? (parsed.instructionSteps as InstructionStep[]).map((s) => ({
            id: typeof s.id === 'string' ? s.id : crypto.randomUUID(),
            description: typeof s.description === 'string' ? s.description : '',
            materialIds: Array.isArray(s.materialIds) ? s.materialIds.filter((x): x is string => typeof x === 'string') : [],
            tools: Array.isArray(s.tools) ? s.tools.filter((x): x is string => typeof x === 'string') : [],
            imageUrl: s.imageUrl != null && typeof s.imageUrl === 'string' ? s.imageUrl : null,
          }))
        : [],
      isPublic: parsed.isPublic !== false,
    };
  } catch {
    return null;
  }
}

function saveDraft(state: FormState) {
  try {
    const toSave = {
      title: state.title,
      slug: state.slug,
      description: state.description,
      tags: state.tags,
      materials: state.materials,
      instructionMode: state.instructionMode,
      instructionSteps: state.instructionSteps.map((s) => ({
        id: s.id,
        description: s.description,
        materialIds: s.materialIds,
        tools: s.tools,
      })),
      isPublic: state.isPublic,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

export function ProjectUploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editIdFromUrl = searchParams.get('edit');

  const [form, setForm] = useState<FormState>(() => {
    if (editIdFromUrl) return initialForm;
    const draft = loadDraft();
    return draft ? { ...initialForm, ...draft } : initialForm;
  });
  const [editProjectId, setEditProjectId] = useState<string | null>(editIdFromUrl ?? null);
  const [editLoading, setEditLoading] = useState(!!editIdFromUrl);
  const [existingFileRefs, setExistingFileRefs] = useState<{ id: string; name: string; path: string; type: 'stl' | '3mf' | 'gerber' | 'pdf' | 'other' }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!editIdFromUrl) return;
    let cancelled = false;
    (async () => {
      setEditLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled || !user) {
        setEditLoading(false);
        if (!cancelled && editIdFromUrl) setError('You must be signed in to edit a project.');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      if (cancelled || !profile) {
        setEditLoading(false);
        return;
      }
      const { data: project, error: projectErr } = await supabase
        .from('projects')
        .select('id, owner_id, title, slug, description, cover_url, is_public')
        .eq('id', editIdFromUrl)
        .eq('owner_id', profile.id)
        .single();
      if (cancelled) {
        setEditLoading(false);
        return;
      }
      if (projectErr || !project) {
        setError('Project not found or you don’t have permission to edit it.');
        setEditLoading(false);
        return;
      }
      const { description: descText, metadata } = parseDescriptionWithMetadata(project.description ?? null);
      const meta = metadata ?? {
        tags: [],
        imageUrls: [],
        materials: [],
        instructionMode: 'maker' as const,
        instructionSteps: null,
        instructionFileRef: null,
        fileRefs: [],
      };
      const [dbImages, dbMaterials, dbSteps, dbFiles] = await Promise.all([
        loadProjectImages(project.id),
        loadProjectBom(project.id),
        loadProjectInstructionSteps(project.id),
        loadProjectFiles(project.id),
      ]);
      const imageUrls: string[] =
        dbImages.length > 0
          ? dbImages
          : Array.isArray(meta.imageUrls)
            ? meta.imageUrls.filter((u): u is string => typeof u === 'string')
            : [];
      const existingImages: ImageFile[] = imageUrls.map((path) => {
        const { data } = supabase.storage.from(PROJECT_ASSETS_BUCKET).getPublicUrl(path);
        return {
          id: crypto.randomUUID(),
          existingPath: path,
          previewUrl: data?.publicUrl ?? path,
        };
      });
      const steps: InstructionStep[] = Array.isArray(meta.instructionSteps)
        ? meta.instructionSteps.map((s) => ({
            id: typeof s.id === 'string' ? s.id : crypto.randomUUID(),
            description: typeof s.description === 'string' ? s.description : '',
            materialIds: Array.isArray(s.materialIds) ? s.materialIds.filter((x): x is string => typeof x === 'string') : [],
            tools: Array.isArray(s.tools) ? s.tools.filter((x): x is string => typeof x === 'string') : [],
            imageUrl: s.imageUrl != null && typeof s.imageUrl === 'string' ? s.imageUrl : null,
          }))
        : [];
      const materials: MaterialItem[] =
        dbMaterials.length > 0
          ? dbMaterials.map((m) => ({
              id: m.id,
              name: m.name,
              quantity: m.quantity,
              link: m.link,
            }))
          : Array.isArray(meta.materials)
            ? meta.materials.map((m) => ({
                id: typeof m.id === 'string' ? m.id : crypto.randomUUID(),
                name: typeof m.name === 'string' ? m.name : '',
                quantity: typeof m.quantity === 'string' ? m.quantity : '1',
                link: m.link != null && typeof m.link === 'string' ? m.link : null,
              }))
            : [];
      const instructionSteps: InstructionStep[] =
        dbSteps.length > 0
          ? dbSteps
          : Array.isArray(meta.instructionSteps)
            ? meta.instructionSteps.map((s) => ({
                id: typeof s.id === 'string' ? s.id : crypto.randomUUID(),
                description: typeof s.description === 'string' ? s.description : '',
                materialIds: Array.isArray(s.materialIds) ? s.materialIds.filter((x): x is string => typeof x === 'string') : [],
                tools: Array.isArray(s.tools) ? s.tools.filter((x): x is string => typeof x === 'string') : [],
                imageUrl: s.imageUrl != null && typeof s.imageUrl === 'string' ? s.imageUrl : null,
              }))
            : [];
      setExistingFileRefs(dbFiles.length > 0 ? dbFiles : []);
      setForm({
        title: project.title,
        slug: project.slug,
        description: descText,
        images: existingImages,
        thumbnailIndex: project.cover_url && imageUrls.indexOf(project.cover_url) >= 0
          ? imageUrls.indexOf(project.cover_url)
          : 0,
        tags: Array.isArray(meta.tags) ? meta.tags.filter((t): t is string => typeof t === 'string') : [],
        materials,
        instructionMode: meta.instructionMode === 'upload' ? 'upload' : 'maker',
        instructionSteps,
        stepImageFiles: {},
        customInstructionFile: null,
        files: [],
        isPublic: project.is_public,
      });
      setEditProjectId(project.id);
      setEditLoading(false);
    })();
    return () => { cancelled = true; };
  }, [editIdFromUrl]);

  useEffect(() => {
    if (editProjectId) return;
    const t = setTimeout(() => saveDraft(form), 500);
    return () => clearTimeout(t);
  }, [form, editProjectId]);

  const updateSlugFromTitle = useCallback((newTitle: string) => {
    setForm((f) => ({
      ...f,
      title: newTitle.slice(0, TITLE_MAX_LENGTH),
      slug: !f.slug || f.slug === slugFromTitle(f.title) ? slugFromTitle(newTitle).slice(0, SLUG_MAX_LENGTH) : f.slug,
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const err: Record<string, string> = {};
    if (!form.title.trim()) err.title = 'Title is required.';
    else if (form.title.trim().length < 2) err.title = 'Title must be at least 2 characters.';
    const s = form.slug.trim();
    if (!s) err.slug = 'Slug is required.';
    else if (!/^[a-z0-9][a-z0-9_-]*$/.test(s)) err.slug = 'Slug must be lowercase letters, numbers, hyphens, underscores.';
    if (form.images.length === 0) err.images = 'At least one image is required.';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }, [form.title, form.slug, form.images.length]);

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError(editProjectId ? 'You must be signed in to save changes.' : 'You must be signed in to publish.');
      setSubmitting(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!profile) {
      setError('Profile not found. Please try again.');
      setSubmitting(false);
      return;
    }

    let projectId: string;
    if (editProjectId) {
      projectId = editProjectId;
    } else {
      const descriptionFinal = serializeDescriptionWithMetadata(form.description.trim(), {
        tags: form.tags,
        imageUrls: [],
        materials: form.materials.filter((m) => m.name.trim()),
        instructionMode: form.instructionMode,
        instructionSteps: form.instructionMode === 'maker' ? form.instructionSteps : null,
        instructionFileRef: null,
        fileRefs: [],
      });
      const { data: project, error: insertErr } = await supabase
        .from('projects')
        .insert({
          owner_id: profile.id,
          title: form.title.trim(),
          slug: form.slug.trim().toLowerCase(),
          description: descriptionFinal || null,
          cover_url: null,
          is_public: form.isPublic,
        })
        .select('id')
        .single();
      if (insertErr || !project) {
        setError(insertErr?.message ?? 'Failed to create project.');
        setSubmitting(false);
        return;
      }
      projectId = project.id;
    }

    const metadata: ProjectMetadata = {
      tags: form.tags,
      imageUrls: [],
      materials: form.materials.filter((m) => m.name.trim()),
      instructionMode: form.instructionMode,
      instructionSteps: form.instructionMode === 'maker' ? form.instructionSteps : null,
      instructionFileRef: null,
      fileRefs: [],
    };

    let coverUrl: string | null = null;
    if (form.images.length > 0) {
      for (let i = 0; i < form.images.length; i++) {
        const img = form.images[i];
        if (img.existingPath) {
          metadata.imageUrls.push(img.existingPath);
        } else if (img.file) {
          const name = uniqueFilename(img.file.name);
          const path = getStoragePath(projectId, 'images', name);
          const { error: e } = await supabase.storage.from(PROJECT_ASSETS_BUCKET).upload(path, img.file, { upsert: true });
          if (!e) metadata.imageUrls.push(path);
        }
      }
      const thumb = form.images[form.thumbnailIndex];
      coverUrl = thumb?.existingPath ?? (metadata.imageUrls[form.thumbnailIndex] ?? null);
    }

    for (const pf of form.files) {
      const name = uniqueFilename(pf.file.name);
      const path = getStoragePath(projectId, 'files', name);
      const { error: e } = await supabase.storage.from(PROJECT_ASSETS_BUCKET).upload(path, pf.file, { upsert: true });
      if (!e) {
        metadata.fileRefs.push({ id: crypto.randomUUID(), name: pf.file.name, path, type: pf.type });
      }
    }

    if (form.instructionMode === 'upload' && form.customInstructionFile) {
      const name = uniqueFilename(form.customInstructionFile.name);
      const path = getStoragePath(projectId, 'files', name);
      const { error: e } = await supabase.storage
        .from(PROJECT_ASSETS_BUCKET)
        .upload(path, form.customInstructionFile, { upsert: true });
      if (!e) metadata.instructionFileRef = { path, name };
    }

    if (form.instructionMode === 'maker' && metadata.instructionSteps) {
      for (let i = 0; i < metadata.instructionSteps.length; i++) {
        const step = metadata.instructionSteps[i];
        const file = form.stepImageFiles[step.id];
        if (file) {
          const name = uniqueFilename(file.name);
          const path = getStoragePath(projectId, 'images', `step-${i}-${name}`);
          const { error: e } = await supabase.storage.from(PROJECT_ASSETS_BUCKET).upload(path, file, { upsert: true });
          if (!e) {
            metadata.instructionSteps[i] = { ...step, imageUrl: path };
          }
        }
      }
    }

    const descWithMeta = serializeDescriptionWithMetadata(form.description.trim(), metadata);

    const updatePayload: {
      description: string | null;
      cover_url: string | null;
      title?: string;
      slug?: string;
      is_public?: boolean;
      updated_at?: string;
    } = { description: descWithMeta, cover_url: coverUrl };
    if (editProjectId) {
      updatePayload.title = form.title.trim();
      updatePayload.slug = form.slug.trim().toLowerCase();
      updatePayload.is_public = form.isPublic;
      updatePayload.updated_at = new Date().toISOString();
    }

    await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', projectId);

    const imagesError = await saveProjectImages(projectId, metadata.imageUrls);
    if (imagesError) {
      setError(imagesError);
      setSubmitting(false);
      return;
    }

    const componentIdMap = await saveProjectBom(projectId, form.materials.filter((m) => m.name.trim()));
    if (form.instructionMode === 'maker' && form.instructionSteps.length > 0) {
      await saveProjectInstructionSteps(projectId, form.instructionSteps, componentIdMap);
    } else {
      await saveProjectInstructionSteps(projectId, [], new Map());
    }
    const allFileRefs = [
      ...existingFileRefs.map((f) => ({ id: f.id, name: f.name, path: f.path, type: f.type as FileRef['type'] })),
      ...metadata.fileRefs,
    ];
    const filesError = await saveProjectFiles(projectId, allFileRefs);
    if (filesError) {
      setError(filesError);
      setSubmitting(false);
      return;
    }

    if (!editProjectId) localStorage.removeItem(DRAFT_KEY);
    setSubmitting(false);
    navigate(`/project/${profile.id}/${form.slug.trim().toLowerCase()}`);
  };

  const isEdit = Boolean(editProjectId);

  const performDelete = useCallback(async () => {
    if (!editProjectId || deleting) return;
    setDeleting(true);
    setError(null);
    const { error: deleteErr } = await supabase.from('projects').delete().eq('id', editProjectId);
    setDeleting(false);
    if (deleteErr) {
      setError(deleteErr.message ?? 'Failed to delete project.');
      return;
    }
    setDeleteConfirmOpen(false);
    setDeleteConfirmValue('');
    navigate('/profile', { replace: true });
  }, [editProjectId, deleting, navigate]);

  const openDeleteConfirm = useCallback(() => {
    setDeleteConfirmValue('');
    setError(null);
    setDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    if (!deleting) {
      setDeleteConfirmOpen(false);
      setDeleteConfirmValue('');
    }
  }, [deleting]);

  const deleteConfirmValid = deleteConfirmValue === 'DELETE';

  return (
    <Container>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{isEdit ? 'Edit project' : 'Create project'}</h1>
          <p className={styles.lead}>
            {isEdit
              ? 'Update your project details, images, and instructions.'
              : 'Share your DIY project with clear images, materials, and instructions.'}
          </p>
        </header>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {editLoading && (
          <p className={styles.status} role="status">Loading project…</p>
        )}

        {!editLoading && (!editIdFromUrl || editProjectId) && (
        <form
          className={styles.form}
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        >
          <section className={styles.section} aria-labelledby="heading-section">
            <h2 id="heading-section" className={styles.sectionTitle}>Heading</h2>
            <Input
              label="Project title"
              value={form.title}
              onChange={(e) => updateSlugFromTitle(e.target.value)}
              placeholder="e.g. ESP32 weather station"
              error={fieldErrors.title}
              maxLength={TITLE_MAX_LENGTH}
              required
            />
            <p className={styles.hint}>{form.title.length}/{TITLE_MAX_LENGTH}</p>
            <Input
              label="URL slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.slice(0, SLUG_MAX_LENGTH) }))}
              placeholder="e.g. esp32-weather-station"
              error={fieldErrors.slug}
              maxLength={SLUG_MAX_LENGTH}
            />
          </section>

          <section className={styles.section} aria-labelledby="images-section">
            <h2 id="images-section" className={styles.sectionTitle}>Images</h2>
            <ImageUpload
              images={form.images}
              onChange={(images) => setForm((f) => ({ ...f, images }))}
              thumbnailIndex={form.thumbnailIndex}
              onThumbnailChange={(idx) => setForm((f) => ({ ...f, thumbnailIndex: idx }))}
              error={fieldErrors.images}
            />
          </section>

          <section className={styles.section} aria-labelledby="tags-section">
            <h2 id="tags-section" className={styles.sectionTitle}>Tags</h2>
            <TagInput
              tags={form.tags}
              onChange={(tags) => setForm((f) => ({ ...f, tags }))}
            />
          </section>

          <section className={styles.section} aria-labelledby="description-section">
            <h2 id="description-section" className={styles.sectionTitle}>Description</h2>
            <Textarea
              label="Overview and context"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What motivated this project? What does it do? …"
              rows={5}
            />
          </section>

          <section className={styles.section} aria-labelledby="bom-section">
            <h2 id="bom-section" className={styles.sectionTitle}>Material list (BOM)</h2>
            <BOMEditor
              materials={form.materials}
              onChange={(materials) => setForm((f) => ({ ...f, materials }))}
            />
          </section>

          <section className={styles.section} aria-labelledby="files-section">
            <h2 id="files-section" className={styles.sectionTitle}>Files</h2>
            <p className={styles.hint}>3MF, STL, Gerber, PDF</p>
            <FileUpload
              files={form.files}
              onChange={(files) => setForm((f) => ({ ...f, files }))}
            />
          </section>

          <section className={styles.section} aria-labelledby="instructions-section">
            <h2 id="instructions-section" className={styles.sectionTitle}>Instructions</h2>
            <InstructionBuilder
              mode={form.instructionMode}
              onModeChange={(instructionMode) => setForm((f) => ({ ...f, instructionMode }))}
              steps={form.instructionSteps}
              onStepsChange={(instructionSteps) => setForm((f) => ({ ...f, instructionSteps }))}
              onStepImageChange={(stepId, file) =>
                setForm((f) => ({
                  ...f,
                  stepImageFiles: file
                    ? { ...f.stepImageFiles, [stepId]: file }
                    : (() => {
                        const next = { ...f.stepImageFiles };
                        delete next[stepId];
                        return next;
                      })(),
                }))
              }
              materials={form.materials}
              customFile={form.customInstructionFile}
              onCustomFileChange={(customInstructionFile) => setForm((f) => ({ ...f, customInstructionFile }))}
            />
          </section>

          <section className={styles.section} aria-labelledby="visibility-section">
            <h2 id="visibility-section" className={styles.sectionTitle}>Visibility</h2>
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="isPublic"
                checked={form.isPublic}
                onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
              />
              <label htmlFor="isPublic">List as public (visible in Discover)</label>
            </div>
          </section>

          <div className={styles.actions}>
            <Button type="submit" disabled={submitting}>
              {submitting ? (isEdit ? 'Saving…' : 'Publishing…') : (isEdit ? 'Save changes' : 'Publish project')}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="secondary"
                className={styles.deleteBtn}
                disabled={submitting}
                onClick={openDeleteConfirm}
              >
                Delete project
              </Button>
            )}
          </div>
        </form>
        )}
      </div>

      {deleteConfirmOpen && (
        <div
          className={styles.deleteBackdrop}
          onClick={(e) => e.target === e.currentTarget && closeDeleteConfirm()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-project-title"
        >
          <div className={styles.deleteModal}>
            <h2 id="delete-project-title" className={styles.deleteModalTitle}>
              Delete project
            </h2>
            <p className={styles.deleteModalWarning}>
              This will permanently delete this project and cannot be undone.
            </p>
            <p className={styles.deleteModalInstruction}>
              Type <strong>DELETE</strong> below to confirm.
            </p>
            <div className={styles.deleteConfirmRow}>
              <Input
                type="text"
                value={deleteConfirmValue}
                onChange={(e) => setDeleteConfirmValue(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Type DELETE to confirm"
                disabled={deleting}
              />
            </div>
            <div className={styles.deleteModalActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={closeDeleteConfirm}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={styles.deleteConfirmBtn}
                disabled={!deleteConfirmValid || deleting}
                onClick={performDelete}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
