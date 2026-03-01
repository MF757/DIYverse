-- DIYverse: Persistent project gallery images (industrial-grade).
-- Gallery image paths were previously stored only in projects.description JSON;
-- they could be lost on description overwrite or parse failure. Store them in a
-- dedicated table with standard types: uuid, text, smallint.

-- ---------------------------------------------------------------------------
-- project_images: one row per gallery image, ordered by sort_order
-- ---------------------------------------------------------------------------
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sort_order smallint not null default 0,
  storage_path text not null,
  created_at timestamptz not null default now(),
  constraint project_images_storage_path_non_empty check (char_length(trim(storage_path)) > 0)
);
comment on table public.project_images is 'Gallery image paths per project; order preserved. Replaces imageUrls in description metadata.';

create index project_images_project_id_idx on public.project_images(project_id);
create index project_images_project_sort_idx on public.project_images(project_id, sort_order);

-- ---------------------------------------------------------------------------
-- RLS: same visibility as project (public or owner/staff)
-- ---------------------------------------------------------------------------
alter table public.project_images enable row level security;

create policy "project_images_select_authenticated"
  on public.project_images for select to authenticated
  using (private.project_readable(project_id));
create policy "project_images_select_anon"
  on public.project_images for select to anon
  using (private.project_readable(project_id));
create policy "project_images_insert"
  on public.project_images for insert to authenticated
  with check (private.project_writable(project_id));
create policy "project_images_update"
  on public.project_images for update to authenticated
  using (private.project_writable(project_id))
  with check (private.project_writable(project_id));
create policy "project_images_delete"
  on public.project_images for delete to authenticated
  using (private.project_writable(project_id));

grant select on public.project_images to authenticated, anon;
grant insert, update, delete on public.project_images to authenticated;
