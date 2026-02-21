/**
 * Resolve profile avatar to a public URL.
 * - Reliable: uses only string (path or URL) in, string (URL) or null out.
 * - Cost: client-side only; getPublicUrl does not hit the network.
 */
import { supabase } from './supabase/browserClient';
import { AVATARS_BUCKET } from './storage';

export function getAvatarSrc(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null;
  const trimmed = avatarUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(trimmed);
  return data?.publicUrl ?? null;
}
