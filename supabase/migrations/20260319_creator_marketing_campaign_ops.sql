alter table if exists public.creator_marketing_campaigns
  add column if not exists payment_status text not null default 'requires-payment',
  add column if not exists payment_reference text,
  add column if not exists checkout_reference text,
  add column if not exists creative_status text not null default 'draft',
  add column if not exists review_notes text,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by text,
  add column if not exists paused_at timestamptz,
  add column if not exists paused_by text,
  add column if not exists resumed_at timestamptz,
  add column if not exists last_action_at timestamptz;

create index if not exists creator_marketing_campaigns_review_idx
  on public.creator_marketing_campaigns (status, creative_status, payment_status, created_at desc);
