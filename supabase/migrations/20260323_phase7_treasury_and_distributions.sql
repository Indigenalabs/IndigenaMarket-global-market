create table if not exists public.community_treasuries (
  id text primary key,
  account_id text not null references public.platform_accounts(id) on delete cascade,
  account_slug text not null,
  label text not null,
  restricted_balance numeric(12,2) not null default 0,
  unrestricted_balance numeric(12,2) not null default 0,
  pending_disbursement_amount numeric(12,2) not null default 0,
  next_disbursement_date timestamptz,
  reporting_note text not null default ''
);

create table if not exists public.treasury_ledger_entries (
  id text primary key,
  account_id text not null references public.platform_accounts(id) on delete cascade,
  type text not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  counterparty text not null default '',
  note text not null default '',
  status text not null default 'scheduled',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.split_distributions (
  id text primary key,
  split_rule_id text not null references public.revenue_split_rules(id) on delete cascade,
  source_type text not null,
  source_id text not null,
  gross_amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  distributions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.champion_sponsorship_disbursements (
  id text primary key,
  sponsorship_id text not null references public.digital_champion_sponsorships(id) on delete cascade,
  champion_id text not null,
  target_account_id text not null references public.platform_accounts(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  status text not null default 'scheduled',
  scheduled_for timestamptz,
  paid_out_at timestamptz,
  note text not null default ''
);

create index if not exists idx_community_treasuries_account_id on public.community_treasuries(account_id);
create index if not exists idx_treasury_ledger_entries_account_id on public.treasury_ledger_entries(account_id);
create index if not exists idx_split_distributions_rule_id on public.split_distributions(split_rule_id);
create index if not exists idx_champion_disbursements_target_account on public.champion_sponsorship_disbursements(target_account_id);
