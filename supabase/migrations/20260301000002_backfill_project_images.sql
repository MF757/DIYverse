-- Backfill project_images from existing projects that have imageUrls in description metadata.
-- Only runs for projects with no project_images rows. Safe to run multiple times.

insert into public.project_images (project_id, sort_order, storage_path)
select p.id, (t.ord - 1)::smallint, trim(both from t.elem)
from public.projects p
cross join lateral (
  select (value)::text as elem, ord
  from jsonb_array_elements_text(
    coalesce(
      (regexp_match(p.description, '__DIYVERSE_META_7f3a9b2c__\n([^\n]+)'))[1]::jsonb -> 'imageUrls',
      '[]'::jsonb
    )
  ) with ordinality as t(value, ord)
) t
where p.description like '%__DIYVERSE_META_7f3a9b2c__%'
  and not exists (select 1 from public.project_images pi where pi.project_id = p.id)
  and trim(both from t.elem) <> '';
