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

## SPA routing

`vercel.json` includes rewrites so all routes (e.g. `/profile/123`, `/project/...`) serve `index.html` and React Router works correctly.

## Troubleshooting

- **Build fails**  
  Check the build log on Vercel. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set for the deployment environment.

- **Blank or broken app**  
  Confirm the same two env vars are set and that your Supabase project allows requests from the Vercel domain (e.g. in Auth URL settings if you use redirects).
