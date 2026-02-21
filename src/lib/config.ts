/**
 * App config from environment. Single source: .env via Vite (VITE_*).
 * Reliable types only: string and boolean (industrial-grade, same path in dev and production).
 * No sign-in required for viewing content; anon key is sufficient for public reads.
 */

function trimString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

const url: string = trimString(import.meta.env.VITE_SUPABASE_URL);
const anonKey: string = trimString(import.meta.env.VITE_SUPABASE_ANON_KEY);

const hasUrl: boolean = url.length > 0;
const hasKey: boolean = anonKey.length > 0;
const supabaseConfigured: boolean = hasUrl && hasKey;

export const config: {
  supabaseConfigured: boolean;
  supabaseUrlValue: string;
  supabaseAnonKeyValue: string;
  hasUrl: boolean;
  hasKey: boolean;
} = {
  supabaseConfigured,
  supabaseUrlValue: url,
  supabaseAnonKeyValue: anonKey,
  hasUrl,
  hasKey,
};
