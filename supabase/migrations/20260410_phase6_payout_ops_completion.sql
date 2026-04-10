alter table if exists public.finance_instant_payout_requests
  add column if not exists profile_slug text,
  add column if not exists destination_id text,
  add column if not exists destination_label text,
  add column if not exists destination_type text,
  add column if not exists destination_last4 text,
  add column if not exists destination_status text,
  add column if not exists risk_level text,
  add column if not exists review_reason text,
  add column if not exists reserve_hold_amount numeric(12,2) not null default 0,
  add column if not exists note text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.finance_instant_payout_requests
set
  profile_slug = coalesce(profile_slug, ''),
  destination_type = coalesce(destination_type, 'manual_review'),
  destination_status = coalesce(destination_status, 'draft'),
  risk_level = coalesce(risk_level, 'low'),
  reserve_hold_amount = coalesce(reserve_hold_amount, 0),
  metadata = coalesce(metadata, '{}'::jsonb),
  updated_at = coalesce(updated_at, created_at, timezone('utc', now()))
where true;

