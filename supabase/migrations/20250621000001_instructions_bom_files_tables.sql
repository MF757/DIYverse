-- DIYverse: Instructions, Components/BOM, and File/Downloads tables.
-- Comments already exist (project_comments, comment_likes in 20250602000004).
-- Standard PostgreSQL types only: uuid, text, timestamptz, smallint, text[].

-- ---------------------------------------------------------------------------
-- File type for downloads (check constraint)
-- ---------------------------------------------------------------------------
create type public.project_file_type as enum (
  'stl',
  '3mf',
  'gerber',
  'pdf',
  'other'
);
comment on type public.project_file_type is 'Download file type for project assets.';

-- ---------------------------------------------------------------------------
-- project_components: Bill of Materials (BOM) per project
-- ---------------------------------------------------------------------------
create table public.project_components (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  quantity text not null default '1',
  link text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint project_components_name_non_empty check (char_length(trim(name)) > 0)
);
comment on table public.project_components is 'Bill of materials / components per project.';

create index project_components_project_id_idx on public.project_components(project_id);
create index project_components_project_sort_idx on public.project_components(project_id, sort_order);

-- ---------------------------------------------------------------------------
-- project_instruction_steps: Instruction steps per project
-- ---------------------------------------------------------------------------
create table public.project_instruction_steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sort_order smallint not null default 0,
  description text not null,
  image_path text,
  tools text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint project_instruction_steps_description_non_empty check (char_length(trim(description)) > 0)
);
comment on table public.project_instruction_steps is 'Instruction steps per project (maker mode).';

create index project_instruction_steps_project_id_idx on public.project_instruction_steps(project_id);
create index project_instruction_steps_project_sort_idx on public.project_instruction_steps(project_id, sort_order);

-- ---------------------------------------------------------------------------
-- project_instruction_step_components: which BOM components a step uses
-- ---------------------------------------------------------------------------
create table public.project_instruction_step_components (
  step_id uuid not null references public.project_instruction_steps(id) on delete cascade,
  component_id uuid not null references public.project_components(id) on delete cascade,
  primary key (step_id, component_id),
  constraint step_component_same_project check (
    (select project_id from public.project_instruction_steps where id = step_id)
    = (select project_id from public.project_components where id = component_id)
  )
);
comment on table public.project_instruction_step_components is 'Links instruction steps to BOM components used in that step.';

create index project_instruction_step_components_step_id_idx on public.project_instruction_step_components(step_id);
create index project_instruction_step_components_component_id_idx on public.project_instruction_step_components(component_id);

-- ---------------------------------------------------------------------------
-- project_files: downloadable files per project
-- ---------------------------------------------------------------------------
create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  storage_path text not null,
  file_type public.project_file_type not null default 'other',
  created_at timestamptz not null default now(),
  constraint project_files_name_non_empty check (char_length(trim(name)) > 0),
  constraint project_files_storage_path_non_empty check (char_length(trim(storage_path)) > 0)
);
comment on table public.project_files is 'Downloadable files (STL, 3MF, Gerber, PDF, etc.) per project.';

create index project_files_project_id_idx on public.project_files(project_id);

-- ---------------------------------------------------------------------------
-- RLS: same visibility as project (public or owner/staff)
-- ---------------------------------------------------------------------------
alter table public.project_components enable row level security;
alter table public.project_instruction_steps enable row level security;
alter table public.project_instruction_step_components enable row level security;
alter table public.project_files enable row level security;

-- Helper: true if current user can read project (public, owner, or staff). Safe for anon (auth.uid() null).
create or replace function private.project_readable(pid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid
      and (
        p.is_public = true
        or p.owner_id = (select id from public.profiles where auth_user_id = auth.uid() limit 1)
        or (select role from public.profiles where auth_user_id = auth.uid() limit 1) in ('admin', 'moderator')
      )
  );
$$;

-- Helper: true if current user can write project (owner or staff). Authenticated only.
create or replace function private.project_writable(pid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid
      and (
        p.owner_id = (select id from public.profiles where auth_user_id = auth.uid() limit 1)
        or (select role from public.profiles where auth_user_id = auth.uid() limit 1) in ('admin', 'moderator')
      )
  );
$$;

grant execute on function private.project_readable(uuid) to authenticated;
grant execute on function private.project_readable(uuid) to anon;
grant execute on function private.project_writable(uuid) to authenticated;

-- project_components
create policy "project_components_select_authenticated"
  on public.project_components for select to authenticated
  using (private.project_readable(project_id));
create policy "project_components_select_anon"
  on public.project_components for select to anon
  using (private.project_readable(project_id));
create policy "project_components_insert"
  on public.project_components for insert to authenticated
  with check (private.project_writable(project_id));
create policy "project_components_update"
  on public.project_components for update to authenticated
  using (private.project_writable(project_id))
  with check (private.project_writable(project_id));
create policy "project_components_delete"
  on public.project_components for delete to authenticated
  using (private.project_writable(project_id));

-- project_instruction_steps
create policy "project_instruction_steps_select_authenticated"
  on public.project_instruction_steps for select to authenticated
  using (private.project_readable(project_id));
create policy "project_instruction_steps_select_anon"
  on public.project_instruction_steps for select to anon
  using (private.project_readable(project_id));
create policy "project_instruction_steps_insert"
  on public.project_instruction_steps for insert to authenticated
  with check (private.project_writable(project_id));
create policy "project_instruction_steps_update"
  on public.project_instruction_steps for update to authenticated
  using (private.project_writable(project_id))
  with check (private.project_writable(project_id));
create policy "project_instruction_steps_delete"
  on public.project_instruction_steps for delete to authenticated
  using (private.project_writable(project_id));

-- project_instruction_step_components (read via steps; write via step ownership)
create policy "project_instruction_step_components_select_authenticated"
  on public.project_instruction_step_components for select to authenticated
  using (
    private.project_readable((select project_id from public.project_instruction_steps where id = step_id))
  );
create policy "project_instruction_step_components_select_anon"
  on public.project_instruction_step_components for select to anon
  using (
    private.project_readable((select project_id from public.project_instruction_steps where id = step_id))
  );
create policy "project_instruction_step_components_insert"
  on public.project_instruction_step_components for insert to authenticated
  with check (
    private.project_writable((select project_id from public.project_instruction_steps where id = step_id))
  );
create policy "project_instruction_step_components_delete"
  on public.project_instruction_step_components for delete to authenticated
  using (
    private.project_writable((select project_id from public.project_instruction_steps where id = step_id))
  );

-- project_files
create policy "project_files_select_authenticated"
  on public.project_files for select to authenticated
  using (private.project_readable(project_id));
create policy "project_files_select_anon"
  on public.project_files for select to anon
  using (private.project_readable(project_id));
create policy "project_files_insert"
  on public.project_files for insert to authenticated
  with check (private.project_writable(project_id));
create policy "project_files_update"
  on public.project_files for update to authenticated
  using (private.project_writable(project_id))
  with check (private.project_writable(project_id));
create policy "project_files_delete"
  on public.project_files for delete to authenticated
  using (private.project_writable(project_id));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.project_components to authenticated, anon;
grant insert, update, delete on public.project_components to authenticated;

grant select on public.project_instruction_steps to authenticated, anon;
grant insert, update, delete on public.project_instruction_steps to authenticated;

grant select on public.project_instruction_step_components to authenticated, anon;
grant insert, delete on public.project_instruction_step_components to authenticated;

grant select on public.project_files to authenticated, anon;
grant insert, update, delete on public.project_files to authenticated;
