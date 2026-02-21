import type { Database } from '../lib/supabase/database.types';

/**
 * Public project with owner display.
 * Standard, industrial-grade types only: string, boolean, null, ISO 8601 date strings.
 * Safe for anon reads; viewable without sign-in.
 */
export type ProjectPublicRow = Database['public']['Views']['projects_public_with_owner']['Row'];
