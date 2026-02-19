import { Link } from 'react-router-dom';
import { Card } from '../ui';
import { StorageImage } from './StorageImage';
import { isStoragePath } from '../../lib/storage';
import { parseDescriptionWithMetadata } from '../../types/projectUpload';
import type { ProjectPublicRow } from '../../types/project';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: ProjectPublicRow;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const ownerName = project.owner_display_name ?? 'Unknown';
  const href = `/project/${project.owner_id}/${project.slug}`;
  const useStorage = project.cover_url && isStoragePath(project.cover_url);
  const { description } = parseDescriptionWithMetadata(project.description ?? null);

  return (
    <Card as="article">
      <Link to={href} className={styles.link}>
        {project.cover_url ? (
          <div className={styles.cover}>
            {useStorage ? (
              <StorageImage path={project.cover_url} className={styles.coverImg} />
            ) : (
              <img
                src={project.cover_url}
                alt=""
                className={styles.coverImg}
                loading="lazy"
              />
            )}
          </div>
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden>
            No image
          </div>
        )}
        <div className={styles.body}>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.meta}>By {ownerName}</p>
          {(() => {
            if (!description) return null;
            return (
              <p className={styles.description}>
                {description.length > 120 ? `${description.slice(0, 120)}…` : description}
              </p>
            );
          })()}
        </div>
      </Link>
    </Card>
  );
}
