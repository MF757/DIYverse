-- DIYverse: audit schema (standard PostgreSQL only)
-- Append-only logs. Immutable. Triggers only insert. No delete/update.

-- ---------------------------------------------------------------------------
-- Audit schema and log table (standard types: uuid, timestamptz, text, jsonb)
-- ---------------------------------------------------------------------------
create schema if not exists audit;

comment on schema audit is 'Append-only audit logs. Triggers only insert.';

create table audit.log (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  table_schema text not null,
  table_name text not null,
  operation text not null constraint audit_log_operation_check
    check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  row_id uuid,
  old_data jsonb,
  new_data jsonb,
  actor_id uuid,
  constraint audit_log_table_schema_check check (table_schema in ('public'))
);

comment on table audit.log is 'Immutable audit trail. Only triggers insert.';
comment on column audit.log.actor_id is 'auth.users.id when available.';

create index audit_log_occurred_at_idx on audit.log(occurred_at desc);
create index audit_log_table_idx on audit.log(table_schema, table_name);
create index audit_log_row_id_idx on audit.log(row_id) where row_id is not null;
create index audit_log_actor_id_idx on audit.log(actor_id) where actor_id is not null;

alter table audit.log enable row level security;
revoke all on audit.log from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Role changes log (standard types)
-- ---------------------------------------------------------------------------
create table audit.role_changes (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  previous_role public.app_role not null,
  new_role public.app_role not null,
  actor_id uuid not null
);

comment on table audit.role_changes is 'Immutable log of profile role changes.';

create index audit_role_changes_occurred_at_idx on audit.role_changes(occurred_at desc);
create index audit_role_changes_profile_id_idx on audit.role_changes(profile_id);
create index audit_role_changes_actor_id_idx on audit.role_changes(actor_id);

alter table audit.role_changes enable row level security;
revoke all on audit.role_changes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Trigger: append to audit.log (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
create or replace function audit.trigger_audit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_j jsonb;
  new_j jsonb;
  aid uuid;
begin
  aid := auth.uid();
  if tg_op = 'DELETE' then
    old_j := to_jsonb(old);
    insert into audit.log (table_schema, table_name, operation, row_id, old_data, actor_id)
    values (tg_table_schema, tg_table_name, 'DELETE', (old).id, old_j, aid);
    return old;
  elsif tg_op = 'UPDATE' then
    old_j := to_jsonb(old);
    new_j := to_jsonb(new);
    insert into audit.log (table_schema, table_name, operation, row_id, old_data, new_data, actor_id)
    values (tg_table_schema, tg_table_name, 'UPDATE', (new).id, old_j, new_j, aid);
    return new;
  elsif tg_op = 'INSERT' then
    new_j := to_jsonb(new);
    insert into audit.log (table_schema, table_name, operation, row_id, new_data, actor_id)
    values (tg_table_schema, tg_table_name, 'INSERT', (new).id, new_j, aid);
    return new;
  end if;
  return null;
end;
$$;

create or replace function audit.trigger_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role is distinct from new.role then
    insert into audit.role_changes (profile_id, previous_role, new_role, actor_id)
    values (new.id, old.role, new.role, auth.uid());
  end if;
  return new;
end;
$$;

create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function audit.trigger_audit_log();

create trigger profiles_role_change_audit
  after update on public.profiles
  for each row execute function audit.trigger_profile_role_change();

create trigger projects_audit
  after insert or update or delete on public.projects
  for each row execute function audit.trigger_audit_log();
