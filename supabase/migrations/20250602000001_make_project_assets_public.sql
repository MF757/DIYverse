-- DIYverse: Make project-assets bucket public for direct image/file access.
-- Public buckets allow getPublicUrl to work without signed URLs or RLS policies.
-- Standard approach for user-generated content intended to be shared.

UPDATE storage.buckets
SET public = true
WHERE id = 'project-assets';
