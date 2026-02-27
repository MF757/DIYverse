import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase, publicSupabase } from '../lib/supabase/browserClient';
import { Container } from '../components/ui';
import { ProjectCard } from '../components/project/ProjectCard';
import { Button, Input, Textarea } from '../components/ui';
import type { ProjectPublicRow } from '../types/project';
import type { Tables } from '../lib/supabase/database.types';
import { AVATARS_BUCKET } from '../lib/storage';
import styles from './ProfilePage.module.css';

const BIO_MAX_LENGTH = 500;
const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const AVATAR_MAX_SIZE_MB = 2;

function getAvatarSrc(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarUrl);
  return data?.publicUrl ?? null;
}

function canChangeDisplayName(displayNameChangedAt: string | null): boolean {
  if (!displayNameChangedAt) return true;
  const changed = new Date(displayNameChangedAt).getTime();
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return changed < monthAgo;
}

function nextNameChangeDate(displayNameChangedAt: string | null): Date | null {
  if (!displayNameChangedAt) return null;
  const d = new Date(displayNameChangedAt);
  d.setMonth(d.getMonth() + 1);
  return d;
}

export function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [projects, setProjects] = useState<ProjectPublicRow[]>([]);
  const [savedProjects, setSavedProjects] = useState<ProjectPublicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!userId) {
        if (!user) {
          setLoading(false);
          return;
        }
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();
        if (cancelled) return;
        if (!p) {
          setError('Profile not found.');
          setLoading(false);
          return;
        }
        setProfile(p);
        setIsOwnProfile(true);
        const { data: projs } = await supabase
          .from('projects')
          .select('id, owner_id, title, slug, description, cover_url, is_public, created_at, updated_at')
          .eq('owner_id', p.id)
          .order('created_at', { ascending: false });
        if (cancelled) return;
        const withOwner = (projs ?? []).map((row) => ({
          ...row,
          owner_display_name: p.display_name,
          owner_avatar_url: p.avatar_url,
        })) as ProjectPublicRow[];
        setProjects(withOwner);
        const { data: saves } = await supabase
          .from('project_saves')
          .select('project_id')
          .eq('profile_id', p.id)
          .order('created_at', { ascending: false });
        if (cancelled) {
          setLoading(false);
          return;
        }
        const savedIds = (saves ?? []).map((s) => s.project_id);
        if (savedIds.length > 0) {
          const { data: projRows } = await supabase
            .from('projects')
            .select('id, owner_id, title, slug, description, cover_url, is_public, created_at, updated_at')
            .in('id', savedIds);
          if (!cancelled && projRows && projRows.length > 0) {
            const ownerIds = [...new Set(projRows.map((r) => r.owner_id))];
            const { data: ownerRows } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .in('id', ownerIds);
            const ownerMap = new Map((ownerRows ?? []).map((o) => [o.id, o]));
            const byId = new Map(projRows.map((row) => {
              const owner = ownerMap.get(row.owner_id);
              return [row.id, { ...row, owner_display_name: owner?.display_name ?? null, owner_avatar_url: owner?.avatar_url ?? null } as ProjectPublicRow];
            }));
            const ordered = savedIds.map((id) => byId.get(id)).filter(Boolean) as ProjectPublicRow[];
            setSavedProjects(ordered);
          }
        }
        setLoading(false);
        return;
      }

      const { data: p } = await publicSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (cancelled) return;
      if (!p) {
        setError('Profile not found.');
        setLoading(false);
        return;
      }
      setProfile(p);
      setIsOwnProfile(!!user && (await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single()).data?.id === p.id);

      const { data: projs } = await publicSupabase
        .from('projects_public_with_owner')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (cancelled) return;
      setProjects((projs ?? []) as ProjectPublicRow[]);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const startEditing = () => {
    if (!profile) return;
    setEditDisplayName(profile.display_name ?? '');
    setEditBio(profile.bio ?? '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setSaveError(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSaveError('Please choose a JPEG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
      setSaveError(`Image must be under ${AVATAR_MAX_SIZE_MB}MB.`);
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setSaveError(null);
  };

  const saveProfile = async () => {
    if (!profile || !isOwnProfile) return;
    setSaveError(null);
    setSaving(true);
    try {
      let newAvatarUrl: string | null = profile.avatar_url;
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${profile.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from(AVATARS_BUCKET)
          .upload(path, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        newAvatarUrl = path;
      }
      const updates: { display_name?: string | null; bio?: string | null; avatar_url?: string | null } = {
        bio: editBio.trim() || null,
        avatar_url: newAvatarUrl,
      };
      const nameAllowed = canChangeDisplayName(profile.display_name_changed_at ?? null);
      if (nameAllowed) {
        updates.display_name = editDisplayName.trim() || null;
      }
      const { error: updateErr } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      if (updateErr) throw updateErr;
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              display_name: nameAllowed ? (editDisplayName.trim() || null) : prev.display_name,
              bio: editBio.trim() || null,
              avatar_url: newAvatarUrl,
              display_name_changed_at:
                nameAllowed && (editDisplayName.trim() || null) !== (prev.display_name ?? '')
                  ? new Date().toISOString()
                  : prev.display_name_changed_at,
            }
          : null
      );
      cancelEditing();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProject = (project: ProjectPublicRow) => {
    navigate(`/publish?edit=${project.id}`);
  };

  if (!userId && !loading && !profile) {
    return <Navigate to="/signin" replace />;
  }

  if (error) {
    return (
      <Container>
        <div className={styles.error} role="alert">
          {error}
        </div>
        <Link to="/">Back to Discover</Link>
      </Container>
    );
  }

  if (loading || !profile) {
    return (
      <Container>
        <p className={styles.status}>Loading…</p>
      </Container>
    );
  }

  const displayName = profile.display_name ?? 'Maker';
  const avatarSrc = getAvatarSrc(profile.avatar_url);
  const nameChangeAllowed = canChangeDisplayName(profile.display_name_changed_at ?? null);
  const nextChange = nextNameChangeDate(profile.display_name_changed_at ?? null);

  return (
    <div className={styles.page}>
      <Container>
        <header className={styles.header}>
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt=""
              className={styles.avatar}
              width={80}
              height={80}
              decoding="async"
            />
          ) : (
            <div className={styles.avatarPlaceholder} aria-hidden>
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className={styles.name}>{displayName}</h1>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            {isOwnProfile && !isEditing && (
              <div className={styles.editBar}>
                <Button variant="secondary" size="sm" onClick={startEditing}>
                  Edit profile
                </Button>
                <Link to="/publish" className={styles.publishLink}>
                  Publish a project
                </Link>
              </div>
            )}
            {isOwnProfile && isEditing && (
              <Link to="/publish" className={styles.publishLink}>
                Publish a project
              </Link>
            )}
          </div>
        </header>

        {isOwnProfile && isEditing && (
          <section className={styles.editForm} aria-label="Edit profile">
            <div className={styles.avatarEdit}>
              <img
                src={avatarPreview ?? avatarSrc ?? ''}
                alt=""
                className={styles.avatarEditPreview}
                width={80}
                height={80}
                decoding="async"
              />
              <div className={styles.avatarEditActions}>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept={AVATAR_ACCEPT}
                  onChange={handleAvatarChange}
                  className={styles.hiddenInput}
                  aria-label="Change profile picture"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  Change photo
                </Button>
                <span className={styles.nameChangeHint}>
                  JPEG, PNG, WebP or GIF, max {AVATAR_MAX_SIZE_MB}MB
                </span>
              </div>
            </div>
            <Input
              label="Display name"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              disabled={!nameChangeAllowed}
              maxLength={100}
              placeholder="Your display name"
            />
            {!nameChangeAllowed && nextChange && (
              <p className={styles.nameChangeHint} role="status">
                You can change your name again on{' '}
                {nextChange.toLocaleDateString(undefined, {
                  dateStyle: 'medium',
                })}
                .
              </p>
            )}
            <div>
              <Textarea
                label="About you (optional)"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={BIO_MAX_LENGTH}
                placeholder="A short description..."
                rows={4}
              />
              <p className={styles.bioCounter}>
                {editBio.length} / {BIO_MAX_LENGTH}
              </p>
            </div>
            {saveError && (
              <p className={styles.error} role="alert">
                {saveError}
              </p>
            )}
            <div className={styles.formActions}>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="ghost" onClick={cancelEditing} disabled={saving}>
                Cancel
              </Button>
            </div>
          </section>
        )}

        <section className={styles.section} aria-label="Projects">
          <h2 className={styles.sectionTitle}>
            {isOwnProfile ? 'Your projects' : 'Projects'}
          </h2>
          {projects.length === 0 ? (
            <p className={styles.empty}>
              {isOwnProfile ? 'You haven’t published any projects yet.' : 'No projects yet.'}
            </p>
          ) : (
            <ul className={styles.grid} role="list">
              {projects.map((project) => (
                <li key={project.id}>
                  <ProjectCard
                    project={project}
                    showEditAction={isOwnProfile}
                    onEditClick={handleEditProject}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {isOwnProfile && (
          <section className={styles.section} aria-label="Saved projects">
            <h2 className={styles.sectionTitle}>Saved projects</h2>
            {savedProjects.length === 0 ? (
              <p className={styles.empty}>
                Projects you save will appear here.
              </p>
            ) : (
              <ul className={styles.grid} role="list">
                {savedProjects.map((project) => (
                  <li key={project.id}>
                    <ProjectCard project={project} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </Container>
    </div>
  );
}
