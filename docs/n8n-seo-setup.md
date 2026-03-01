# n8n SEO automation for DIYverse

**For step-by-step setup, see [N8N_SETUP_INSTRUCTIONS.md](./N8N_SETUP_INSTRUCTIONS.md).**

This setup lets **n8n** fill SEO fields that users don’t control (e.g. `meta_description`, `seo_title`) so every project gets consistent, click-friendly snippets.

## Overview

1. **Database**: `projects.meta_description` and `projects.seo_title` (nullable `text`). Set by automation only.
2. **App**: Project detail page uses these when present; otherwise falls back to author content.
3. **Edge Function**: `update-project-seo` — accepts `project_id` + `meta_description` / `seo_title`, updates the row. Secured by `SEO_API_KEY` (header `x-seo-api-key`).
4. **n8n**: Triggered by project create/update; builds meta text and calls the Edge Function.

## 1. Supabase: set Edge Function secret

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Edge Functions** → **Secrets** (or **Settings** → **Edge Functions**):

- Add secret: **`SEO_API_KEY`** = a long random string (e.g. `openssl rand -hex 32`).  
- Use this same value in n8n as the `x-seo-api-key` header when calling the function.

## 2. Supabase: Database Webhook → n8n

In **Database** → **Webhooks** → **Create a new webhook**:

- **Name**: e.g. `Notify n8n on project change`
- **Table**: `public.projects`
- **Events**: Insert, Update
- **URL**: your n8n Webhook URL (see step 3)
- **HTTP Headers** (optional): add any auth you need for n8n

Supabase will send a POST body like:

```json
{
  "type": "INSERT",
  "table": "projects",
  "record": {
    "id": "uuid",
    "owner_id": "uuid",
    "title": "...",
    "slug": "...",
    "description": "...",
    "cover_url": null,
    "is_public": true,
    "created_at": "...",
    "updated_at": "...",
    "meta_description": null,
    "seo_title": null
  },
  "old_record": { ... }
}
```

Use `record` in n8n to build `meta_description` / `seo_title` and call the Edge Function.

## 3. n8n: workflow and Webhook URL

1. In n8n, **Import from File** the workflow: `docs/n8n-seo-workflow.json`.
2. Open the **Webhook** node and **Listen for Test Event** or deploy the workflow; copy the **Production** or **Test** Webhook URL.
3. Put that URL into the Supabase webhook (step 2).
4. In the **HTTP Request** node (“Update project SEO”):
   - **URL**: `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/functions/v1/update-project-seo`  
     (Replace `<YOUR_SUPABASE_PROJECT_REF>` with your project ref, e.g. from the Supabase dashboard URL.)
   - **Header** `x-seo-api-key`: your `SEO_API_KEY` value (use a credential or expression).
   - **Body**: `{ "project_id": "{{ $json.project_id }}", "meta_description": "{{ $json.meta_description }}" }` (and optionally `seo_title`).
   - In the imported JSON you will see placeholders `YOUR_PROJECT_REF` and `YOUR_SEO_API_KEY`; replace them with your real values (or set URL and header in the node UI).

The bundled workflow uses a **Code** node to build `meta_description` from `record.description` / `record.title` (no AI). You can replace that with an **OpenAI** / **Anthropic** node to generate richer descriptions.

## 4. Data types (industrial-grade)

- **Database**: `meta_description` and `seo_title` are `text` (nullable). No JSON in these columns.
- **Edge Function**: accepts JSON body with `project_id` (string UUID), `meta_description` (string, optional), `seo_title` (string, optional). Meta description is clamped to 160 characters.
- **App**: uses `string | null` from the view; prefers system-set values over author content.

## 5. Optional: run n8n locally

```bash
npx n8n
```

Or with Docker:

```bash
docker run -it --rm -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

Then open http://localhost:5678, import the workflow, and use the webhook URL (with ngrok or similar for Supabase to reach it) for development.

## Files

| File | Purpose |
|------|--------|
| `supabase/migrations/20260227160230_projects_seo_meta_columns.sql` | Adds `meta_description`, `seo_title` and updates view |
| `supabase/functions/update-project-seo/index.ts` | Edge Function for n8n to PATCH project SEO |
| `docs/n8n-seo-workflow.json` | n8n workflow (Webhook → Build meta → HTTP to Edge Function) |
