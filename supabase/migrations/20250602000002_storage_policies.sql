-- DIYverse: Storage RLS policies for project-assets bucket.
-- Allow project owners to upload; allow public read (bucket is public).

-- INSERT: Authenticated users can upload to paths they own (project in path).
CREATE POLICY "project_assets_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-assets'
  AND private.storage_project_owned_by_me(name)
);

-- UPDATE: Required for upsert; allow project owners to overwrite their files.
CREATE POLICY "project_assets_update_own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'project-assets' AND private.storage_project_owned_by_me(name))
WITH CHECK (bucket_id = 'project-assets' AND private.storage_project_owned_by_me(name));

-- SELECT: Allow read for public project assets (anyone can view).
CREATE POLICY "project_assets_select_public"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'project-assets');
