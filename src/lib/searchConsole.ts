/**
 * Google Search Console integration: verification meta tag and sitemap.
 * @see https://support.google.com/webmasters/answer/9008080
 * @see docs/SEARCH_CONSOLE_SETUP.md
 */

/** Env key for the HTML meta tag verification code (content value only). */
export const SEARCH_CONSOLE_VERIFICATION_ENV_KEY = 'VITE_GOOGLE_SITE_VERIFICATION' as const;

/** Meta tag name used by Google Search Console for HTML tag verification. */
export const VERIFICATION_META_NAME = 'google-site-verification' as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Returns the Google Site Verification content string from env, or null if unset/invalid.
 * Use this to gate injection so we only add the meta tag when configured.
 */
export function getSearchConsoleVerificationCode(): string | null {
  const raw = (import.meta.env as Record<string, unknown>)[SEARCH_CONSOLE_VERIFICATION_ENV_KEY];
  if (!isNonEmptyString(raw)) return null;
  return raw.trim();
}

/**
 * Injects the google-site-verification meta tag into document.head when the env code is set.
 * Idempotent: does nothing if already present or code is missing. Call once on app load.
 */
export function injectVerificationMeta(): void {
  const code = getSearchConsoleVerificationCode();
  if (!code) return;
  const existing = document.querySelector(`meta[name="${VERIFICATION_META_NAME}"]`);
  if (existing) return;
  const meta = document.createElement('meta');
  meta.name = VERIFICATION_META_NAME;
  meta.content = code;
  document.head.appendChild(meta);
}
