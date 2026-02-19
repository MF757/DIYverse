-- DIYverse: project likes and saves (standard relational structure).

-- ---------------------------------------------------------------------------
-- project_likes: who liked which project
-- ---------------------------------------------------------------------------
create table public.project_likes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint project_likes_unique unique (project_id, profile_id)
);

create index project_likes_project_id_idx on public.project_likes(project_id);
create index project_likes_profile_id_idx on public.project_likes(profile_id);

-- ---------------------------------------------------------------------------
-- project_saves: who saved which project (bookmarks)
-- ---------------------------------------------------------------------------
create table public.project_saves (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint project_saves_unique unique (project_id, profile_id)
);

create index project_saves_project_id_idx on public.project_saves(project_id);
create index project_saves_profile_id_idx on public.project_saves(profile_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.project_likes enable row level security;
alter table public.project_saves enable row level security;

-- Likes: select for all (counts visible publicly); insert/delete own
create policy "project_likes_select" on public.project_likes for select
  to authenticated using (auth.uid() is not null);

create policy "project_likes_select_anon" on public.project_likes for select
  to anon using (true);

create policy "project_likes_insert_own" on public.project_likes for insert
  to authenticated with check (profile_id = private.get_my_profile_id());

create policy "project_likes_delete_own" on public.project_likes for delete
  to authenticated using (profile_id = private.get_my_profile_id());

-- Saves: same pattern
create policy "project_saves_select" on public.project_saves for select
  to authenticated using (auth.uid() is not null);

create policy "project_saves_select_anon" on public.project_saves for select
  to anon using (true);

create policy "project_saves_insert_own" on public.project_saves for insert
  to authenticated with check (profile_id = private.get_my_profile_id());

create policy "project_saves_delete_own" on public.project_saves for delete
  to authenticated using (profile_id = private.get_my_profile_id());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select, insert, delete on public.project_likes to authenticated;
grant select, insert, delete on public.project_saves to authenticated;
grant select on public.project_likes to anon;
grant select on public.project_saves to anon;
