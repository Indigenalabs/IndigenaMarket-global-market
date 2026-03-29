create table if not exists public.adv_icip_registry_activity (
  id text primary key,
  entry_id text not null references public.adv_icip_registry_entries(id) on delete cascade,
  activity_type text not null,
  actor_id text not null,
  actor_label text not null,
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

create index if not exists adv_icip_registry_activity_entry_id_created_at_idx
  on public.adv_icip_registry_activity(entry_id, created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'adv_icip_registry_activity_type_check'
  ) then
    alter table public.adv_icip_registry_activity
      add constraint adv_icip_registry_activity_type_check
      check (activity_type in ('claim_submitted', 'review_status_changed', 'public_visibility_updated', 'comment'));
  end if;
end $$;
