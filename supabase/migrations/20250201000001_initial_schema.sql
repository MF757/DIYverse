-- DIYverse: production schema (standard PostgreSQL only)
-- Types: uuid, timestamptz, text, boolean, jsonb, enum. ID via gen_random_uuid() (PG 13+ core).
-- No experimental extensions. Commercial-grade structures only.

-- ---------------------------------------------------------------------------
-- Application role: PostgreSQL ENUM. Stored in DB, enforced in Postgres.
-- ---------------------------------------------------------------------------
create type public.app_role as enum (
  'user',
  'moderator',
  'admin'
);

comment on type public.app_role is 'Application role for RLS and admin actions.';

-- ---------------------------------------------------------------------------
-- Private schema (functions created after tables exist)
-- ---------------------------------------------------------------------------
create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Profiles: one per auth.users. Identity mirror. Role in DB.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_auth_user_id_unique unique (auth_user_id)
);

comment on table public.profiles is 'Mirror of auth identity; one row per auth.users.';
comment on column public.profiles.role is 'Application role; enforced in RLS.';

create index profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index profiles_role_idx on public.profiles(role);

-- ---------------------------------------------------------------------------
-- Projects: user-owned. Slug unique per owner. Standard checks.
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  cover_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_owner_unique unique (owner_id, slug),
  constraint projects_title_non_empty check (char_length(trim(title)) > 0),
  constraint projects_slug_non_empty check (char_length(trim(slug)) > 0),
  constraint projects_slug_format check (slug ~ '^[a-z0-9][a-z0-9_-]*$')
);

comment on table public.projects is 'User-created projects. Visibility by is_public and RLS.';
comment on column public.projects.slug is 'URL-safe; unique per owner. Lowercase alphanumeric, hyphen, underscore.';

create index projects_owner_id_idx on public.projects(owner_id);
create index projects_created_at_idx on public.projects(created_at desc);
create index projects_is_public_idx on public.projects(is_public) where is_public = true;
create index projects_owner_created_idx on public.projects(owner_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger (reusable)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (auth_user_id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS helper functions (after profiles exists). SECURITY DEFINER, search_path = ''.
-- ---------------------------------------------------------------------------
create or replace function private.get_my_profile_id()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select id from public.profiles where auth_user_id = auth.uid()
$$;

create or replace function private.get_my_role()
returns public.app_role
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles where auth_user_id = auth.uid()
$$;

grant execute on function private.get_my_profile_id() to authenticated;
grant execute on function private.get_my_role() to authenticated;
revoke execute on function private.get_my_profile_id() from anon;
revoke execute on function private.get_my_role() from anon;

-- ---------------------------------------------------------------------------
-- RLS: zero-trust. No using(true). Ownership + role-based.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (auth.uid() is not null);

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (auth_user_id = auth.uid() or private.get_my_role() = 'admin')
  with check (auth_user_id = auth.uid() or private.get_my_role() = 'admin');

create policy "projects_select_authenticated_visible_or_own"
  on public.projects for select
  to authenticated
  using (
    is_public = true
    or owner_id = private.get_my_profile_id()
    or private.get_my_role() in ('admin', 'moderator')
  );

create policy "projects_insert_own"
  on public.projects for insert
  to authenticated
  with check (owner_id = private.get_my_profile_id());

create policy "projects_update_own_or_staff"
  on public.projects for update
  to authenticated
  using (
    owner_id = private.get_my_profile_id()
    or private.get_my_role() in ('admin', 'moderator')
  )
  with check (
    owner_id = private.get_my_profile_id()
    or private.get_my_role() in ('admin', 'moderator')
  );

create policy "projects_delete_own_or_admin"
  on public.projects for delete
  to authenticated
  using (
    owner_id = private.get_my_profile_id()
    or private.get_my_role() = 'admin'
  );

-- ---------------------------------------------------------------------------
-- Grants: anon no access to profiles/projects. Authenticated CRUD per RLS.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
