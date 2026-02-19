import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/browserClient';
import { getStoragePath } from '../lib/storage';
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
  type ProjectMetadata,
  type MaterialItem,
  type InstructionStep,
} from '../types/projectUpload';
import type { ImageFile } from '../components/upload/ImageUpload';
import type { PendingFile } from '../components/upload/FileUpload';
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
            ...m,
            id: m.id || crypto.randomUUID(),
          }))
        : [],
      instructionMode: parsed.instructionMode === 'upload' ? 'upload' : 'maker',
      instructionSteps: Array.isArray(parsed.instructionSteps)
        ? (parsed.instructionSteps as InstructionStep[]).map((s) => ({
            ...s,
            id: s.id || crypto.randomUUID(),
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
  const [form, setForm] = useState<FormState>(() => {
    const draft = loadDraft();
    return draft ? { ...initialForm, ...draft } : initialForm;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => saveDraft(form), 500);
    return () => clearTimeout(t);
  }, [form]);

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
      setError('You must be signed in to publish.');
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

    const metadata: ProjectMetadata = {
      tags: form.tags,
      imageUrls: [],
      materials: form.materials.filter((m) => m.name.trim()),
      instructionMode: form.instructionMode,
      instructionSteps: form.instructionMode === 'maker' ? form.instructionSteps : null,
      instructionFileRef: null,
      fileRefs: [],
    };

    const descriptionFinal = serializeDescriptionWithMetadata(form.description.trim(), metadata);

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

    const projectId = project.id;
    let coverUrl: string | null = null;

    if (form.images.length > 0) {
      const thumb = form.images[form.thumbnailIndex];
      const imgName = uniqueFilename(thumb.file.name);
      const path = getStoragePath(projectId, 'images', imgName);
      const { error: uploadErr } = await supabase.storage
        .from('project-assets')
        .upload(path, thumb.file, { upsert: true });

      if (!uploadErr) {
        coverUrl = path;
        metadata.imageUrls = [path];
        for (let i = 0; i < form.images.length; i++) {
          if (i === form.thumbnailIndex) continue;
          const img = form.images[i];
          const name = uniqueFilename(img.file.name);
          const p = getStoragePath(projectId, 'images', name);
          const { error: e } = await supabase.storage.from('project-assets').upload(p, img.file, { upsert: true });
          if (!e) metadata.imageUrls.push(p);
        }
      }
    }

    for (const pf of form.files) {
      const name = uniqueFilename(pf.file.name);
      const path = getStoragePath(projectId, 'files', name);
      const { error: e } = await supabase.storage.from('project-assets').upload(path, pf.file, { upsert: true });
      if (!e) {
        metadata.fileRefs.push({ id: crypto.randomUUID(), name: pf.file.name, path, type: pf.type });
      }
    }

    if (form.instructionMode === 'upload' && form.customInstructionFile) {
      const name = uniqueFilename(form.customInstructionFile.name);
      const path = getStoragePath(projectId, 'files', name);
      const { error: e } = await supabase.storage
        .from('project-assets')
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
          const { error: e } = await supabase.storage.from('project-assets').upload(path, file, { upsert: true });
          if (!e) {
            metadata.instructionSteps[i] = { ...step, imageUrl: path };
          }
        }
      }
    }

    const descWithMeta = serializeDescriptionWithMetadata(form.description.trim(), metadata);

    await supabase
      .from('projects')
      .update({
        description: descWithMeta,
        cover_url: coverUrl,
      })
      .eq('id', projectId);

    localStorage.removeItem(DRAFT_KEY);
    setSubmitting(false);
    navigate(`/project/${profile.id}/${form.slug.trim().toLowerCase()}`);
  };

  return (
    <Container>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Create project</h1>
          <p className={styles.lead}>
            Share your DIY project with clear images, materials, and instructions.
          </p>
        </header>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

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
              {submitting ? 'Publishing…' : 'Publish project'}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
