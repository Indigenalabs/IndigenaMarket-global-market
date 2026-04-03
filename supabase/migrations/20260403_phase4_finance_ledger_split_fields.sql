alter table if exists public.creator_finance_ledger
  add column if not exists source_type text not null default '',
  add column if not exists source_id text not null default '',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_creator_finance_ledger_source_id
  on public.creator_finance_ledger(source_id)
  where source_id <> '';
