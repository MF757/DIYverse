/**
 * SEO utilities: per-page title, meta description, Open Graph, Twitter Card,
 * canonical URL, and JSON-LD (schema.org). Used by page components on mount;
 * cleanup restores defaults on unmount.
 * Reliable types only: string, optional object for JSON-LD.
 * @see https://developers.google.com/search/docs/appearance/snippet
 * @see https://ogp.me/
 * @see https://schema.org/
 */

const DEFAULT_TITLE = 'DIYverse – DIY projects, shared';
const DEFAULT_DESCRIPTION =
  'Discover and share DIY projects. Build guides, materials lists, and step-by-step instructions from the maker community.';

const ENV_APP_URL_KEY = 'VITE_APP_URL';

function trimString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

/** Base URL for the site (no trailing slash). From env or current origin. */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const fromEnv = trimString((import.meta.env as Record<string, unknown>)[ENV_APP_URL_KEY]);
    if (fromEnv) return fromEnv.replace(/\/$/, '');
    return window.location.origin;
  }
  const fromEnv = trimString(process.env[ENV_APP_URL_KEY]);
  return fromEnv ? fromEnv.replace(/\/$/, '') : 'https://example.com';
}

/** One-line meta description; truncate to recommended length. */
function clampDescription(s: string, maxLen: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1).replace(/\s+\S*$/, '') || t.slice(0, maxLen);
}

const META_DESC_MAX = 160;

function setMeta(name: string, content: string, isProperty = false): void {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLinkRel(rel: string, href: string): void {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

const JSON_LD_SCRIPT_ID = 'diyverse-jsonld';

function setJsonLd(data: object): void {
  let script = document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = JSON_LD_SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function removeJsonLd(): void {
  const script = document.getElementById(JSON_LD_SCRIPT_ID);
  if (script) script.remove();
}

export interface PageMetaOptions {
  /** Document title (e.g. "About – DIYverse"). */
  title?: string;
  /** Meta description; will be clamped to ~160 chars. */
  description?: string;
  /** Absolute image URL for og:image / twitter:image (e.g. project cover). */
  image?: string;
  /** Path (e.g. "/about") for canonical and og:url. If not set, uses current pathname. */
  canonicalPath?: string;
  /** JSON-LD object (schema.org). Replaces any existing injected JSON-LD. */
  jsonLd?: object;
}

/**
 * Sets document title, meta description, Open Graph, Twitter Card, canonical,
 * and optional JSON-LD. Returns a cleanup function that restores defaults.
 * Call in useEffect; return the cleanup from the effect.
 */
export function setPageMeta(options: PageMetaOptions): () => void {
  const base = getBaseUrl();
  const path = options.canonicalPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalUrl = path.startsWith('http') ? path : `${base}${path === '' ? '' : path.startsWith('/') ? path : `/${path}`}`;

  const title = options.title ?? DEFAULT_TITLE;
  const description = options.description
    ? clampDescription(options.description, META_DESC_MAX)
    : DEFAULT_DESCRIPTION;
  const image = options.image && options.image.startsWith('http') ? options.image : '';

  document.title = title;

  setMeta('description', description);

  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('og:type', 'website', true);
  if (image) setMeta('og:image', image, true);

  setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  if (image) setMeta('twitter:image', image);

  setLinkRel('canonical', canonicalUrl);

  if (options.jsonLd) setJsonLd(options.jsonLd);
  else removeJsonLd();

  return function cleanup() {
    document.title = DEFAULT_TITLE;
    setMeta('description', DEFAULT_DESCRIPTION);
    setMeta('og:title', DEFAULT_TITLE, true);
    setMeta('og:description', DEFAULT_DESCRIPTION, true);
    setMeta('og:url', base + '/', true);
    setMeta('og:type', 'website', true);
    const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    if (ogImage) ogImage.remove();
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', DEFAULT_TITLE);
    setMeta('twitter:description', DEFAULT_DESCRIPTION);
    const twImg = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
    if (twImg) twImg.remove();
    setLinkRel('canonical', base + '/');
    removeJsonLd();
  };
}

/** Build WebSite JSON-LD for the homepage (schema.org). */
export function buildWebSiteJsonLd(): object {
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DIYverse',
    description: DEFAULT_DESCRIPTION,
    url: base,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', url: `${base}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Build HowTo JSON-LD for a project page (schema.org). */
export function buildHowToJsonLd(params: {
  name: string;
  description: string;
  image?: string;
  url: string;
  datePublished?: string;
  step?: Array<{ name?: string; text: string }>;
}): object {
  const step = Array.isArray(params.step) && params.step.length > 0
    ? params.step.map((s) => ({
        '@type': 'HowToStep',
        name: typeof s.name === 'string' ? s.name : undefined,
        text: typeof s.text === 'string' ? s.text : '',
      }))
    : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    image: params.image || undefined,
    url: params.url,
    datePublished: params.datePublished || undefined,
    step: step || undefined,
  };
}

/** Build CreativeWork JSON-LD for a project without steps (schema.org). */
export function buildCreativeWorkJsonLd(params: {
  name: string;
  description: string;
  image?: string;
  url: string;
  datePublished?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: params.name,
    description: params.description,
    image: params.image || undefined,
    url: params.url,
    datePublished: params.datePublished || undefined,
  };
}
