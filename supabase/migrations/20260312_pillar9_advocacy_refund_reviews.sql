alter table if exists public.adv_donations
  add column if not exists refund_reason text,
  add column if not exists refund_requested_at timestamptz,
  add column if not exists refund_reviewed_at timestamptz,
  add column if not exists refund_reviewed_by text,
  add column if not exists refund_review_notes text;

alter table if exists public.adv_donation_receipts
  add column if not exists refund_review_status text not null default 'none';

create index if not exists adv_donations_status_idx
  on public.adv_donations (status, updated_at desc);

create index if not exists adv_donation_receipts_refund_review_status_idx
  on public.adv_donation_receipts (refund_review_status, updated_at desc);
