-- DIYverse: views for complex reads (standard PostgreSQL view)
-- Single query for public projects with owner display. RLS on base tables applies.

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
  pr.avatar_url as owner_avatar_url
from public.projects p
join public.profiles pr on pr.id = p.owner_id
where p.is_public = true;

comment on view public.projects_public_with_owner is 'Public projects with owner display. RLS on base tables applies. Anon read is enabled in migration 20250607000001_anon_public_projects.';

grant select on public.projects_public_with_owner to authenticated;
