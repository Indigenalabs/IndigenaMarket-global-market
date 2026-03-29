create table if not exists public.physical_item_orders (
  id text primary key,
  actor_id text,
  wallet_address text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  currency text not null default 'USD',
  payment_intent_id text,
  payment_status text not null default 'intent-created',
  fulfillment_status text not null default 'awaiting-payment',
  amount_paid numeric(12,2) not null default 0,
  payment_breakdown jsonb not null default '{}'::jsonb,
  payment_reference text,
  receipt_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists physical_item_orders_actor_idx on public.physical_item_orders (actor_id);
create index if not exists physical_item_orders_wallet_idx on public.physical_item_orders (wallet_address);

create table if not exists public.freelance_escrow_orders (
  id text primary key,
  service_id text not null,
  service_title text not null default '',
  client_actor_id text,
  wallet_address text,
  freelancer_actor_id text,
  freelancer_name text not null default '',
  status text not null default 'in_escrow',
  escrow_status text not null default 'funded',
  total_amount numeric(12,2) not null default 0,
  amount_released numeric(12,2) not null default 0,
  currency text not null default 'USD',
  project_details text not null default '',
  deadline text not null default '',
  milestones jsonb not null default '[]'::jsonb,
  payment_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists freelance_escrow_orders_client_idx on public.freelance_escrow_orders (client_actor_id);
create index if not exists freelance_escrow_orders_wallet_idx on public.freelance_escrow_orders (wallet_address);
