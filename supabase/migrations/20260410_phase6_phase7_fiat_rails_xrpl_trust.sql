create table if not exists public.fiat_payout_destinations (
  id text primary key,
  actor_id text not null,
  profile_slug text not null default '',
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  wallet_account_id uuid references public.wallet_accounts(id) on delete set null,
  label text not null default '',
  destination_type text not null default 'manual_review',
  account_name text not null default '',
  institution_name text not null default '',
  last4 text not null default '',
  currency text not null default 'USD',
  country_code text not null default 'AU',
  is_default boolean not null default false,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_fiat_payout_destinations_actor_id
  on public.fiat_payout_destinations(actor_id);

create index if not exists idx_fiat_payout_destinations_profile_slug
  on public.fiat_payout_destinations(profile_slug);

create index if not exists idx_fiat_payout_destinations_status
  on public.fiat_payout_destinations(status);

create table if not exists public.xrpl_trust_records (
  id text primary key,
  actor_id text not null,
  profile_slug text not null default '',
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  wallet_account_id uuid references public.wallet_accounts(id) on delete set null,
  asset_type text not null default 'digital_art',
  asset_id text not null default '',
  asset_title text not null default '',
  trust_type text not null default 'provenance',
  status text not null default 'draft',
  xrpl_transaction_hash text not null default '',
  xrpl_token_id text not null default '',
  xrpl_ledger_index text not null default '',
  anchor_uri text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_xrpl_trust_records_actor_id
  on public.xrpl_trust_records(actor_id, created_at desc);

create index if not exists idx_xrpl_trust_records_profile_slug
  on public.xrpl_trust_records(profile_slug, created_at desc);

create index if not exists idx_xrpl_trust_records_asset
  on public.xrpl_trust_records(asset_type, asset_id);