import { useEffect, useMemo, useState } from 'react';
import { supabase, publicSupabase } from '../lib/supabase/browserClient';
import { Container, Input } from '../components/ui';
import { ProjectCard } from '../components/project/ProjectCard';
import { AdSlot } from '../components/ads/AdSlot';
import type { ProjectPublicRow } from '../types/project';
import { getAdSenseConfig } from '../types/ads';
import { setPageMeta, buildWebSiteJsonLd } from '../lib/seo';
import styles from './HomePage.module.css';

const HOME_TITLE = 'Discover DIY projects – DIYverse';
const HOME_DESCRIPTION =
  'Browse and share DIY projects. Electronics, microcontrollers, maker builds — build guides, materials lists, and step-by-step instructions from the community.';

type SortKey = 'newest' | 'oldest' | 'title';

const AD_INTERVAL = 25;

type FeedItem =
  | { type: 'project'; project: ProjectPublicRow }
  | { type: 'ad'; adIndex: number };

function buildFeedItems(projects: ProjectPublicRow[], insertAds: boolean): FeedItem[] {
  if (!insertAds || projects.length === 0) {
    return projects.map((project) => ({ type: 'project' as const, project }));
  }
  const items: FeedItem[] = [];
  for (let i = 0; i < projects.length; i++) {
    items.push({ type: 'project', project: projects[i] });
    const count = i + 1;
    if (count % AD_INTERVAL === 0 && count < projects.length) {
      items.push({ type: 'ad', adIndex: count / AD_INTERVAL - 1 });
    }
  }
  return items;
}

export function HomePage() {
  const [projects, setProjects] = useState<ProjectPublicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    return setPageMeta({
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      canonicalPath: '/',
      jsonLd: buildWebSiteJsonLd(),
    });
  }, []);

  // Feed: try public (anon) first; on error, signed-in users retry with authenticated client.
  useEffect(() => {
    let cancelled = false;
    const selectCols = 'id, owner_id, title, slug, description, cover_url, is_public, created_at, updated_at, owner_display_name, owner_avatar_url';
    const orderOpt = { ascending: sort === 'oldest' };

    function parseRows(data: unknown): ProjectPublicRow[] {
      const raw: unknown = data ?? [];
      const arr: unknown[] = Array.isArray(raw) ? raw : [];
      return arr.filter(
        (row): row is ProjectPublicRow =>
          row != null &&
          typeof row === 'object' &&
          typeof (row as ProjectPublicRow).id === 'string' &&
          typeof (row as ProjectPublicRow).owner_id === 'string' &&
          typeof (row as ProjectPublicRow).title === 'string' &&
          typeof (row as ProjectPublicRow).slug === 'string'
      );
    }

    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: e } = await publicSupabase
        .from('projects_public_with_owner')
        .select(selectCols)
        .order('created_at', orderOpt);

      if (cancelled) return;
      if (!e && data != null) {
        const list = parseRows(data);
        const sorted = sort === 'title' ? [...list].sort((a, b) => a.title.localeCompare(b.title)) : list;
        setProjects(sorted);
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user) {
        const { data: authData, error: authErr } = await supabase
          .from('projects_public_with_owner')
          .select(selectCols)
          .order('created_at', orderOpt);
        if (cancelled) return;
        if (!authErr && authData != null) {
          const list = parseRows(authData);
          const sorted = sort === 'title' ? [...list].sort((a, b) => a.title.localeCompare(b.title)) : list;
          setProjects(sorted);
          setError(null);
          setLoading(false);
          return;
        }
      }
      const fallbackClient = user ? supabase : publicSupabase;
      const { data: projRows, error: projErr } = await fallbackClient
        .from('projects')
        .select('id, owner_id, title, slug, description, cover_url, is_public, created_at, updated_at')
        .eq('is_public', true)
        .order('created_at', orderOpt);
      if (cancelled) return;
      if (!projErr && Array.isArray(projRows)) {
        const ownerIds: string[] = [...new Set((projRows as { owner_id: string }[]).map((r) => r.owner_id))];
        const profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>();
        if (ownerIds.length > 0) {
          const { data: profileRows } = await fallbackClient
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', ownerIds);
          if (!cancelled && profileRows)
            profileRows.forEach((p: { id: string; display_name: string | null; avatar_url: string | null }) => {
              profileMap.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url });
            });
        }
        if (cancelled) return;
        const list: ProjectPublicRow[] = (projRows as { id: string; owner_id: string; title: string; slug: string; description: string | null; cover_url: string | null; is_public: boolean; created_at: string; updated_at: string }[]).map((r) => {
          const pr = profileMap.get(r.owner_id);
          return {
            ...r,
            owner_display_name: pr?.display_name ?? null,
            owner_avatar_url: pr?.avatar_url ?? null,
          } as ProjectPublicRow;
        });
        const sorted = sort === 'title' ? [...list].sort((a, b) => a.title.localeCompare(b.title)) : list;
        setProjects(sorted);
        setError(null);
        setLoading(false);
        return;
      }
      setError(e?.message ?? 'Failed to load projects.');
      setProjects([]);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sort, refreshTrigger]);

  const refetch = () => setRefreshTrigger((n) => n + 1);

  const filtered = search.trim()
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : projects;

  const adConfig = useMemo(() => getAdSenseConfig(), []);
  const feedItems = useMemo(
    () => buildFeedItems(filtered, adConfig !== null),
    [filtered, adConfig]
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Discover DIY projects</h1>
          <p className={styles.heroLead}>
            Electronics, microcontrollers, maker builds — browse and share.
          </p>
        </Container>
      </section>

      <section className={styles.feed} aria-label="Project feed">
        <Container>
          <div className={styles.toolbar}>
            <Input
              type="search"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search}
              aria-label="Search projects"
            />
            <label className={styles.sortLabel}>
              Sort:{' '}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={styles.sortSelect}
                aria-label="Sort order"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
          </div>

          {error && (
            <div className={styles.errorWrap}>
              <div className={styles.error} role="alert">
                {typeof error === 'string' && error.includes('VITE_SUPABASE')
                  ? 'Content cannot be loaded. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).'
                  : error}
              </div>
              <button type="button" onClick={refetch} className={styles.refreshBtn} aria-label="Retry loading projects">
                Refresh
              </button>
            </div>
          )}

          {loading ? (
            <p className={styles.status}>Loading…</p>
          ) : error ? null : filtered.length === 0 ? (
            <div className={styles.emptyWrap}>
              <p className={styles.status}>
                {search.trim() ? 'No projects match your search.' : 'No public projects yet.'}
              </p>
              <button type="button" onClick={refetch} className={styles.refreshBtn} aria-label="Refresh feed">
                Refresh
              </button>
            </div>
          ) : (
            <ul className={styles.grid} role="list">
              {feedItems.map((item) =>
                item.type === 'project' ? (
                  <li key={item.project.id}>
                    <ProjectCard project={item.project} />
                  </li>
                ) : (
                  <li key={`ad-${item.adIndex}`} className={styles.gridItem}>
                    {adConfig && (
                      <AdSlot
                        config={adConfig}
                        slotKey={`feed-${item.adIndex}`}
                      />
                    )}
                  </li>
                )
              )}
            </ul>
          )}
        </Container>
      </section>
    </div>
  );
}
