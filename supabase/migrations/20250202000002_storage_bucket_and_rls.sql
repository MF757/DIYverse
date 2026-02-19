-- DIYverse: private storage bucket and path-helper (standard PostgreSQL)
-- Path: project-assets/<project_id>/... Ownership tied to public.projects.
-- Note: RLS on storage.objects cannot be applied via migration (table owned by Supabase).
-- Add storage policies in Dashboard (Storage → Policies) using private.storage_project_owned_by_me(name).

-- ---------------------------------------------------------------------------
-- Bucket: project-assets (private). Standard Supabase storage.buckets insert.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types, type)
values (
  'project-assets',
  'project-assets',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'model/stl', 'application/octet-stream'],
  'STANDARD'::storage.buckettype
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Helper: path first segment = project id owned by current user (or staff).
-- Standard types: text, uuid, boolean. SECURITY DEFINER, search_path = ''.
-- ---------------------------------------------------------------------------
create or replace function private.storage_project_owned_by_me(object_path text)
returns boolean
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  first_seg text;
  pid uuid;
begin
  first_seg := (string_to_array(trim(both '/' from object_path), '/'))[1];
  if first_seg is null or first_seg = '' then
    return false;
  end if;
  begin
    pid := first_seg::uuid;
  exception when others then
    return false;
  end;
  return exists (
    select 1 from public.projects p
    where p.id = pid
      and (p.owner_id = private.get_my_profile_id() or private.get_my_role() in ('admin', 'moderator'))
  );
end;
$$;

grant execute on function private.storage_project_owned_by_me(text) to authenticated;
revoke execute on function private.storage_project_owned_by_me(text) from anon;
