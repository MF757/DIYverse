# Apply the Discover migration (one step)

**Do this once so the Discover page can load projects for everyone.**

1. Open **Supabase Dashboard** → your project → **Project Settings** → **Database**.
2. Under **Connection string**, select **URI** and copy the full string (starts with `postgresql://`).
3. In the project root, run:
   ```bash
   npm run apply-discover-migration
   ```
4. When prompted, **paste** the URI and press **Enter**.

The script will apply `apply_discover_public_access.sql` (view + anon policies/grants). You should see: `Applied apply_discover_public_access.sql successfully.`

No need to add anything to `.env` unless you want to run the script again without pasting (then add `SUPABASE_DB_URL=postgresql://...` to `.env`).

**If you see "self-signed certificate in certificate chain":** run with TLS verification disabled for this one command (Supabase uses its own CA). PowerShell: `$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npm run apply-discover-migration`. Bash: `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run apply-discover-migration`.
