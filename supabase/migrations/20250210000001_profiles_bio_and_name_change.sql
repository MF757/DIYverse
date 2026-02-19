-- DIYverse: profile bio (max 500 chars) and display name change tracking (max 1 per month).

alter table public.profiles
  add column if not exists bio text,
  add column if not exists display_name_changed_at timestamptz;

alter table public.profiles
  add constraint profiles_bio_length check (bio is null or char_length(bio) <= 500);

comment on column public.profiles.bio is 'Short profile description; max 500 characters.';
comment on column public.profiles.display_name_changed_at is 'When display_name was last changed; used to enforce at most one change per month.';

-- Set display_name_changed_at when display_name is updated (so first change is allowed).
create or replace function public.set_display_name_changed_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.display_name is distinct from new.display_name then
    -- Enforce at most one change per month (except first set).
    if old.display_name_changed_at is not null
       and old.display_name_changed_at > now() - interval '1 month' then
      raise exception 'Display name can only be changed once per month.'
        using errcode = 'P0001';
    end if;
    new.display_name_changed_at = now();
  else
    new.display_name_changed_at = old.display_name_changed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_display_name_change on public.profiles;
create trigger profiles_display_name_change
  before update on public.profiles
  for each row execute function public.set_display_name_changed_at();
