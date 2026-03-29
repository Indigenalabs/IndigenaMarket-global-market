create table if not exists public.logistics_shipping_quotes (
  id text primary key,
  origin text not null,
  destination text not null,
  weight_kg numeric not null default 0,
  carrier text not null,
  base_rate numeric not null default 0,
  markup_amount numeric not null default 0,
  insurance_premium numeric not null default 0,
  total numeric not null default 0,
  currency text not null default 'USD',
  estimated_days text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.logistics_insurance_claims (
  id text primary key,
  order_id text not null,
  actor_id text not null default '',
  claimant_name text not null,
  amount numeric not null default 0,
  reason text not null,
  status text not null default 'submitted',
  evidence_url text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.logistics_nfc_tags (
  id text primary key,
  actor_id text not null default '',
  listing_id text not null,
  encoded_url text not null,
  unit_fee numeric not null default 5,
  status text not null default 'draft',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.logistics_fulfillment_orders (
  id text primary key,
  actor_id text not null default '',
  order_id text not null,
  warehouse text not null,
  storage_fee numeric not null default 0,
  handling_fee numeric not null default 0,
  status text not null default 'received',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.logistics_inventory_subscriptions (
  id text primary key,
  actor_id text not null default '',
  monthly_fee numeric not null default 10,
  catalog_size integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.finance_instant_payout_requests (
  id text primary key,
  actor_id text not null default '',
  wallet_address text not null,
  amount numeric not null default 0,
  fee_amount numeric not null default 0,
  net_amount numeric not null default 0,
  status text not null default 'requested',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.finance_bnpl_applications (
  id text primary key,
  actor_id text not null default '',
  order_id text not null,
  amount numeric not null default 0,
  partner text not null default '',
  fee_amount numeric not null default 0,
  status text not null default 'submitted',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.finance_tax_report_purchases (
  id text primary key,
  actor_id text not null default '',
  tax_year integer not null,
  fee_amount numeric not null default 25,
  status text not null default 'purchased',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seva_impact_project_admin (
  id text primary key,
  request_id text not null,
  project_id text not null,
  service_fee_rate numeric not null default 0.10,
  service_fee_amount numeric not null default 0,
  funds_managed numeric not null default 0,
  donor_count integer not null default 0,
  donor_retention_rate numeric not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seva_corporate_matches (
  id text primary key,
  company_name text not null,
  project_id text not null,
  committed_amount numeric not null default 0,
  matched_amount numeric not null default 0,
  admin_fee_rate numeric not null default 0.05,
  admin_fee_amount numeric not null default 0,
  status text not null default 'proposed',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seva_impact_reports (
  id text primary key,
  client_name text not null,
  project_id text not null,
  contract_amount numeric not null default 5000,
  status text not null default 'requested',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seva_donor_tools (
  id text primary key,
  actor_id text not null default '',
  project_id text not null,
  tool_type text not null,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);
