/**
 * Server-side Supabase client.
 * Use anon client for user-scoped operations (RLS applies).
 * Use service client only for admin/background tasks; never expose to client.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (v == null || v === '') {
    throw new Error(`Missing ${name}. Set it in .env (see .env.example).`);
  }
  return v;
}

const url = requireEnv('SUPABASE_URL');
const anonKey = requireEnv('SUPABASE_ANON_KEY');

/** Server-side client with anon key; pass user JWT for RLS. Use for user context. */
export function createServerClient(accessToken?: string): SupabaseClient<Database> {
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

/** Admin client: bypasses RLS. Use only on server, never expose. */
export function createServiceClient(): SupabaseClient<Database> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for createServiceClient. Set it in .env (server-only).'
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
