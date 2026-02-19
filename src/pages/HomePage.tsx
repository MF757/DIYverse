import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/browserClient';
import { Container, Input } from '../components/ui';
import { ProjectCard } from '../components/project/ProjectCard';
import type { ProjectPublicRow } from '../types/project';
import styles from './HomePage.module.css';

type SortKey = 'newest' | 'oldest' | 'title';

export function HomePage() {
  const [projects, setProjects] = useState<ProjectPublicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  // Public feed: works for unauthenticated users (anon). RLS limits rows to is_public = true.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: e } = await supabase
        .from('projects_public_with_owner')
        .select('id, owner_id, title, slug, description, cover_url, is_public, created_at, updated_at, owner_display_name, owner_avatar_url')
        .order('created_at', { ascending: sort === 'oldest' });

      if (cancelled) return;
      if (e) {
        setError(e.message);
        setProjects([]);
        setLoading(false);
        return;
      }
      const raw: unknown = data ?? [];
      const list: ProjectPublicRow[] = Array.isArray(raw) ? (raw as ProjectPublicRow[]) : [];
      if (sort === 'title') {
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
      }
      setProjects(list);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sort]);

  const filtered = search.trim()
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : projects;

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
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <p className={styles.status}>Loading…</p>
          ) : filtered.length === 0 ? (
            <p className={styles.status}>
              {search.trim() ? 'No projects match your search.' : 'No public projects yet.'}
            </p>
          ) : (
            <ul className={styles.grid} role="list">
              {filtered.map((project) => (
                <li key={project.id}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </div>
  );
}
