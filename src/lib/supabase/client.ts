/**
 * Browser/client Supabase singleton.
 * Uses anon key; RLS enforces access. Never use service role here.
 */
import { createClient } from '@supabase/supabase-js';
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

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
