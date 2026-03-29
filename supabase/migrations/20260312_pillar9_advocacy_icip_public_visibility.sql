alter table if exists public.adv_icip_registry_entries
  add column if not exists public_listing_state text not null default 'private',
  add column if not exists public_title text,
  add column if not exists public_summary text,
  add column if not exists public_protocol_notice text,
  add column if not exists public_updated_at timestamptz;

update public.adv_icip_registry_entries
set public_listing_state = coalesce(nullif(public_listing_state, ''), 'private')
where public_listing_state is null or public_listing_state = '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'adv_icip_registry_entries_public_listing_state_check'
  ) then
    alter table public.adv_icip_registry_entries
      add constraint adv_icip_registry_entries_public_listing_state_check
      check (public_listing_state in ('private', 'public_summary'));
  end if;
end $$;
