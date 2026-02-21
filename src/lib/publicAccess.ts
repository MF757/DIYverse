/**
 * Public access contract: content viewable without sign-in.
 *
 * - All reads use Supabase anon key only; no server/Edge required (Vercel cost-saving).
 * - RLS limits data to public projects (is_public = true) and profile display.
 * - Types are standard JSON-serializable: string, number, boolean, null, ISO 8601 date strings.
 *
 * Public routes (no auth required):
 * - / (home feed)
 * - /project/:ownerId/:slug (project detail)
 * - /profile/:userId (public profile view)
 *
 * Sign-in required only for: /profile (own), /publish, likes/saves/comments write, account.
 */

export const PUBLIC_ACCESS_DESCRIPTION =
  'Content is viewable without sign-in using anon key; RLS enforces public-only reads.';
