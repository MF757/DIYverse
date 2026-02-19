import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/browserClient';
import { Container, Button, Input, Textarea } from '../components/ui';
import styles from './PublishPage.module.css';

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
}

export function PublishPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateSlugFromTitle = (newTitle: string) => {
    setTitle(newTitle);
    if (!slug || slug === slugFromTitle(title)) {
      setSlug(slugFromTitle(newTitle));
    }
  };

  const validateStep1 = (): boolean => {
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = 'Title is required.';
    else if (title.trim().length < 2) err.title = 'Title must be at least 2 characters.';
    const s = slug.trim();
    if (!s) err.slug = 'Slug is required.';
    else if (!/^[a-z0-9][a-z0-9_-]*$/.test(s)) err.slug = 'Slug must be lowercase letters, numbers, hyphens, underscores.';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;
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

    const { error: e } = await supabase.from('projects').insert({
      owner_id: profile.id,
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim() || null,
      cover_url: coverUrl.trim() || null,
      is_public: isPublic,
    });

    setSubmitting(false);
    if (e) {
      setError(e.message);
      return;
    }
    navigate('/profile');
  };

  return (
    <Container>
      <div className={styles.page}>
        <h1 className={styles.title}>Publish a project</h1>
        <p className={styles.lead}>Add your DIY project so others can discover and build it.</p>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.form}>
          <section className={styles.section} aria-labelledby="step1-heading">
            <h2 id="step1-heading" className={styles.sectionTitle}>Basics</h2>
            <Input
              label="Project title"
              value={title}
              onChange={(e) => updateSlugFromTitle(e.target.value)}
              placeholder="e.g. ESP32 weather station"
              error={fieldErrors.title}
              required
            />
            <Input
              label="URL slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. esp32-weather-station"
              error={fieldErrors.slug}
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short overview of the project…"
              rows={4}
            />
          </section>

          <section className={styles.section} aria-labelledby="step2-heading">
            <h2 id="step2-heading" className={styles.sectionTitle}>Media & visibility</h2>
            <Input
              label="Cover image URL"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://…"
            />
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label htmlFor="isPublic">List as public (visible in Discover)</label>
            </div>
          </section>

          <div className={styles.actions}>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Publishing…' : 'Publish project'}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
