alter table if exists public.revenue_split_rules
  add column if not exists settlement_currency text not null default 'INDI',
  add column if not exists holdback_percentage numeric(5,2) not null default 0,
  add column if not exists minimum_payout_amount numeric(12,2) not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table if exists public.split_distributions
  add column if not exists net_amount numeric(12,2) not null default 0,
  add column if not exists distribution_status text not null default 'posted',
  add column if not exists source_reference text not null default '',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table if exists public.treasury_ledger_entries
  add column if not exists source_reference text not null default '',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_split_distributions_source_reference
  on public.split_distributions(source_reference)
  where source_reference <> '';

create index if not exists idx_treasury_ledger_entries_source_reference
  on public.treasury_ledger_entries(source_reference)
  where source_reference <> '';
