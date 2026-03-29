create table if not exists public.materials_tools_suppliers (
  id text primary key,
  name text not null,
  nation text,
  region text,
  verified boolean default false,
  verification_tier text,
  avatar text,
  cover text,
  specialties text[] default '{}',
  bio text,
  response_time text,
  fulfillment_score integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.materials_tools_listings (
  id text primary key,
  supplier_id text references public.materials_tools_suppliers(id) on delete set null,
  title text not null,
  supplier_name text,
  nation text,
  category text,
  kind text,
  price numeric,
  currency text default 'USD',
  image text,
  stock_label text,
  lead_time text,
  verified boolean default false,
  verification_tier text,
  summary text,
  traceability jsonb default '{}'::jsonb,
  certifications text[] default '{}',
  moq_label text,
  created_at timestamptz default now()
);

create table if not exists public.materials_tools_rentals (
  id text primary key,
  title text not null,
  hub_name text,
  nation text,
  location text,
  daily_rate_label text,
  image text,
  summary text,
  availability text,
  equipment_type text,
  created_at timestamptz default now()
);

create table if not exists public.materials_tools_services (
  id text primary key,
  title text not null,
  provider text,
  nation text,
  rate_label text,
  image text,
  summary text,
  service_type text,
  created_at timestamptz default now()
);

create table if not exists public.materials_tools_coop_orders (
  id text primary key,
  title text not null,
  summary text,
  target_units integer default 0,
  committed_units integer default 0,
  close_date date,
  image text,
  preferred_category text,
  created_at timestamptz default now()
);

create table if not exists public.materials_tools_actions (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  actor_id text,
  wallet_address text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.materials_tools_suppliers enable row level security;
alter table public.materials_tools_listings enable row level security;
alter table public.materials_tools_rentals enable row level security;
alter table public.materials_tools_services enable row level security;
alter table public.materials_tools_coop_orders enable row level security;
alter table public.materials_tools_actions enable row level security;

do $$ begin
  create policy "materials_tools_suppliers_public_read" on public.materials_tools_suppliers for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "materials_tools_listings_public_read" on public.materials_tools_listings for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "materials_tools_rentals_public_read" on public.materials_tools_rentals for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "materials_tools_services_public_read" on public.materials_tools_services for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "materials_tools_coop_orders_public_read" on public.materials_tools_coop_orders for select using (true);
exception when duplicate_object then null; end $$;
