import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/browserClient';

interface EngagementState {
  likeCount: number;
  saveCount: number;
  isLiked: boolean;
  isSaved: boolean;
  loading: boolean;
  togglingLike: boolean;
  togglingSave: boolean;
}

export function useProjectEngagement(projectId: string | undefined, profileId: string | null) {
  const [state, setState] = useState<EngagementState>({
    likeCount: 0,
    saveCount: 0,
    isLiked: false,
    isSaved: false,
    loading: true,
    togglingLike: false,
    togglingSave: false,
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    const [likesRes, savesRes, myLikeRes, mySaveRes] = await Promise.all([
      supabase.from('project_likes').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('project_saves').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
      profileId
        ? supabase.from('project_likes').select('id').eq('project_id', projectId).eq('profile_id', profileId).maybeSingle()
        : Promise.resolve({ data: null }),
      profileId
        ? supabase.from('project_saves').select('id').eq('project_id', projectId).eq('profile_id', profileId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setState((s) => ({
      ...s,
      likeCount: likesRes.count ?? 0,
      saveCount: savesRes.count ?? 0,
      isLiked: !!myLikeRes.data,
      isSaved: !!mySaveRes.data,
      loading: false,
    }));
  }, [projectId, profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = useCallback(async () => {
    if (!projectId || !profileId || state.togglingLike) return;
    setState((s) => ({ ...s, togglingLike: true }));
    if (state.isLiked) {
      const { error } = await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', projectId)
        .eq('profile_id', profileId);
      if (!error) {
        setState((s) => ({ ...s, isLiked: false, likeCount: Math.max(0, s.likeCount - 1), togglingLike: false }));
      } else {
        setState((s) => ({ ...s, togglingLike: false }));
      }
    } else {
      const { error } = await supabase.from('project_likes').insert({ project_id: projectId, profile_id: profileId });
      if (!error) {
        setState((s) => ({ ...s, isLiked: true, likeCount: s.likeCount + 1, togglingLike: false }));
      } else {
        setState((s) => ({ ...s, togglingLike: false }));
      }
    }
  }, [projectId, profileId, state.isLiked, state.togglingLike]);

  const toggleSave = useCallback(async () => {
    if (!projectId || !profileId || state.togglingSave) return;
    setState((s) => ({ ...s, togglingSave: true }));
    if (state.isSaved) {
      const { error } = await supabase
        .from('project_saves')
        .delete()
        .eq('project_id', projectId)
        .eq('profile_id', profileId);
      if (!error) {
        setState((s) => ({ ...s, isSaved: false, saveCount: Math.max(0, s.saveCount - 1), togglingSave: false }));
      } else {
        setState((s) => ({ ...s, togglingSave: false }));
      }
    } else {
      const { error } = await supabase.from('project_saves').insert({ project_id: projectId, profile_id: profileId });
      if (!error) {
        setState((s) => ({ ...s, isSaved: true, saveCount: s.saveCount + 1, togglingSave: false }));
      } else {
        setState((s) => ({ ...s, togglingSave: false }));
      }
    }
  }, [projectId, profileId, state.isSaved, state.togglingSave]);

  return { ...state, toggleLike, toggleSave, refetch: load };
}
