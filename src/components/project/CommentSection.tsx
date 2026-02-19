import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase/browserClient';
import { Button, Textarea } from '../ui';
import { useComments } from '../../hooks/useComments';
import type { CommentRow } from '../../hooks/useComments';
import styles from './CommentSection.module.css';

interface CommentSectionProps {
  projectId: string;
}

function CommentForm({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment…',
}: {
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setBody('');
    onCancel?.();
  };

  return (
    <div className={styles.form}>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={styles.textarea}
        aria-label="Comment text"
      />
      <div className={styles.formActions}>
        <Button type="button" variant="primary" size="sm" onClick={handleSubmit} disabled={!body.trim()}>
          Post
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  profileId,
  addComment,
  onDelete,
  onLike,
  depth,
}: {
  comment: CommentRow & { replies?: (CommentRow & { replies: CommentRow[] })[] };
  profileId: string | null;
  addComment: (body: string, parentId: string | null) => void;
  onDelete: (id: string) => void;
  onLike: (id: string, isLiked: boolean) => void;
  depth: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const authorName = comment.author_display_name ?? 'Maker';
  const isOwn = profileId === comment.profile_id;
  const replies = (comment.replies ?? []) as (CommentRow & { replies: CommentRow[] })[];

  return (
    <article className={depth > 0 ? styles.reply : styles.comment} data-depth={depth}>
      <header className={styles.commentHeader}>
        <Link to={`/profile/${comment.profile_id}`} className={styles.author}>
          {authorName}
        </Link>
        <time dateTime={comment.created_at} className={styles.time}>
          {new Date(comment.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </header>
      <p className={styles.body}>{comment.body}</p>
      <footer className={styles.commentFooter}>
        {profileId && (
          <>
            <button
              type="button"
              className={`${styles.actionBtn} ${comment.is_liked_by_me ? styles.liked : ''}`}
              onClick={() => onLike(comment.id, comment.is_liked_by_me)}
              aria-pressed={comment.is_liked_by_me}
              aria-label={comment.is_liked_by_me ? 'Unlike comment' : 'Like comment'}
            >
              <span aria-hidden>{comment.is_liked_by_me ? '♥' : '♡'}</span>
              <span>{comment.like_count}</span>
            </button>
            {depth === 0 && (
              <button type="button" className={styles.actionBtn} onClick={() => setShowReply(!showReply)}>
                Reply
              </button>
            )}
            {isOwn && (
              <button type="button" className={styles.actionBtn} onClick={() => onDelete(comment.id)}>
                Delete
              </button>
            )}
          </>
        )}
      </footer>
      {showReply && depth === 0 && (
        <CommentForm
          onSubmit={(body) => {
            addComment(body, comment.id);
            setShowReply(false);
          }}
          onCancel={() => setShowReply(false)}
          placeholder="Write a reply…"
        />
      )}
      {replies.length > 0 && (
        <div className={styles.replies}>
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              profileId={profileId}
              addComment={addComment}
              onDelete={onDelete}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </article>
  );
}

export function CommentSection({ projectId }: CommentSectionProps) {
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

  const { comments, loading, addComment, deleteComment, toggleCommentLike } = useComments(projectId, profileId);

  return (
    <section className={styles.section} aria-label="Comments">
      {profileId ? (
        <CommentForm onSubmit={(body) => addComment(body, null)} placeholder="Write a comment…" />
      ) : (
        <p className={styles.signInHint}>
          <Link to="/signin">Sign in</Link> to leave a comment.
        </p>
      )}

      {loading ? (
        <p className={styles.muted}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className={styles.muted}>No comments yet.</p>
      ) : (
        <ol className={styles.list}>
          {comments.map((c) => (
            <li key={c.id}>
              <CommentItem
                comment={c}
                profileId={profileId}
                addComment={addComment}
                onDelete={deleteComment}
                onLike={toggleCommentLike}
                depth={0}
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
