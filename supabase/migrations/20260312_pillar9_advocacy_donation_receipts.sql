create table if not exists public.adv_donation_receipts (
  id text primary key,
  donation_id text not null,
  payment_intent_id text not null,
  campaign_id text not null,
  campaign_title text not null,
  amount numeric not null default 0,
  donor_name text not null,
  currency text not null default 'USD',
  payment_status text not null default 'succeeded',
  receipt_url text,
  actor_id text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists adv_donation_receipts_actor_idx
  on public.adv_donation_receipts (actor_id, created_at desc);

alter table public.adv_donation_receipts enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'adv_donation_receipts'
      and policyname = 'adv_donation_receipts_service_role_all'
  ) then
    create policy adv_donation_receipts_service_role_all
      on public.adv_donation_receipts
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;
