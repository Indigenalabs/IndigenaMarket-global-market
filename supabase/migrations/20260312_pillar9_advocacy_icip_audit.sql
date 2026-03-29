create table if not exists public.adv_icip_registry_entries (
  id text primary key,
  registry_number text not null unique,
  actor_id text not null,
  claim_title text not null,
  community_name text not null,
  claimant_name text not null,
  contact_email text not null,
  asset_type text not null default 'other',
  rights_scope text not null default 'ownership',
  protocol_visibility text not null default 'restricted',
  protocol_summary text not null,
  licensing_terms text,
  infringement_summary text,
  status text not null default 'submitted',
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.adv_icip_registry_evidence (
  id text primary key,
  entry_id text not null references public.adv_icip_registry_entries(id) on delete cascade,
  actor_id text not null,
  label text not null,
  evidence_type text not null default 'document',
  file_url text,
  content_hash text,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists adv_icip_registry_entries_actor_idx
  on public.adv_icip_registry_entries (actor_id, updated_at desc);

create index if not exists adv_icip_registry_entries_status_idx
  on public.adv_icip_registry_entries (status, updated_at desc);

create index if not exists adv_icip_registry_evidence_entry_idx
  on public.adv_icip_registry_evidence (entry_id, created_at desc);

create unique index if not exists adv_donations_processor_event_uidx
  on public.adv_donations (processor_event_id)
  where processor_event_id is not null;

alter table public.adv_icip_registry_entries enable row level security;
alter table public.adv_icip_registry_evidence enable row level security;

drop policy if exists "adv_icip_registry_entries_service_role_all" on public.adv_icip_registry_entries;
create policy "adv_icip_registry_entries_service_role_all"
  on public.adv_icip_registry_entries
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "adv_icip_registry_evidence_service_role_all" on public.adv_icip_registry_evidence;
create policy "adv_icip_registry_evidence_service_role_all"
  on public.adv_icip_registry_evidence
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
