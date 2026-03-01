# Add this secret in Supabase (one-time)

The n8n workflow is already configured with your Supabase URL and the API key below. You only need to add the **same key** in Supabase so the Edge Function accepts requests from n8n.

## Steps

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** → your project (**dtvumpeiyfhkoatuqjmt**).
2. Go to **Project Settings** (gear icon) → **Edge Functions** (or **Edge Functions** in the sidebar, then look for **Secrets**).
3. Under **Secrets**, add:
   - **Name**: `SEO_API_KEY`
   - **Value**: (copy the line below)

```
0YtVEG4k9BRqsm5B3qoYVjLJF8eE4n7TOY0eRtDBymk=
```

4. Save. The `update-project-seo` function will then accept requests that send this value in the `x-seo-api-key` header (the workflow already does).

---

**Security**: This file contains a secret. If your repo is public, add `docs/SEO_KEY_FOR_SUPABASE.md` to `.gitignore` or delete this file after you’ve added the secret to Supabase, and regenerate the key in both places if needed.
