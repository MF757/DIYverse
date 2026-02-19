import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/browserClient';
import { useProjectEngagement } from '../../hooks/useProjectEngagement';
import styles from './ProjectEngagementButtons.module.css';

interface ProjectEngagementButtonsProps {
  projectId: string;
  variant?: 'default' | 'sidebar';
}

export function ProjectEngagementButtons({ projectId, variant = 'default' }: ProjectEngagementButtonsProps) {
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      const { data } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single();
      if (cancelled) return;
      setProfileId(data?.id ?? null);
    })();
    return () => { cancelled = true; };
  }, []);

  const {
    likeCount,
    saveCount,
    isLiked,
    isSaved,
    loading,
    togglingLike,
    togglingSave,
    toggleLike,
    toggleSave,
  } = useProjectEngagement(projectId, profileId);

  const canInteract = !!profileId;

  return (
    <div className={`${styles.wrapper} ${variant === 'sidebar' ? styles.sidebar : ''}`} role="group" aria-label="Project engagement" data-engagement>
      <button
        type="button"
        className={`${styles.btn} ${isLiked ? styles.active : ''}`}
        onClick={toggleLike}
        disabled={!canInteract || togglingLike || loading}
        aria-pressed={isLiked}
        aria-label={isLiked ? 'Unlike project' : 'Like project'}
      >
        <span className={styles.icon} aria-hidden>{isLiked ? '♥' : '♡'}</span>
        <span className={styles.label}>Like</span>
        <span className={styles.count}>{loading ? '—' : likeCount}</span>
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.saveBtn} ${isSaved ? styles.active : ''}`}
        onClick={toggleSave}
        disabled={!canInteract || togglingSave || loading}
        aria-pressed={isSaved}
        aria-label={isSaved ? 'Unsave project' : 'Save project'}
      >
        <span className={styles.icon} aria-hidden>
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </span>
        <span className={styles.label}>Save</span>
        <span className={styles.count}>{loading ? '—' : saveCount}</span>
      </button>
    </div>
  );
}
