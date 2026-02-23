import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SITEMAP_PLACEHOLDER = '{{SITE_URL}}';
const DEFAULT_SITE_URL = 'https://example.com';

function sitemapBaseUrlPlugin() {
  return {
    name: 'sitemap-base-url',
    closeBundle() {
      const outDir = join(process.cwd(), 'dist');
      const baseUrl = process.env.VITE_APP_URL?.trim() || DEFAULT_SITE_URL;
      for (const file of ['sitemap.xml', 'robots.txt']) {
        const path = join(outDir, file);
        try {
          let content = readFileSync(path, 'utf8');
          if (content.includes(SITEMAP_PLACEHOLDER)) {
            content = content.replaceAll(SITEMAP_PLACEHOLDER, baseUrl);
            writeFileSync(path, content);
          }
        } catch {
          // file may be missing if public dir layout differs
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), sitemapBaseUrlPlugin()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 8080,
  },
});
