-- DIYverse: project comments and replies; comment likes.
-- Standard PostgreSQL types: uuid, timestamptz, text.

create table public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.project_comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint project_comments_body_non_empty check (char_length(trim(body)) > 0)
);

create index project_comments_project_id_idx on public.project_comments(project_id);
create index project_comments_parent_id_idx on public.project_comments(parent_id);
create index project_comments_created_at_idx on public.project_comments(created_at);

create table public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.project_comments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint comment_likes_unique unique (comment_id, profile_id)
);

create index comment_likes_comment_id_idx on public.comment_likes(comment_id);
create index comment_likes_profile_id_idx on public.comment_likes(profile_id);

alter table public.project_comments enable row level security;
alter table public.comment_likes enable row level security;

create policy "project_comments_select" on public.project_comments for select to authenticated using (auth.uid() is not null);
create policy "project_comments_select_anon" on public.project_comments for select to anon using (true);
create policy "project_comments_insert" on public.project_comments for insert to authenticated with check (profile_id = private.get_my_profile_id());
create policy "project_comments_delete_own" on public.project_comments for delete to authenticated using (profile_id = private.get_my_profile_id());

create policy "comment_likes_select" on public.comment_likes for select to authenticated using (auth.uid() is not null);
create policy "comment_likes_select_anon" on public.comment_likes for select to anon using (true);
create policy "comment_likes_insert" on public.comment_likes for insert to authenticated with check (profile_id = private.get_my_profile_id());
create policy "comment_likes_delete_own" on public.comment_likes for delete to authenticated using (profile_id = private.get_my_profile_id());

grant select, insert, delete on public.project_comments to authenticated;
grant select on public.project_comments to anon;
grant select, insert, delete on public.comment_likes to authenticated;
grant select on public.comment_likes to anon;
