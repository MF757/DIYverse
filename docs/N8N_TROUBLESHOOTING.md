# n8n SEO workflow – troubleshooting

## “Listening for test event” and connection issues

### What’s going wrong

- The URL you see with **`webhook-test`** is the **Test** URL. It only works while **“Listen for test event”** is running and is for manual testing only.
- **Supabase** must call the **Production** URL. If Supabase uses the Test URL, or the workflow is not Active, the webhook never receives the request and n8n can look “stuck”.

### Fix (step by step)

**Step 1: Stop “Listen for test event”**

- In the **Webhook** node, if it says “Listening for test event”, click it again (or close the panel) to **stop** listening.
- You do **not** need the test listener for normal operation.

**Step 2: Use the Production URL (no `-test`)**

- **Wrong (test):**  
  `https://mfdiy.app.n8n.cloud/webhook-test/diyverse-project-seo`
- **Correct (production):**  
  `https://mfdiy.app.n8n.cloud/webhook/diyverse-project-seo`

Use the **production** URL everywhere (Supabase, browser, etc.).

**Step 3: Activate the workflow**

- Turn the workflow **Active** (toggle in the top right). It should be **on** (e.g. green).
- Only when the workflow is Active does the **Production** webhook accept requests.

**Step 4: Configure Supabase to use the Production URL**

- In Supabase: **Database** → **Webhooks** → your webhook (or create one).
- Set **URL** to exactly:  
  `https://mfdiy.app.n8n.cloud/webhook/diyverse-project-seo`  
  (no `webhook-test`, no trailing slash).

**Step 5: Test**

- Create or update a project in your app.
- In n8n, open **Executions**. You should see a new run triggered by the webhook.
- If nothing appears, confirm: workflow is **Active**, Supabase webhook URL is the **production** URL (step 4), and the webhook is on table `public.projects` with **Insert** and **Update** enabled.

---

## Quick reference

| Item | Use this |
|------|----------|
| **Production URL** | `https://mfdiy.app.n8n.cloud/webhook/diyverse-project-seo` |
| **Test URL** | Only for manual tests; do **not** use in Supabase |
| **Workflow** | Must be **Active** for production webhook to work |
| **“Listen for test event”** | Turn **off** for normal use; use only for quick manual tests |

---

## Data types (reliable / industrial-grade)

- **Webhook payload:** JSON with `type` (string), `table` (string), `record` (object), `old_record` (object). We only use `record`; `record.id` and `record.description` are strings (or null).
- **Code node:** Always returns a single item: `{ project_id: string, meta_description: string }`. Empty string when no valid `record.id`.
- **HTTP Request body:** JSON `{ project_id: string, meta_description: string }`. Strings only.
- **Response:** JSON `{ success: boolean }` (and optionally `reason: string`). No custom or unstable types.
