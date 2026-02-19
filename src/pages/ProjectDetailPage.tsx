import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Container, Tabs } from '../components/ui';
import type { ProjectPublicRow } from '../types/project';
import { parseDescriptionWithMetadata } from '../types/projectUpload';
import { StorageImage } from '../components/project/StorageImage';
import { ProjectEngagementButtons } from '../components/project/ProjectEngagementButtons';
import { ShareButton } from '../components/project/ShareButton';
import { useProjectEngagement } from '../hooks/useProjectEngagement';
import { supabase } from '../lib/supabase/browserClient';
import styles from './ProjectDetailPage.module.css';

const PLACEHOLDER_AVATAR_DATA_URL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="28" height="28"%3E%3Crect width="28" height="28" fill="%23e2e4e8"/%3E%3C/svg%3E';

function formatProjectDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function ProjectDetailPage() {
  const { ownerId, slug } = useParams<{ ownerId: string; slug: string }>();
  const [project, setProject] = useState<ProjectPublicRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!ownerId || !slug) {
      setLoading(false);
      setError('Invalid project URL.');
      setProject(null);
      return;
    }
    setLoading(true);
    setError(null);
    let cancelled = false;

    // Public project detail: works for unauthenticated users (anon). RLS limits to is_public = true.
    async function load() {
      const { data, error: e } = await supabase
        .from('projects_public_with_owner')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('slug', slug)
        .maybeSingle();

      if (cancelled) return;
      if (e) {
        setError(e.message);
        setProject(null);
      } else {
        const row: ProjectPublicRow | null = data != null && typeof data === 'object' ? (data as ProjectPublicRow) : null;
        setProject(row);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ownerId, slug]);

  const parsed = useMemo(
    () => parseDescriptionWithMetadata(project?.description ?? null),
    [project?.description]
  );

  const imageList = useMemo(() => {
    const list: string[] = [];
    if (project?.cover_url) list.push(project.cover_url);
    const metaUrls = parsed?.metadata?.imageUrls ?? [];
    for (const u of metaUrls) {
      if (u && !list.includes(u)) list.push(u);
    }
    return list;
  }, [project?.cover_url, parsed?.metadata?.imageUrls]);

  if (loading) {
    return (
      <Container>
        <p className={styles.status}>Loading…</p>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container>
        <div className={styles.error} role="alert">
          {error ?? 'Project not found.'}
        </div>
        <p>
          <Link to="/">Back to Discover</Link>
        </p>
      </Container>
    );
  }

  const ownerName = project.owner_display_name ?? 'Unknown';

  const mainImagePath = imageList[selectedImageIndex] ?? imageList[0] ?? null;
  const projectDate = formatProjectDate(project.created_at);

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      panel: (
        <div className={styles.tabContent}>
          <div className={styles.descriptionBlock}>
            {parsed.description ? (
              <p className={styles.description}>{parsed.description}</p>
            ) : (
              <p className={styles.muted}>No overview provided.</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'instructions',
      label: 'Instructions',
      panel: (
        <div className={styles.tabContent}>
          <p className={styles.muted}>
            Instructions section. Backend can be extended with a steps or markdown field.
          </p>
        </div>
      ),
    },
    {
      id: 'files',
      label: 'Files / Downloads',
      panel: (
        <div className={styles.tabContent}>
          <p className={styles.muted}>
            Files and downloads. Backend can be extended with project_assets or file references.
          </p>
        </div>
      ),
    },
    {
      id: 'components',
      label: 'Components / BOM',
      panel: (
        <div className={styles.tabContent}>
          <p className={styles.muted}>
            Bill of materials. Backend can be extended with BOM or components table.
          </p>
        </div>
      ),
    },
    {
      id: 'comments',
      label: 'Comments',
      panel: (
        <div className={styles.tabContent}>
          <p className={styles.muted}>
            Comments. Backend can be extended with a comments table.
          </p>
        </div>
      ),
    },
  ];

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/project/${ownerId}/${slug}` : '';

  return (
    <div className={styles.page}>
      <Container className={styles.layout}>
        <div className={styles.twoCol}>
          <div className={styles.main}>
            <div className={styles.hero}>
              <div className={styles.heroImageBlock}>
                <div className={styles.mainImageWrap}>
                  {imageList.length > 1 && (
                    <>
                      <button
                        type="button"
                        className={styles.imageNavPrev}
                        onClick={() => setSelectedImageIndex((i) => (i <= 0 ? imageList.length - 1 : i - 1))}
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className={styles.imageNavNext}
                        onClick={() => setSelectedImageIndex((i) => (i >= imageList.length - 1 ? 0 : i + 1))}
                        aria-label="Next image"
                      >
                        ›
                      </button>
                    </>
                  )}
                  <StorageImage path={mainImagePath ?? ''} alt="" className={styles.mainImage} />
                </div>
                {imageList.length > 0 && (
                  <div className={styles.thumbStripBelow} role="list" aria-label="Image thumbnails">
                    {imageList.map((path, i) => (
                      <button
                        key={i}
                        type="button"
                        role="listitem"
                        className={`${styles.thumbBelow} ${i === selectedImageIndex ? styles.thumbActive : ''}`}
                        onClick={() => setSelectedImageIndex(i)}
                        aria-label={`View image ${i + 1}`}
                        aria-current={i === selectedImageIndex ? 'true' : undefined}
                      >
                        <StorageImage path={path} alt="" className={styles.thumbImg} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.heroHead}>
                <h1 className={styles.title}>{project.title}</h1>
                <div className={styles.byline}>
                  <span className={styles.avatarWrap}>
                    <img
                      src={project.owner_avatar_url ?? PLACEHOLDER_AVATAR_DATA_URL}
                      alt=""
                      className={styles.avatar}
                      width={28}
                      height={28}
                    />
                  </span>
                  <span className={styles.bylineText}>
                    <Link to={`/profile/${project.owner_id}`} className={styles.authorLink}>{ownerName}</Link>
                    {projectDate && <span className={styles.date}>{projectDate}</span>}
                  </span>
                </div>
                <div className={styles.engagementUnderHead}>
                  <ProjectEngagementButtons projectId={project.id} variant="sidebar" />
                  <ShareButton url={shareUrl} title={project.title} className={styles.shareBtnGrid} />
                </div>
              </div>
            </div>

            <div className={styles.tabsWrap}>
              <Tabs
                tabs={tabs}
                activeId={activeTab}
                onSelect={setActiveTab}
                aria-label="Project sections"
              />
            </div>
          </div>

          <aside className={styles.sidebar} aria-label="Project actions">
            <div className={styles.sidebarSection}>
              {parsed.metadata?.fileRefs && parsed.metadata.fileRefs.length > 0 && (
                <a href="#files" className={styles.downloadBtn} onClick={() => setActiveTab('files')}>
                  Download all files
                </a>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

