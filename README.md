# DIYverse – Supabase setup

Industrial-grade Supabase integration: TypeScript, RLS, migrations, typed client.

## What’s already done in this repo

- **Dependencies:** `npm install` has been run.
- **Environment:** `.env` exists (copy of `.env.example`). Replace placeholder values with your Supabase project URL and keys (see step 1–2 below).
- **Config:** `supabase/config.toml` has `project_id = "diyverse"` and `supabase/seed.sql` exists so local Supabase starts without warnings.
- **Build:** TypeScript compiles (`npx tsc --noEmit`).

**Local Supabase** requires [Docker Desktop](https://docs.docker.com/desktop). If Docker is not running, use a **hosted Supabase project** and run the migration SQL in the dashboard (step 3).

## Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local dev and type generation)
- Docker Desktop (only for local Supabase)

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose org, name (e.g. `diyverse`), database password, region.
3. In **Project Settings → API** copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)

## 2. Configure environment

A `.env` file already exists. Edit it and set:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required only for server-side admin use)

Never commit `.env`. It is in `.gitignore`.

## 3. Run migrations on the hosted project

In the Supabase Dashboard:

1. **SQL Editor** → **New query**.
2. Paste the contents of `supabase/migrations/20250201000001_initial_schema.sql`.
3. Run the query.

Or link the project and push with the CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

## 4. Install and use

```bash
npm install
```

**Run the dev server** (serves `public/` at http://localhost:8080):

```bash
npm run dev
```

On Windows, if PowerShell reports *“script execution is disabled”*, use the CMD launcher instead (no policy change required):

```batch
.\dev.cmd
```

Or allow scripts for your user once: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` (then `npm run dev` works in PowerShell).

The frontend in `public/` shows a home page and a **Public projects** section. To load projects from Supabase, edit `public/config.js` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (same values as in `.env`). See `public/config.example.js` for the format.

- **Browser / client:** use `src/lib/supabase/client.ts` → `supabase` (anon key, RLS applies).
- **Server (user context):** use `createServerClient(accessToken)` from `src/lib/supabase/server.ts`.
- **Server (admin):** use `createServiceClient()` only on the server; never expose the service role key.

## 5. Regenerate TypeScript types (optional)

From **local** Supabase (after `npx supabase start`):

```bash
npm run db:generate
```

From **hosted** project (set `SUPABASE_PROJECT_ID` in `.env` or env):

```bash
npm run db:types
```

This overwrites `src/lib/supabase/database.types.ts`.

## Local development with Supabase

```bash
npx supabase start
npm run supabase:status   # URLs and keys for local .env)
npx supabase db reset    # apply migrations
npx supabase stop
```

Use the local URL and anon key in `.env` when working against local Supabase.

## Schema overview

- **profiles** – One per auth user; created automatically on signup. Editable by owner.
- **projects** – DIY projects; `owner_id` → `profiles.id`. RLS: public read when `is_public`, full CRUD for owner.

All tables use RLS. The anon key is safe for client use; the service role key must stay server-only.
