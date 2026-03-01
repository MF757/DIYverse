# Detailed n8n setup instructions for DIYverse SEO

This guide walks you through setting up **n8n** so that every new or updated project gets an automatic meta description (and optional SEO title) for better search and social previews.

---

## No localhost: use n8n Cloud (recommended)

You don’t need to run n8n on your computer. Use **n8n Cloud** instead — it runs in the browser and gives you a **public webhook URL** that Supabase can call. No localhost, no ngrok, no Docker.

1. Go to **[n8n.io](https://n8n.io)** and **sign up** (or log in).
2. Create a **new workflow**.
3. **Import** the DIYverse workflow (see **Part B** — you can paste the JSON from `docs/n8n-seo-workflow.json`).
4. **Configure** the “Update project SEO” node (Part C) and **activate** the workflow.
5. In **Supabase**, add the secret and create the **Database Webhook** (Part D), using the **Production URL** from n8n Cloud.

Your webhook URL will look like: `https://your-workspace.app.n8n.cloud/webhook/diyverse-project-seo` — Supabase can reach it directly.

---

## What you’ll do

1. **Use n8n Cloud** (no local install) or self‑hosted if you prefer.
2. **Import** the DIYverse SEO workflow.
3. **Configure** the workflow (Supabase URL + API key — already done in the JSON file).
4. **Configure Supabase**: add a secret and a database webhook that calls n8n.
5. **Test** by creating or editing a project.

---

## Part A: Run n8n (use Cloud to avoid localhost)

### Option 1: n8n Cloud — no localhost (recommended)

1. Go to **[n8n.io](https://n8n.io)** and sign up (or log in).
2. From the dashboard, create a new **workflow** or open an existing one.
3. Skip to **Part B** to import the DIYverse workflow.  
   Your webhook URL will be something like:  
   `https://your-instance.app.n8n.cloud/webhook/diyverse-project-seo`  
   Supabase can call it directly; no localhost or ngrok.

### Option 2: n8n with npm (local — only if you want to self‑host)

1. **Prerequisites**: Node.js 18+ and npm.
2. In a terminal, run:
   ```bash
   npx n8n
   ```
3. Open **http://localhost:5678** in your browser (if your network allows it).
4. For Supabase (in the cloud) to call your n8n, your webhook must be public — use **ngrok** (Part E).

### Option 3: n8n with Docker (local — only if you want to self‑host)

1. **Prerequisites**: Docker.
2. Run:
   ```bash
   docker run -it --rm -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
   ```
3. Open **http://localhost:5678** and use **ngrok** (Part E) so Supabase can reach the webhook.

---

## Part B: Import the DIYverse SEO workflow

**If you use n8n Cloud:** you can’t use “Import from File” from your PC. Use **Import from JSON** / **Paste from clipboard** instead:

1. On your computer, open **`docs/n8n-seo-workflow.json`** in a text editor (e.g. Notepad, VS Code).
2. Select all (Ctrl+A) and copy (Ctrl+C).
3. In n8n Cloud: open the **⋮** menu (top right) → **Import** → **Import from URL or File** or **Paste from clipboard** (or similar). Paste the JSON and confirm.
4. You should see four nodes: **Webhook**, **Build meta description**, **Update project SEO**, **Respond to Webhook**.
5. **Save** the workflow (e.g. name it “DIYverse project SEO”).

**If you run n8n locally:** you can use **Import from File** and choose `docs/n8n-seo-workflow.json` from your project folder.

---

## Part C: Get the Webhook URL and configure the HTTP Request node

### Step C1: Get the Webhook URL

1. Click the **Webhook** node (first node).
2. In the right panel you’ll see:
   - **Production URL** — use this for Supabase and for normal operation (e.g. `https://mfdiy.app.n8n.cloud/webhook/diyverse-project-seo`). **Do not use the Test URL in Supabase.**
   - **Test URL** — contains `webhook-test` in the path; only works while **“Listen for test event”** is running. Leave “Listen for test event” **off** for normal use; turn the workflow **Active** instead.
3. **Copy the Production URL** (the one with `/webhook/`, not `/webhook-test/`). Paste it into Supabase in Part D.

### Step C2: Configure the “Update project SEO” node

**If you imported the project’s `docs/n8n-seo-workflow.json`:** the **URL** and **x-seo-api-key** are already set (your Supabase project and a generated secret). You only need to add that **same secret** in Supabase (Part D1). If you changed the workflow or use a different JSON, follow the steps below.

1. Click the **Update project SEO** node (third node).
2. In **URL**:
   - It should be: `https://dtvumpeiyfhkoatuqjmt.supabase.co/functions/v1/update-project-seo`  
   - If not, set it to that (replace `<PROJECT_REF>` with your Supabase project ref from the dashboard URL).
3. In **Headers** (or “Header Parameters”):
   - The **x-seo-api-key** should already be set. Use the **exact same value** in Supabase as the `SEO_API_KEY` secret (see **docs/SEO_KEY_FOR_SUPABASE.md**).
   - To generate a new secret: PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])`, or any long random string.
4. Leave **Body** as is.
5. Save the node and the workflow.

---

## Part D: Configure Supabase

### Step D1: Add the Edge Function secret

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** and select your project.
2. Go to **Edge Functions** (left sidebar). If you see **Secrets** or **Function secrets**, open that. Otherwise go to **Project Settings** → **Edge Functions** and find where to add **secrets**.
3. Add a new secret:
   - **Name**: `SEO_API_KEY`
   - **Value**: the same long random string you put in the n8n **x-seo-api-key** header (Step C2).
4. Save. The `update-project-seo` Edge Function will use this to authenticate requests from n8n.

### Step D2: Create the Database Webhook (so Supabase calls n8n)

1. In the Supabase dashboard, go to **Database** → **Webhooks** (or **Database** → **Webhooks** in the left menu).
2. Click **Create a new webhook**.
3. Fill in:
   - **Name**: e.g. `Notify n8n on project change`
   - **Table**: `public.projects`
   - **Events**: enable **Insert** and **Update**
   - **URL**: paste the **Production Webhook URL** you copied from n8n (Part C1).
   - **HTTP Headers** (optional): leave empty unless you need extra auth for n8n.
4. Create/Save the webhook.

Supabase will now send a POST request to n8n whenever a row is inserted or updated in `public.projects`. The body will look like:

```json
{
  "type": "INSERT",
  "table": "projects",
  "record": {
    "id": "uuid-here",
    "title": "...",
    "description": "...",
    ...
  },
  "old_record": { ... }
}
```

The n8n workflow uses `record` to build the meta description and call your Edge Function.

---

## Part E: Expose local n8n to the internet (only if n8n runs on your machine)

If n8n is on **localhost** (npm or Docker), Supabase cannot reach it unless you expose it.

1. Install **[ngrok](https://ngrok.com)** (or use another tunnel).
2. Run:
   ```bash
   ngrok http 5678
   ```
3. Copy the **HTTPS** URL ngrok shows (e.g. `https://abc123.ngrok.io`).
4. Your n8n **Production Webhook URL** will be:
   ```text
   https://abc123.ngrok.io/webhook/diyverse-project-seo
   ```
   (The path `/webhook/diyverse-project-seo` comes from the Webhook node’s path in the workflow.)
