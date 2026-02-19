# DIYverse Backend (Supabase / PostgreSQL)

Production-ready schema using **only standard, reliable PostgreSQL types and structures**.

## Data types and structures (commercial-grade only)

| Type / structure | Source | Notes |
|------------------|--------|--------|
| **UUID** | PostgreSQL core | `gen_random_uuid()` for all `id` defaults (PG 13+; no extension). |
| **timestamptz** | PostgreSQL core | All timestamps. |
| **text** | PostgreSQL core | Strings. |
| **boolean** | PostgreSQL core | Flags. |
| **jsonb** | PostgreSQL core | Audit payloads. |
| **ENUM** | PostgreSQL core | `public.app_role` (user, moderator, admin). |
| **storage.buckettype** | Supabase Storage | Used only for bucket insert (`STANDARD`); documented, stable. |

No experimental extensions. No `uuid-ossp`; UUID generation is core `gen_random_uuid()`.

## Migrations (order)

1. **20250201000001_initial_schema.sql** – `app_role`, private helpers, `profiles`, `projects`, triggers, RLS, grants.
2. **20250202000001_audit_schema.sql** – `audit.log`, `audit.role_changes`, audit triggers.
3. **20250202000002_storage_bucket_and_rls.sql** – Bucket `project-assets`, path helper, RLS on `storage.objects`.
4. **20250202000003_views.sql** – View `projects_public_with_owner`.

## Config

`supabase/config.toml` uses only documented, stable options (API, DB, Studio, Inbucket, Storage, Auth). No experimental or beta settings.

### Password reset (forgot password)

The app uses Supabase Auth’s **password recovery** flow:

1. User requests a reset on `/reset-password` (email only).
2. Supabase sends an email with a link to `redirectTo` (your app’s reset page).
3. User opens the link, lands on `/reset-password` with tokens in the URL hash; Supabase recovers the session and the user sets a new password.

**Required:** In Supabase Dashboard → **Authentication** → **URL Configuration** → **Redirect URLs**, add your app’s reset-password URL(s), for example:

- `http://localhost:5173/reset-password` (development)
- `https://yourdomain.com/reset-password` (production)

Without these, the “Forgot password?” email link will be rejected by Supabase.

## Security

- RLS on all application and audit tables. No `using (true)`.
- Role and ownership enforced in Postgres via `private.get_my_profile_id()` and `private.get_my_role()`.
- Storage: private bucket; path = `project-assets/<project_id>/...`; ownership tied to `public.projects`.
