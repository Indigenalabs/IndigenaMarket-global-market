create table if not exists public.insight_products (
  id text primary key,
  product_type text not null,
  buyer_name text not null,
  buyer_email text not null,
  region text not null default '',
  pillar text not null default '',
  price_amount numeric not null default 0,
  status text not null default 'requested',
  contract_term text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.insight_api_subscriptions (
  id text primary key,
  buyer_name text not null,
  buyer_email text not null,
  api_key_label text not null,
  monthly_price numeric not null default 1000,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ethical_advertising_orders (
  id text primary key,
  ad_type text not null,
  partner_name text not null,
  partner_email text not null,
  placement_scope text not null,
  creative_title text not null,
  price_amount numeric not null default 0,
  status text not null default 'submitted',
  review_notes text not null default '',
  issue_label text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.physical_venture_orders (
  id text primary key,
  venture_type text not null,
  title text not null,
  buyer_name text not null,
  buyer_email text not null,
  quantity integer not null default 1,
  revenue_amount numeric not null default 0,
  markup_rate numeric not null default 0,
  status text not null default 'ordered',
  created_at timestamptz not null default timezone('utc', now())
);
