-- DIYverse: avatars bucket (public read). Path: <profile_id>/avatar.<ext>. One avatar per profile.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types, type)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'STANDARD'::storage.buckettype
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Helper: path first segment = profile id owned by current user.
create or replace function private.storage_avatar_owned_by_me(object_path text)
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
  return pid = private.get_my_profile_id();
end;
$$;

grant execute on function private.storage_avatar_owned_by_me(text) to authenticated;
revoke execute on function private.storage_avatar_owned_by_me(text) from anon;

-- INSERT: authenticated can upload to their own profile path.
create policy "avatars_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and private.storage_avatar_owned_by_me(name)
);

-- UPDATE: overwrite own avatar.
create policy "avatars_update_own"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and private.storage_avatar_owned_by_me(name))
with check (bucket_id = 'avatars' and private.storage_avatar_owned_by_me(name));

-- SELECT: public read (bucket is public).
create policy "avatars_select_public"
on storage.objects for select to public
using (bucket_id = 'avatars');
