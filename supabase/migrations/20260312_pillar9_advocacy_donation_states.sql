alter table public.adv_donations
  add column if not exists payment_intent_id text,
  add column if not exists receipt_id text,
  add column if not exists currency text not null default 'USD',
  add column if not exists status text not null default 'succeeded',
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create index if not exists idx_adv_donations_status
  on public.adv_donations (status, created_at desc);

alter table public.adv_donation_receipts
  add column if not exists updated_at timestamptz not null default timezone('utc', now());
