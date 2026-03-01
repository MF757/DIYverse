import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-seo-api-key",
};

const META_DESC_MAX = 160;

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function clampMetaDescription(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= META_DESC_MAX) return t;
  const trimmed = t.slice(0, META_DESC_MAX - 1).replace(/\s+\S*$/, "");
  return trimmed.length > 0 ? trimmed : t.slice(0, META_DESC_MAX);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const apiKey = req.headers.get("x-seo-api-key") ?? "";
    const expectedKey = Deno.env.get("SEO_API_KEY") ?? "";
    if (!expectedKey || apiKey !== expectedKey) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    let body: { project_id?: string; meta_description?: string | null; seo_title?: string | null };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const projectId = typeof body.project_id === "string" ? body.project_id.trim() : "";
    if (!projectId || !UUID_REGEX.test(projectId)) {
      return jsonResponse({ error: "Invalid or missing project_id" }, 400);
    }

    const updates: { meta_description?: string; seo_title?: string | null } = {};
    if (body.meta_description != null) {
      const v = typeof body.meta_description === "string" ? body.meta_description : "";
      updates.meta_description = clampMetaDescription(v);
    }
    if (body.seo_title != null) {
      const v = typeof body.seo_title === "string" ? body.seo_title.trim() : "";
      updates.seo_title = v.length > 0 ? v : null;
    }
    if (Object.keys(updates).length === 0) {
      return jsonResponse({ error: "Provide at least one of meta_description, seo_title" }, 400);
    }

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const client = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await client.from("projects").update(updates).eq("id", projectId).select("id").maybeSingle();

    if (error) {
      return jsonResponse({ error: error.message }, 400);
    }

    return jsonResponse({ success: true }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
