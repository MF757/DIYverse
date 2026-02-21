# Connect to Supabase and apply Discover steps

Use the **script** (Option A), **Dashboard SQL Editor** (Option B), or **CLI** (Option C) so the Discover page works for everyone.

---

## Option A: Run the migration script (one command after adding DB URL)

1. **Get your database connection string**  
   Supabase Dashboard → your project → **Project Settings** → **Database** → **Connection string** → **URI**. Copy the URI (it includes the password).

2. **Add to `.env`**  
   In the project root, add one line (use your copied URI):
   ```env
   SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@...
   ```

3. **Run the migration**  
   In the project root:
   ```bash
   npm run apply-discover-migration
   ```
   You should see: `Applied apply_discover_public_access.sql successfully.`

4. **Env vars**  
   Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in `.env` and Vercel (from **Project Settings** → **API**).

---

## Option B: Supabase Dashboard SQL Editor (no DB URL on your machine)

1. **Open your project**  
   Go to [supabase.com/dashboard](https://supabase.com/dashboard) and open the project whose URL is in your `.env` (e.g. `https://dtvumpeiyfhkoatuqjmt.supabase.co`).

2. **Run the access SQL**  
   - In the dashboard: **SQL Editor** → **New query**.  
   - Open `supabase/migrations/apply_discover_public_access.sql` in this repo.  
   - Paste its full contents into the editor and click **Run**.  
   - You should see “Success” and no errors.

3. **Confirm env vars**  
   - **Project Settings** → **API**: copy **Project URL** and **anon public** key.  
   - In your app: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (in `.env` locally and in Vercel for production).  
   - Restart the dev server or redeploy after changing env.

After this, the Discover page can load public projects for all users (signed in or not).

---

## Option C: Supabase CLI (link + push migrations)

1. **Log in**  
   In the project root:
   ```bash
   npx.cmd supabase login
   ```
   Complete the browser login when prompted.

2. **Link the project**  
   Use the project ref from your Supabase URL (e.g. `dtvumpeiyfhkoatuqjmt` from `https://dtvumpeiyfhkoatuqjmt.supabase.co`):
   ```bash
   npx.cmd supabase link --project-ref dtvumpeiyfhkoatuqjmt
   ```
   Enter your database password when asked (from **Project Settings** → **Database**).

3. **Push migrations**  
   ```bash
   npx.cmd supabase db push
   ```
   This applies all migrations in `supabase/migrations/`, including anon access for the Discover page.

4. **Env vars**  
   Same as in Option A: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` and Vercel.

---

## Checklist

| Step | Script (A) | SQL Editor (B) | CLI (C) |
|------|------------|----------------|---------|
| View + anon policies and grants | `npm run apply-discover-migration` (after adding `SUPABASE_DB_URL` to .env) | Run `apply_discover_public_access.sql` in SQL Editor | `supabase db push` |
| Env vars | Copy from Project Settings → API | Same | Same |
| Discover works for everyone | After script + env | After SQL + env | After push + env |

All SQL uses standard PostgreSQL types (e.g. `uuid`, `text`, `boolean`, `timestamptz`).
