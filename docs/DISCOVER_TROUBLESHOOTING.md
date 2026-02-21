# Discover page: no projects shown

Use this list to find and fix why the Discover (home) feed is empty or fails. All users (signed in or not) should be able to see public projects.

**How the feed loads (order of tries):**  
1) View `projects_public_with_owner` via anon client.  
2) If that fails and you’re signed in: same view via authenticated client.  
3) If that still fails: load from `projects` (is_public = true) + `profiles` and merge (anon or authenticated).  
So the feed can work even when the view is missing, as long as RLS allows reading public projects and profiles.

---

## 1. Supabase not configured (env vars missing or wrong scope)

**Problem:** The app uses a stub client and never calls Supabase. You see an error like *"Content cannot be loaded. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"* or *"Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file"*.

**Solution:**
- **Local:** In project root, create or edit `.env` with:
  - `VITE_SUPABASE_URL=https://your-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=your-anon-key`
  Restart the dev server (`.\dev.bat` or `npm run dev`).
- **Vercel:** In the project’s **Settings → Environment Variables**, add both variables for **Production** and **Preview**. Redeploy so the build has the vars (Vite inlines them at build time).

---

## 2. Migrations not applied on your Supabase project

**Problem:** Anon (and thus the Discover feed) has no permission to read the view or base tables. The API may return 403 or empty data.

**Solution:** Apply all migrations to your **hosted** Supabase project:
- **Supabase extension (Cursor/VS Code):** Link the project in the extension, then use the extension to run or push migrations.
- In **Supabase Dashboard → SQL Editor**, run (in order) the contents of each file in `supabase/migrations/`, especially:
  - `20250202000003_views.sql` (creates `projects_public_with_owner`)
  - `20250607000001_anon_public_projects.sql` (grants anon SELECT on projects, profiles, and the view)
- Or, with Supabase CLI: `npx supabase link` then `npx supabase db push`.

---

## 3. No public projects in the database

**Problem:** The feed only shows projects with `is_public = true`. If there are no such rows, the list is empty and you see *"No public projects yet."*.

**Solution:** Publish at least one project and ensure **"List as public (visible in Discover)"** is checked. In Supabase **Table Editor → projects**, confirm some rows have `is_public = true`.

---

## 4. Wrong Supabase URL or anon key

**Problem:** Requests go to the wrong project or with an invalid key; you get 401/404 or empty/error responses.

**Solution:** In **Supabase Dashboard → Project Settings → API** copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`
Use these exact values in `.env` and in Vercel env vars, then rebuild/redeploy.

---

## 5. Network or CORS

**Problem:** Browser blocks requests (e.g. CORS) or network fails; the feed shows an error message from the client.

**Solution:** Supabase allows browser origins by default. If you use a custom domain, add it in **Supabase Dashboard → Authentication → URL Configuration** if needed. Check the browser **Network** tab for failed requests to your Supabase URL.

---

## 6. View / RLS out of order

**Problem:** The view `projects_public_with_owner` exists but anon has no `SELECT` grant, or RLS policies on `projects`/`profiles` block anon.

**Solution:** Ensure migration `20250607000001_anon_public_projects.sql` has been run. It must:
- Create policy `projects_select_anon_public` (anon can select projects where `is_public = true`)
- Create policy `profiles_select_anon` (anon can select profiles)
- Run `grant select on public.projects_public_with_owner to anon;`

---

## Quick checklist

| Check | Action |
|-------|--------|
| Env vars set for build | `.env` locally; Vercel env for Production + Preview |
| Migrations applied | Run migrations on hosted Supabase (SQL Editor or `db push`) |
| At least one public project | Publish a project with "List as public" checked |
| Correct URL and key | Copy from Supabase → Project Settings → API |

After each change, reload the Discover page (and redeploy on Vercel if you changed env vars).
