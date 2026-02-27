import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Container, Tabs } from '../components/ui';
import type { ProjectPublicRow } from '../types/project';
import { parseDescriptionWithMetadata } from '../types/projectUpload';
import type { MaterialItem, InstructionStep, FileRef } from '../types/projectUpload';
import { StorageImage } from '../components/project/StorageImage';
import { ProjectEngagementButtons } from '../components/project/ProjectEngagementButtons';
import { ShareButton } from '../components/project/ShareButton';
import { CommentSection } from '../components/project/CommentSection';
import { loadProjectBom, loadProjectInstructionSteps, loadProjectFiles, getProjectFilePublicUrl } from '../lib/projectData';
import { supabase, publicSupabase } from '../lib/supabase/browserClient';
import { getAvatarSrc } from '../lib/avatar';
import { setPageMeta, getBaseUrl, buildHowToJsonLd, buildCreativeWorkJsonLd } from '../lib/seo';
import { isStoragePath } from '../lib/storage';
import styles from './ProjectDetailPage.module.css';

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
  const [dbBom, setDbBom] = useState<MaterialItem[]>([]);
  const [dbSteps, setDbSteps] = useState<InstructionStep[]>([]);
  const [dbFiles, setDbFiles] = useState<FileRef[]>([]);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [project?.owner_avatar_url]);

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

    // 1) Public load (anon): works for unauthenticated users; RLS limits to is_public = true.
    // 2) If not found, try authenticated load so owner can see their project right after upload.
    async function load() {
      const { data: publicData, error: publicErr } = await publicSupabase
        .from('projects_public_with_owner')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('slug', slug)
        .maybeSingle();

      if (cancelled) return;
      if (publicErr) {
        setError(publicErr.message);
        setProject(null);
        setLoading(false);
        return;
      }
      const fromPublic: ProjectPublicRow | null =
        publicData != null && typeof publicData === 'object' ? (publicData as ProjectPublicRow) : null;
      if (fromPublic) {
        setProject(fromPublic);
        setLoading(false);
        return;
      }
      const { data: authData, error: authErr } = await supabase
        .from('projects_public_with_owner')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      if (authErr) {
        setError(authErr.message);
        setProject(null);
      } else {
        const row: ProjectPublicRow | null =
          authData != null && typeof authData === 'object' ? (authData as ProjectPublicRow) : null;
        setProject(row);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ownerId, slug]);

  // SEO: title, description, og:image, canonical, JSON-LD (when project is loaded)
  // Prefer system-set meta_description/seo_title (e.g. from n8n); fall back to author content.
  useEffect(() => {
    if (!project || !ownerId || !slug) return;
    const canonicalPath = `/project/${ownerId}/${slug}`;
    const title =
      typeof project.seo_title === 'string' && project.seo_title.trim()
        ? project.seo_title.trim()
        : `${project.title} – DIYverse`;
    const description = (() => {
      if (typeof project.meta_description === 'string' && project.meta_description.trim()) {
        return project.meta_description.trim();
      }
      const { description: d } = parseDescriptionWithMetadata(project.description ?? null);
      return d && d.trim() ? d.trim() : `DIY project: ${project.title}. View build guide and instructions on DIYverse.`;
    })();
    const imageUrl =
      project.cover_url && isStoragePath(project.cover_url)
        ? getProjectFilePublicUrl(project.cover_url)
        : project.cover_url && project.cover_url.startsWith('http')
          ? project.cover_url
          : undefined;
    const steps = (() => {
      const { metadata } = parseDescriptionWithMetadata(project.description ?? null);
      const list = metadata?.instructionSteps;
      if (!Array.isArray(list) || list.length === 0) return undefined;
      return list.map((s, i) => ({
        name: `Step ${i + 1}`,
        text: typeof s.description === 'string' ? s.description : '',
      }));
    })();
    const url = `${getBaseUrl()}${canonicalPath}`;
    const jsonLd =
      steps && steps.length > 0
        ? buildHowToJsonLd({
            name: project.title,
            description,
            image: imageUrl,
            url,
            datePublished: project.created_at ?? undefined,
            step: steps,
          })
        : buildCreativeWorkJsonLd({
            name: project.title,
            description,
            image: imageUrl,
            url,
            datePublished: project.created_at ?? undefined,
          });
    return setPageMeta({
      title,
      description,
      image: imageUrl,
      canonicalPath,
      jsonLd,
    });
  }, [project, ownerId, slug]);

  useEffect(() => {
    if (!project?.id) {
      setDbBom([]);
      setDbSteps([]);
      setDbFiles([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const [bom, steps, files] = await Promise.all([
        loadProjectBom(project.id),
        loadProjectInstructionSteps(project.id),
        loadProjectFiles(project.id),
      ]);
      if (!cancelled) {
        setDbBom(bom);
        setDbSteps(steps);
        setDbFiles(files);
      }
    })();
    return () => { cancelled = true; };
  }, [project?.id]);

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

  const displayBom = useMemo(
    () => (dbBom.length > 0 ? dbBom : parsed?.metadata?.materials ?? []),
    [dbBom, parsed?.metadata?.materials]
  );
  const displaySteps = useMemo(
    () => (dbSteps.length > 0 ? dbSteps : parsed?.metadata?.instructionSteps ?? []),
    [dbSteps, parsed?.metadata?.instructionSteps]
  );
  const displayFiles = useMemo(
    () => {
      const raw = dbFiles.length > 0 ? dbFiles : parsed?.metadata?.fileRefs ?? [];
      return raw.filter((f): f is FileRef => Boolean(f && typeof f.path === 'string' && f.path.trim().length > 0));
    },
    [dbFiles, parsed?.metadata?.fileRefs]
  );
  const componentIdToName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of displayBom) m.set(c.id, c.name);
    return m;
  }, [displayBom]);

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
          {displaySteps.length === 0 ? (
            <p className={styles.muted}>No instructions yet.</p>
          ) : (
            <ol className={styles.stepList}>
              {displaySteps.map((step, idx) => (
                <li key={step.id ?? idx} className={styles.stepItem}>
                  <span className={styles.stepNum}>{idx + 1}.</span>
                  <div>
                    {step.imageUrl && (
                      <div className={styles.stepImageWrap}>
                        <StorageImage path={step.imageUrl} alt="" className={styles.stepImage} transform={{ width: 800, quality: 80 }} />
                      </div>
                    )}
                    <p className={styles.stepDescription}>{step.description}</p>
                    {step.tools && step.tools.length > 0 && (
                      <p className={styles.stepMeta}>
                        <strong>Tools:</strong> {step.tools.join(', ')}
                      </p>
                    )}
                    {step.materialIds && step.materialIds.length > 0 && (
                      <p className={styles.stepMeta}>
                        <strong>Materials:</strong>{' '}
                        {step.materialIds.map((id) => componentIdToName.get(id) ?? id).join(', ')}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      ),
    },
    {
      id: 'files',
      label: 'Files / Downloads',
      panel: (
        <div className={styles.tabContent}>
          {displayFiles.length === 0 ? (
            <p className={styles.muted}>No files to download.</p>
          ) : (
            <ul className={styles.fileList}>
              {displayFiles.map((f) => (
                <li key={f.id}>
                  <a
                    href={getProjectFilePublicUrl(f.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileLink}
                    download={f.name}
                  >
                    {f.name}
                  </a>
                  <span className={styles.fileType}>({f.type})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      id: 'components',
      label: 'Components / BOM',
      panel: (
        <div className={styles.tabContent}>
          {displayBom.length === 0 ? (
            <p className={styles.muted}>No components or materials listed.</p>
          ) : (
            <ul className={styles.bomList}>
              {displayBom.map((m) => (
                <li key={m.id} className={styles.bomItem}>
                  <span className={styles.bomName}>{m.name}</span>
                  <span className={styles.bomQty}>{m.quantity}</span>
                  {m.link ? (
                    <a href={m.link} target="_blank" rel="noopener noreferrer" className={styles.bomLink}>
                      Link
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      id: 'comments',
      label: 'Comments',
      panel: (
        <div className={styles.tabContent}>
          <CommentSection projectId={project.id} />
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={styles.imageNavNext}
                        onClick={() => setSelectedImageIndex((i) => (i >= imageList.length - 1 ? 0 : i + 1))}
                        aria-label="Next image"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </>
                  )}
                  <StorageImage
                    path={mainImagePath ?? ''}
                    alt=""
                    className={styles.mainImage}
                    transform={{ width: 1200, quality: 85 }}
                  />
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
                        <StorageImage path={path} alt="" className={styles.thumbImg} transform={{ width: 200, quality: 75 }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.heroHead}>
                <h1 className={styles.title}>{project.title}</h1>
                <div className={styles.byline}>
                  <span className={styles.avatarWrap}>
                    {(() => {
                      const avatarSrc = getAvatarSrc(project.owner_avatar_url ?? null);
                      const initial = (project.owner_display_name ?? '?').trim().slice(0, 1).toUpperCase() || '?';
                      if (avatarSrc && !avatarLoadError) {
                        return (
                          <img
                            src={avatarSrc}
                            alt=""
                            className={styles.avatar}
                            width={28}
                            height={28}
                            decoding="async"
                            onError={() => setAvatarLoadError(true)}
                          />
                        );
                      }
                      return (
                        <span className={styles.avatarPlaceholder} aria-hidden>
                          {initial}
                        </span>
                      );
                    })()}
                  </span>
                  <span className={styles.bylineText}>
                    <Link to={`/profile/${project.owner_id}`} className={styles.authorLink}>{ownerName}</Link>
                    {projectDate && <span className={styles.date}>{projectDate}</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.tabsWrap}>
              <Tabs
                tabs={tabs}
                activeId={activeTab}
                onSelect={setActiveTab}
                aria-label="Project sections"
                mobileSplitAfterIndex={2}
              />
            </div>
          </div>

          <aside className={styles.sidebar} aria-label="Project actions">
            <div className={styles.sidebarSection} aria-label="Engagement">
              <ProjectEngagementButtons projectId={project.id} variant="sidebar" />
              <ShareButton url={shareUrl} title={project.title} className={styles.shareBtnSidebar} />
            </div>
            {displayFiles.length > 0 && (
              <div className={styles.sidebarSection}>
                <a href="#files" className={styles.downloadBtn} onClick={() => setActiveTab('files')}>
                  Download all files
                </a>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}

