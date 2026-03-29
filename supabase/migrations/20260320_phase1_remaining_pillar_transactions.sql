create table if not exists public.digital_art_orders (
  id text primary key,
  listing_id text not null,
  buyer_actor_id text,
  buyer_wallet_address text,
  creator_actor_id text,
  title text not null default '',
  amount_paid numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'captured',
  receipt_id text,
  payment_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists digital_art_orders_buyer_idx on public.digital_art_orders (buyer_actor_id);
create index if not exists digital_art_orders_wallet_idx on public.digital_art_orders (buyer_wallet_address);

alter table if exists public.language_heritage_receipts
  add column if not exists payment_breakdown jsonb not null default '{}'::jsonb;

create table if not exists public.land_food_orders (
  id text primary key,
  listing_id text not null,
  actor_id text,
  wallet_address text,
  title text not null default '',
  quantity integer not null default 1,
  amount_paid numeric(12,2) not null default 0,
  currency text not null default 'USD',
  payment_status text not null default 'captured',
  fulfillment_status text not null default 'queued',
  receipt_id text,
  payment_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists land_food_orders_actor_idx on public.land_food_orders (actor_id);
create index if not exists land_food_orders_wallet_idx on public.land_food_orders (wallet_address);
