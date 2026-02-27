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
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/@supabase')) return 'supabase';
          return undefined;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    cssCodeSplit: true,
    target: 'es2020',
  },
  server: {
    port: 8080,
  },
});
