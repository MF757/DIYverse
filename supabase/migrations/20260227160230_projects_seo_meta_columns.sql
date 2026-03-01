-- SEO fields set by system (e.g. n8n), not by authors. Plain text, nullable.
alter table public.projects
  add column if not exists meta_description text,
  add column if not exists seo_title text;

comment on column public.projects.meta_description is 'Meta description for search/social; max ~160 chars. Set by automation (n8n), not user-editable.';
comment on column public.projects.seo_title is 'SEO/page title override for search/social. Set by automation (n8n), not user-editable.';

-- View: add SEO columns at end so existing column order is unchanged
create or replace view public.projects_public_with_owner
with (security_invoker = on)
as
select
  p.id,
  p.owner_id,
  p.title,
  p.slug,
  p.description,
  p.cover_url,
  p.is_public,
  p.created_at,
  p.updated_at,
  pr.display_name as owner_display_name,
  pr.avatar_url as owner_avatar_url,
  p.meta_description,
  p.seo_title
from public.projects p
join public.profiles pr on pr.id = p.owner_id
where p.is_public = true;

comment on view public.projects_public_with_owner is 'Public projects with owner display. RLS on base tables applies. Anon read is enabled in migration 20250607000001_anon_public_projects.';

grant select on public.projects_public_with_owner to authenticated;
grant select on public.projects_public_with_owner to anon;
