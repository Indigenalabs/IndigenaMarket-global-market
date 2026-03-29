create table if not exists public.creator_verification_purchases (
  id text primary key,
  actor_id text not null,
  wallet_address text,
  profile_slug text not null,
  product_id text not null,
  product_name text not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists creator_verification_purchases_actor_idx
  on public.creator_verification_purchases (actor_id, created_at desc);

create index if not exists creator_verification_purchases_slug_idx
  on public.creator_verification_purchases (profile_slug, created_at desc);

create index if not exists creator_verification_purchases_checkout_idx
  on public.creator_verification_purchases (stripe_checkout_session_id);
