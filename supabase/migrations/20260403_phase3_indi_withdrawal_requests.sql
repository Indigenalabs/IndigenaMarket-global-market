create table if not exists public.indi_withdrawal_requests (
  id text primary key,
  actor_id text not null,
  profile_slug text not null default '',
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  wallet_account_id uuid references public.wallet_accounts(id) on delete set null,
  amount numeric(12,2) not null default 0,
  fee_amount numeric(12,2) not null default 0,
  net_amount numeric(12,2) not null default 0,
  currency text not null default 'INDI',
  destination_type text not null default 'manual_review',
  destination_label text not null default '',
  destination_details jsonb not null default '{}'::jsonb,
  status text not null default 'requested',
  note text not null default '',
  ledger_entry_id text not null default '',
  reference_id text not null default '',
  requested_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create index if not exists idx_indi_withdrawal_requests_actor_id
  on public.indi_withdrawal_requests(actor_id);

create index if not exists idx_indi_withdrawal_requests_profile_slug
  on public.indi_withdrawal_requests(profile_slug);

create index if not exists idx_indi_withdrawal_requests_status
  on public.indi_withdrawal_requests(status);

create unique index if not exists idx_indi_withdrawal_requests_reference_id
  on public.indi_withdrawal_requests(reference_id)
  where reference_id <> '';
