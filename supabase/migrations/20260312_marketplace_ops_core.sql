-- Remaining marketplace ops tables for internal /api routes

create table if not exists public.physical_item_reports (
  id text primary key,
  item_id text not null,
  reporter_actor_id text,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.freelance_service_reports (
  id text primary key,
  service_id text not null,
  reporter_actor_id text,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seva_donations (
  id text primary key,
  cause_id text not null,
  wallet_address text,
  amount numeric(12,2) not null,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.community_forums (
  id text primary key,
  title text not null,
  replies integer not null default 0,
  views integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.community_events (
  id text primary key,
  title text not null,
  starts_at timestamptz,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.community_stories (
  id text primary key,
  author_name text,
  author_avatar text,
  author_verified boolean not null default false,
  author_role text,
  content text,
  image text,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.community_mentors (
  id text primary key,
  name text not null,
  skill text,
  nation text,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_wallet_snapshots (
  id text primary key,
  wallet_address text not null unique,
  indi_balance numeric(20,6) not null default 0,
  xrp_balance numeric(20,6) not null default 0,
  usd_value numeric(20,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_transactions (
  id text primary key,
  wallet_address text not null,
  type text not null,
  item text,
  amount numeric(20,6) not null default 0,
  currency text not null default 'INDI',
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create index if not exists idx_physical_item_reports_status on public.physical_item_reports (status, created_at desc);
create index if not exists idx_freelance_service_reports_status on public.freelance_service_reports (status, created_at desc);
create index if not exists idx_seva_donations_cause on public.seva_donations (cause_id, created_at desc);
create index if not exists idx_finance_transactions_wallet on public.finance_transactions (wallet_address, created_at desc);

alter table if exists public.physical_item_reports enable row level security;
alter table if exists public.freelance_service_reports enable row level security;
alter table if exists public.seva_donations enable row level security;
alter table if exists public.community_forums enable row level security;
alter table if exists public.community_events enable row level security;
alter table if exists public.community_stories enable row level security;
alter table if exists public.community_mentors enable row level security;
alter table if exists public.finance_wallet_snapshots enable row level security;
alter table if exists public.finance_transactions enable row level security;
