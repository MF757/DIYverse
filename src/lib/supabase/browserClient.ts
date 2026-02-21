/**
 * Browser Supabase client. Reads config from shared config module.
 * RLS applies; use anon key only.
 *
 * - supabase: full client with session persistence (auth, writes, private data).
 * - publicSupabase: anon-only client, no session; use for public reads so
 *   unauthenticated users and expired sessions never send a JWT (reliable content for landing).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';
import { config } from '../config.js';

const CONFIG_MSG =
  'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file in the project root, then restart the dev server. See .env.example.';

let supabaseInstance: SupabaseClient<Database>;
let publicSupabaseInstance: SupabaseClient<Database>;

if (config.supabaseConfigured) {
  supabaseInstance = createClient<Database>(
    config.supabaseUrlValue,
    config.supabaseAnonKeyValue,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
  // Anon-only client for public reads: no session persistence, so never sends JWT.
  publicSupabaseInstance = createClient<Database>(
    config.supabaseUrlValue,
    config.supabaseAnonKeyValue,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
} else {
  console.warn('DIYverse:', CONFIG_MSG);
  const err = new Error(CONFIG_MSG);
  const rejectOne = () => Promise.resolve({ data: null, error: err });
  const rejectList = () => Promise.resolve({ data: [], error: err });
  const selectChain = () => ({
    order: () => rejectList(),
    eq: (_col: string, _val: unknown) => ({
      eq: (_c2: string, _v2: unknown) => ({ maybeSingle: () => rejectOne(), single: () => rejectOne(), order: () => rejectList() }),
      single: () => rejectOne(),
      maybeSingle: () => rejectOne(),
      order: () => rejectList(),
    }),
    in: (_col: string, _vals: unknown) => rejectList(),
  });
  const stub = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: err }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: err }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: {}, error: err }),
      updateUser: () => Promise.resolve({ data: { user: null }, error: err }),
    },
    from: (_table: string) => ({
      select: () => selectChain(),
      insert: () => Promise.resolve({ data: null, error: err }),
    }),
    storage: {
      from: (_bucket: string) => ({
        getPublicUrl: (path: string) => ({ data: { publicUrl: path ? `https://invalid.local/${path}` : '' } }),
      }),
    },
  } as unknown as SupabaseClient<Database>;
  supabaseInstance = stub;
  publicSupabaseInstance = stub;
}

export const supabase = supabaseInstance;

/** Use for public read-only data (feed, project detail, public profile). Never sends JWT; safe for anon. */
export const publicSupabase = publicSupabaseInstance;
