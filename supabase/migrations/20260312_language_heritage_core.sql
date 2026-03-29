-- Language & Heritage pillar transactional tables

create table if not exists public.language_heritage_access_requests (
  request_id text primary key,
  listing_id text not null,
  wallet_address text,
  actor_id text,
  status text not null default 'pending',
  note text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.language_heritage_receipts (
  receipt_id text primary key,
  listing_id text not null,
  actor_id text,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists public.language_heritage_events (
  id text primary key,
  listing_id text,
  event text not null,
  actor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.language_heritage_sacred_requests (
  id text primary key,
  requester_name text not null,
  affiliation text,
  listing_id text not null,
  purpose text,
  justification text,
  acknowledged_protocols boolean not null default false,
  actor_id text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_lh_access_requests_actor on public.language_heritage_access_requests (actor_id, created_at desc);
create index if not exists idx_lh_receipts_actor on public.language_heritage_receipts (actor_id, created_at desc);
create index if not exists idx_lh_events_created on public.language_heritage_events (created_at desc);
create index if not exists idx_lh_sacred_requests_created on public.language_heritage_sacred_requests (created_at desc);

alter table if exists public.language_heritage_access_requests enable row level security;
alter table if exists public.language_heritage_receipts enable row level security;
alter table if exists public.language_heritage_events enable row level security;
alter table if exists public.language_heritage_sacred_requests enable row level security;
