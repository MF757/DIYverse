/**
 * Env validation: fail fast with clear errors. Use at app entry.
 */
function getEnv(name: string): string {
  const value = process.env[name];
  if (value == null || value === '') {
    throw new Error(`Missing required env: ${name}. See .env.example.`);
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    SUPABASE_URL: getEnv('SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  };
}
