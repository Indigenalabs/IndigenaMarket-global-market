create table if not exists public.indi_balance_accounts (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null,
  profile_slug text not null default '',
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  wallet_account_id uuid references public.wallet_accounts(id) on delete set null,
  currency text not null default 'INDI',
  available_balance numeric(14,2) not null default 0,
  pending_balance numeric(14,2) not null default 0,
  lifetime_credit_amount numeric(14,2) not null default 0,
  lifetime_debit_amount numeric(14,2) not null default 0,
  estimated_fiat_value_usd numeric(14,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (actor_id)
);

create index if not exists idx_indi_balance_accounts_profile on public.indi_balance_accounts (profile_slug);
create index if not exists idx_indi_balance_accounts_wallet on public.indi_balance_accounts (wallet_account_id);

create table if not exists public.indi_ledger_entries (
  id text primary key,
  actor_id text not null,
  profile_slug text not null default '',
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  wallet_account_id uuid references public.wallet_accounts(id) on delete set null,
  entry_type text not null,
  direction text not null,
  status text not null default 'completed',
  amount numeric(14,2) not null default 0,
  reference_type text not null default '',
  reference_id text not null default '',
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  effective_at timestamptz not null default now()
);

create index if not exists idx_indi_ledger_entries_actor on public.indi_ledger_entries (actor_id, created_at desc);
create index if not exists idx_indi_ledger_entries_profile on public.indi_ledger_entries (profile_slug, created_at desc);
create index if not exists idx_indi_ledger_entries_reference on public.indi_ledger_entries (reference_type, reference_id);
