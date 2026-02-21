-- Run this in Supabase Dashboard → SQL Editor to enable Discover for everyone.
-- Idempotent: safe to run once; uses standard PostgreSQL types and grants.

-- View: public projects with owner (required for feed)
create or replace view public.projects_public_with_owner
with (security_invoker = on)
as
select
  p.id,
  p.owner_id,
  p.title,
  p.slug,
  p.description,
  p.cover_url,
  p.is_public,
  p.created_at,
  p.updated_at,
  pr.display_name as owner_display_name,
  pr.avatar_url as owner_avatar_url
from public.projects p
join public.profiles pr on pr.id = p.owner_id
where p.is_public = true;

grant select on public.projects_public_with_owner to authenticated;
grant select on public.projects_public_with_owner to anon;

-- Policies: anon can read public projects and profiles
drop policy if exists "projects_select_anon_public" on public.projects;
create policy "projects_select_anon_public"
  on public.projects for select to anon
  using (is_public = true);

drop policy if exists "profiles_select_anon" on public.profiles;
create policy "profiles_select_anon"
  on public.profiles for select to anon
  using (true);

-- Grants: anon select on base tables
grant select on public.projects to anon;
grant select on public.profiles to anon;
