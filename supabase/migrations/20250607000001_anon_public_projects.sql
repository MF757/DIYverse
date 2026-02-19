-- DIYverse: allow anonymous read access to public projects and owner profiles.
-- Enables opening project detail and listing projects without signing in.
-- Industrial pattern: explicit RLS policies, no blanket using(true) on sensitive data.

-- ---------------------------------------------------------------------------
-- Projects: anon may select only public rows
-- ---------------------------------------------------------------------------
create policy "projects_select_anon_public"
  on public.projects for select
  to anon
  using (is_public = true);

-- ---------------------------------------------------------------------------
-- Profiles: anon may select for display (used by projects_public_with_owner)
-- ---------------------------------------------------------------------------
create policy "profiles_select_anon"
  on public.profiles for select
  to anon
  using (true);

-- ---------------------------------------------------------------------------
-- Grants: anon needs select on tables and view
-- ---------------------------------------------------------------------------
grant select on public.projects to anon;
grant select on public.profiles to anon;
grant select on public.projects_public_with_owner to anon;
