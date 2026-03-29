create table if not exists public.creator_finance_ledger (
  id text primary key,
  actor_id text not null,
  profile_slug text not null,
  pillar text not null,
  entry_type text not null,
  status text not null,
  item text not null,
  gross_amount numeric(12,2) not null default 0,
  platform_fee_amount numeric(12,2) not null default 0,
  processor_fee_amount numeric(12,2) not null default 0,
  escrow_fee_amount numeric(12,2) not null default 0,
  refund_amount numeric(12,2) not null default 0,
  dispute_amount numeric(12,2) not null default 0,
  creator_net_amount numeric(12,2) not null default 0,
  dispute_reason text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_creator_finance_ledger_profile on public.creator_finance_ledger (profile_slug, created_at desc);
create index if not exists idx_creator_finance_ledger_actor on public.creator_finance_ledger (actor_id, created_at desc);

create table if not exists public.creator_finance_cases (
  id text primary key,
  actor_id text not null,
  profile_slug text not null,
  pillar text not null,
  case_type text not null,
  status text not null,
  item text not null,
  amount numeric(12,2) not null default 0,
  reason text not null,
  details text not null default '',
  ledger_entry_id text not null default '',
  resolution_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creator_finance_cases_profile on public.creator_finance_cases (profile_slug, created_at desc);
create index if not exists idx_creator_finance_cases_actor on public.creator_finance_cases (actor_id, created_at desc);
create index if not exists idx_creator_finance_cases_status on public.creator_finance_cases (status, updated_at desc);

create table if not exists public.creator_finance_case_events (
  id text primary key,
  case_id text not null references public.creator_finance_cases(id) on delete cascade,
  actor_id text not null,
  event_type text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_creator_finance_case_events_case on public.creator_finance_case_events (case_id, created_at desc);
