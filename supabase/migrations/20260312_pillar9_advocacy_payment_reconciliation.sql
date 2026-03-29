alter table if exists public.adv_donations
  add column if not exists payment_state text not null default 'intent_created',
  add column if not exists processor_event_id text,
  add column if not exists processor_failure_reason text,
  add column if not exists reconciled_at timestamptz;

create index if not exists adv_donations_payment_state_idx
  on public.adv_donations (payment_state, updated_at desc);
