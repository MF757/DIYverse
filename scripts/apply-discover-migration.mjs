#!/usr/bin/env node
/**
 * Apply Discover public-access migration to hosted Supabase.
 * Uses SUPABASE_DB_URL from .env, or prompts once for the Database URI.
 * Get URI: Supabase Dashboard → Project Settings → Database → Connection string → URI.
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env');
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf-8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined)
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve((answer || '').trim());
    });
  });
}

async function main() {
  let dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl || typeof dbUrl !== 'string' || !dbUrl.startsWith('postgres')) {
    console.log('Database URI not in .env. Paste it once (Supabase Dashboard → Project Settings → Database → Connection string → URI).\n');
    dbUrl = await prompt('Paste Database URI (starts with postgresql://): ');
    if (!dbUrl || !dbUrl.startsWith('postgres')) {
      console.error('Invalid or empty URI. Exiting.');
      process.exit(1);
    }
  }
  const pg = await import('pg');
  const sqlPath = join(root, 'supabase', 'migrations', 'apply_discover_public_access.sql');
  const sql = readFileSync(sqlPath, 'utf-8');
  const cleanUrl = dbUrl.replace(/\?sslmode=require$/, '');
  const client = new pg.default.Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Applied apply_discover_public_access.sql successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
