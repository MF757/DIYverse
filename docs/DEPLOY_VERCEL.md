# Deploy DIYverse to Vercel

Connect your GitHub repo to Vercel so every push can deploy automatically.

## 1. Connect via Vercel Dashboard (recommended)

1. **Sign in**  
   Go to [vercel.com](https://vercel.com) and sign in (use “Continue with GitHub” if your repo is on GitHub).

2. **Import the project**  
   - Click **Add New…** → **Project**.  
   - Under **Import Git Repository**, find **DIYverse** (or the repo you pushed).  
   - Click **Import**.

3. **Configure the project**  
   Vercel will detect the app from `vercel.json`. You can leave:
   - **Framework Preset:** Vite  
   - **Build Command:** `npm run build`  
   - **Output Directory:** `dist`  
   - **Install Command:** `npm install`  

   Node version is taken from `package.json` (`engines.node`, e.g. `>=20.0.0`).

4. **Add environment variables**  
   In the same screen, open **Environment Variables** and add:

   | Name                     | Value                          | Environment  |
   |--------------------------|---------------------------------|-------------|
   | `VITE_SUPABASE_URL`      | Your Supabase project URL       | All         |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key   | All         |

   Use the same values as in your local `.env` (from Supabase Dashboard → Project Settings → API).

5. **Deploy**  
   Click **Deploy**. Vercel will build and deploy. You’ll get a URL like `diyverse.vercel.app` (or similar).

6. **Later deploys**  
   Every push to the connected branch (e.g. `main`) will trigger a new deployment.

---

## How to update Vercel yourself (step-by-step)

Use this whenever you change code and want the live site to update. Steps use standard Git commands and a single branch (`main`).

1. **Open a terminal**  
   In your project folder (e.g. `c:\DIYverse`).

2. **See what changed**  
   Run:  
   `git status`  
   You’ll see a list of modified files (and optionally untracked files). Ignore `.cursor/` and `.env`; don’t commit secrets.

3. **Stage the files you want to deploy**  
   - To stage everything except `.cursor/`:  
     `git add -A`  
     then  
     `git reset -- .cursor/`  
   - Or stage specific files only, e.g.:  
     `git add src/`

4. **Commit with a short message**  
   Run:  
   `git commit -m "Your message here"`  
   Use a clear, short message (e.g. “Fix avatar on project page”, “Add delete project button”).

5. **Push to GitHub**  
   Run:  
   `git push origin main`  
   (Use `main` if that’s your default branch; otherwise use your branch name.)

6. **Let Vercel build**  
   After the push, Vercel will start a new deployment automatically.  
   - Open [vercel.com](https://vercel.com) → your project → **Deployments**.  
   - Wait until the latest deployment shows **Ready** (usually 1–2 minutes).  
   - Your live site URL will then show the updated version.

**Summary:**  
`git status` → `git add ...` → `git commit -m "..."` → `git push origin main` → check Vercel dashboard until the deployment is **Ready**.

---

## After database/schema changes

If you added new Supabase migrations (e.g. new tables like `project_images`), run them on your hosted Supabase project so the app stays in sync:

- **Supabase Dashboard:** SQL Editor → run the new migration files in order, or  
- **CLI:** `supabase db push` (with your project linked).

Then trigger a new Vercel deploy (push a commit or use **Redeploy** in the Vercel dashboard).

## 2. Optional: Deploy from the CLI

If you prefer to deploy from your machine:

1. **Log in once**  
   In the project folder:
   ```bash
   npx vercel login
   ```
   Complete the browser login.

2. **Deploy**  
   ```bash
   npx vercel
   ```
   First time: accept linking to an existing Vercel project or create a new one.  
   Add the same env vars when prompted, or in the Vercel dashboard under **Settings → Environment Variables**.

   For a production URL:
   ```bash
   npx vercel --prod
   ```

---

## Public access and cost

- **No sign-in required to view content.** Home feed, project pages, and public profiles use the Supabase **anon key** only. Row Level Security (RLS) limits rows to public projects and profile display.
- **No serverless/Edge for reads.** All data is fetched client-side from Supabase. Vercel only serves static assets and the SPA; no server or Edge invocations for viewing content, which keeps cost minimal and reliable.
- Set only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for core content; other `VITE_*` vars are optional (e.g. AdSense, Search Console).

---

## SPA routing

`vercel.json` includes rewrites so all routes (e.g. `/profile/123`, `/project/...`) serve `index.html` and React Router works correctly.

## Troubleshooting

- **Build fails**  
  Check the build log on Vercel. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set for the deployment environment.

- **Blank or broken app**  
  Confirm the same two env vars are set and that your Supabase project allows requests from the Vercel domain (e.g. in Auth URL settings if you use redirects).

- **Discover page shows no projects**  
  See [DISCOVER_TROUBLESHOOTING.md](DISCOVER_TROUBLESHOOTING.md) for a step-by-step list of causes and fixes (env vars, migrations, public projects, RLS).
