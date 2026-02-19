import type { Database } from '../lib/supabase/database.types';

/** Public project with owner display. Standard types only: string, boolean, ISO timestamps (string), null. */
export type ProjectPublicRow = Database['public']['Views']['projects_public_with_owner']['Row'];
