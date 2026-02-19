#!/usr/bin/env node
/**
 * Cross-platform type generation: writes Supabase types to src/lib/supabase/database.types.ts
 * Usage: node scripts/generate-db-types.mjs [--local] or set SUPABASE_PROJECT_ID in .env
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root (no extra deps)
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env');
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf-8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

const outPath = join(root, 'src', 'lib', 'supabase', 'database.types.ts');

const useLocal = process.argv.includes('--local');
const projectIdIndex = process.argv.indexOf('--project-id');
const projectId = projectIdIndex >= 0 ? process.argv[projectIdIndex + 1] : process.env.SUPABASE_PROJECT_ID;

let cmd;
if (useLocal) {
  cmd = 'npx supabase gen types typescript --local';
} else if (projectId) {
  cmd = `npx supabase gen types typescript --project-id ${projectId}`;
} else {
  console.error('Use --local (after supabase start) or --project-id REF / SUPABASE_PROJECT_ID');
  process.exit(1);
}

const output = execSync(cmd, { encoding: 'utf-8' });
writeFileSync(outPath, output, 'utf-8');
console.log('Written:', outPath);