5. Use **this full URL** in Supabase as the webhook URL (Step D2).  
   If you restart ngrok, the URL will change and you must update the webhook in Supabase.

---

## Part F: Activate the workflow and test

### Activate the workflow

1. In n8n, open the **DIYverse project SEO** workflow.
2. Toggle the workflow **Active** (top right). It should turn green/enabled.
3. Ensure the workflow is saved.

### Test

1. **Create or edit a project** in your DIYverse app (e.g. add a new project or change the description of an existing one and save).
2. In n8n, open **Executions** (left sidebar). You should see a new execution (triggered by the Webhook).
3. Open the execution to see each node’s input/output. The **Update project SEO** node should return a successful response (e.g. 200 with `{ "success": true }`).
4. In **Supabase** → **Table Editor** → **projects**, open the same project row and check that **meta_description** (and **seo_title** if you use it) is filled.
5. Open the **project detail page** in your app and view the page source (or use “Inspect” → Elements). The `<meta name="description" content="...">` should show the generated meta description.

If something fails:

- **Webhook not triggered**: Confirm the Supabase webhook URL is exactly the n8n Production URL, the workflow is Active, and (if local) ngrok is running and the URL is updated in Supabase.
- **401 Unauthorized**: The **x-seo-api-key** value in n8n must match the **SEO_API_KEY** secret in Supabase exactly (no extra spaces).
- **400 Bad Request**: Check the execution input to the **Update project SEO** node; it must receive `project_id` (UUID) and `meta_description` (string). The **Build meta description** node should output that shape.

---

## Quick reference

| Where        | What to set |
|-------------|-------------|
| **n8n Webhook node** | Copy the **Production URL** → use in Supabase webhook URL. |
| **n8n “Update project SEO” node** | **URL**: `https://<PROJECT_REF>.supabase.co/functions/v1/update-project-seo`. **Header** `x-seo-api-key`: your secret. |
| **Supabase Edge Function secret** | Name: `SEO_API_KEY`. Value: same as `x-seo-api-key` in n8n. |
| **Supabase Database Webhook** | Table: `public.projects`. Events: Insert, Update. URL: n8n Production Webhook URL. |

---

## Optional: use AI to generate meta descriptions

The imported workflow uses a **Code** node that builds a meta description from the project title and description (no AI). To use an AI model instead:

1. Add an **OpenAI** or **Anthropic** node (or similar) **after** the **Build meta description** node (or replace the Code node logic with a call to AI).
2. Send the project `title` and `description` (from the webhook body) to the AI and ask it to return a single meta description (max 160 characters, one line).
3. Use the AI output in the **Update project SEO** node as `meta_description` (and optionally build `seo_title`).
4. Configure the AI node with your API key in n8n credentials.

The rest of the setup (webhook URL, Supabase secret, database webhook) stays the same.
