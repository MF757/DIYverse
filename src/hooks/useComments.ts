import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/browserClient';

export interface CommentRow {
  id: string;
  project_id: string;
  profile_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  author_display_name?: string | null;
  author_avatar_url?: string | null;
  like_count: number;
  is_liked_by_me: boolean;
}

function buildCommentTree(
  comments: CommentRow[]
): (CommentRow & { replies: (CommentRow & { replies: CommentRow[] })[] })[] {
  const byId = new Map(comments.map((c) => [c.id, { ...c, replies: [] as (CommentRow & { replies: CommentRow[] })[] }]));
  const roots: (CommentRow & { replies: (CommentRow & { replies: CommentRow[] })[] })[] = [];
  for (const c of comments) {
    const node = byId.get(c.id)!;
    if (!c.parent_id) {
      roots.push(node);
    } else {
      const parent = byId.get(c.parent_id);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  }
  roots.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  for (const r of roots) {
    r.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  return roots;
}

export function useComments(projectId: string | undefined, profileId: string | null) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    const { data: commentRows } = await supabase
      .from('project_comments')
      .select('id, project_id, profile_id, parent_id, body, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (!commentRows || commentRows.length === 0) {
      setComments([]);
      setLoading(false);
      return;
    }

    const profileIds = [...new Set(commentRows.map((c) => c.profile_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', profileIds);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const commentIds = commentRows.map((c) => c.id);
    const { data: likes } = profileId
      ? await supabase.from('comment_likes').select('comment_id').eq('profile_id', profileId).in('comment_id', commentIds)
      : { data: [] };
    const likedIds = new Set((likes ?? []).map((l) => l.comment_id));

    const { data: likeCounts } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .in('comment_id', commentIds);
    const countMap = new Map<string, number>();
    for (const l of likeCounts ?? []) {
      countMap.set(l.comment_id, (countMap.get(l.comment_id) ?? 0) + 1);
    }

    const enriched: CommentRow[] = commentRows.map((r) => {
      const p = profileMap.get(r.profile_id);
      return {
        ...r,
        author_display_name: p?.display_name ?? null,
        author_avatar_url: p?.avatar_url ?? null,
        like_count: countMap.get(r.id) ?? 0,
        is_liked_by_me: likedIds.has(r.id),
      };
    });

    setComments(enriched);
    setLoading(false);
  }, [projectId, profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const addComment = useCallback(
    async (body: string, parentId: string | null) => {
      if (!projectId || !profileId || !body.trim()) return;
      const { error } = await supabase.from('project_comments').insert({
        project_id: projectId,
        profile_id: profileId,
        parent_id: parentId,
        body: body.trim(),
      });
      if (!error) load();
    },
    [projectId, profileId, load]
  );

  const deleteComment = useCallback(
    async (id: string) => {
      if (!profileId) return;
      await supabase.from('project_comments').delete().eq('id', id).eq('profile_id', profileId);
      load();
    },
    [profileId, load]
  );

  const toggleCommentLike = useCallback(
    async (commentId: string, isLiked: boolean) => {
      if (!profileId) return;
      if (isLiked) {
        await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('profile_id', profileId);
      } else {
        await supabase.from('comment_likes').insert({ comment_id: commentId, profile_id: profileId });
      }
      load();
    },
    [profileId, load]
  );

  const tree = buildCommentTree(comments);
  return { comments: tree, loading, addComment, deleteComment, toggleCommentLike, refetch: load };
}
