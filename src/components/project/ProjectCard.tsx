import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui';
import { StorageImage } from './StorageImage';
import { isStoragePath } from '../../lib/storage';
import { parseDescriptionWithMetadata } from '../../types/projectUpload';
import type { ProjectPublicRow } from '../../types/project';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: ProjectPublicRow;
  /** When true, show edit (pencil) control on hover and dropdown to edit project. */
  showEditAction?: boolean;
  /** Called when user chooses "Edit project" from the dropdown. */
  onEditClick?: (project: ProjectPublicRow) => void;
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function ProjectCard({ project, showEditAction, onEditClick }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [menuOpen]);

  const ownerName = project.owner_display_name ?? 'Unknown';
  const href = `/project/${project.owner_id}/${project.slug}`;
  const useStorage = project.cover_url && isStoragePath(project.cover_url);
  const { description } = parseDescriptionWithMetadata(project.description ?? null);

  return (
    <Card as="article" className={styles.cardWrap}>
      <div className={styles.cardInner}>
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
                decoding="async"
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
      {showEditAction && (
        <div className={styles.editWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.editButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="Edit project"
          >
            <PencilIcon />
          </button>
          {menuOpen && (
            <div className={styles.dropdown} role="menu">
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  onEditClick?.(project);
                }}
                role="menuitem"
              >
                Edit project
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </Card>
  );
}
