create table if not exists public.creator_account_subscriptions (
  id text primary key,
  actor_id text not null,
  wallet_address text,
  family text not null,
  plan_id text not null,
  billing_cadence text not null default 'monthly',
  payment_method text not null default 'card',
  status text not null default 'active',
  started_at timestamptz not null default timezone('utc', now()),
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists creator_account_subscriptions_actor_idx
  on public.creator_account_subscriptions (actor_id, family, status, created_at desc);

create index if not exists creator_account_subscriptions_wallet_idx
  on public.creator_account_subscriptions (wallet_address, family, status, created_at desc);

create index if not exists creator_account_subscriptions_plan_idx
  on public.creator_account_subscriptions (plan_id, status);
