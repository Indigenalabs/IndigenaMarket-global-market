-- Indigena Global Market: app-wide Supabase baseline for pillars 1-10
-- This schema is intentionally normalized-light for rapid feature delivery.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique,
  user_uid text unique,
  display_name text,
  email text,
  role text not null default 'user',
  verification_level text not null default 'unverified',
  nation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid references public.user_profiles(id) on delete cascade,
  wallet_address text not null,
  chain text not null default 'xrpl',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_profile_id, wallet_address)
);

create table if not exists public.premium_placements (
  id uuid primary key default gen_random_uuid(),
  pillar text not null,
  placement_key text not null,
  advertiser_profile_id uuid references public.user_profiles(id) on delete set null,
  title text not null,
  media_url text,
  cta_label text,
  cta_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  price_amount numeric(12,2),
  currency text default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (pillar, placement_key, starts_at)
);

create table if not exists public.marketplace_events (
  id uuid primary key default gen_random_uuid(),
  pillar text not null,
  entity_type text not null,
  entity_id text not null,
  event_name text not null,
  actor_id text,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.digital_art_listings (
  id text primary key,
  creator_actor_id text,
  title text not null,
  category text not null,
  price numeric(12,2),
  currency text default 'INDI',
  sale_type text default 'fixed',
  verified boolean not null default false,
  rights_flags jsonb not null default '{}'::jsonb,
  media jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.physical_item_listings (
  id text primary key,
  maker_actor_id text,
  title text not null,
  category text not null,
  price numeric(12,2),
  currency text default 'USD',
  stock integer default 0,
  verified boolean not null default false,
  shipping_profile jsonb not null default '{}'::jsonb,
  media jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_listings (
  id text primary key,
  instructor_actor_id text,
  title text not null,
  category text not null,
  price numeric(12,2),
  currency text default 'USD',
  level text,
  duration_minutes integer,
  published boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.freelancing_services (
  id text primary key,
  freelancer_actor_id text,
  title text not null,
  category text not null,
  starting_price numeric(12,2),
  currency text default 'USD',
  turnaround_days integer,
  verified boolean not null default false,
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seva_projects (
  id text primary key,
  organizer_actor_id text,
  title text not null,
  category text,
  target_amount numeric(12,2),
  raised_amount numeric(12,2) not null default 0,
  currency text default 'USD',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tourism_experiences (
  id text primary key,
  operator_actor_id text,
  title text not null,
  kind text not null,
  nation text,
  region text,
  price_from numeric(12,2),
  currency text default 'USD',
  verification_tier text default 'Bronze',
  elder_approved boolean not null default false,
  virtual boolean not null default false,
  protocols jsonb not null default '[]'::jsonb,
  media jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.language_heritage_listings (
  id text primary key,
  contributor_actor_id text,
  title text not null,
  kind text not null,
  language_name text,
  community text,
  access_tier text not null default 'public',
  elder_verified boolean not null default false,
  price numeric(12,2),
  currency text default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.land_food_listings (
  id text primary key,
  producer_actor_id text,
  title text not null,
  category text not null,
  listing_type text not null default 'product',
  price numeric(12,2),
  currency text default 'USD',
  quantity_available numeric(12,2),
  unit text,
  traceability jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advocacy_entities (
  id text primary key,
  entity_type text not null,
  actor_id text,
  title text not null,
  category text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_marketplace_events_pillar_created_at on public.marketplace_events (pillar, created_at desc);
create index if not exists idx_marketplace_events_entity on public.marketplace_events (entity_type, entity_id, created_at desc);
create index if not exists idx_premium_placements_pillar_active on public.premium_placements (pillar, active, starts_at, ends_at);
create index if not exists idx_digital_art_category on public.digital_art_listings (category, status);
create index if not exists idx_physical_item_category on public.physical_item_listings (category, status);
create index if not exists idx_course_category on public.course_listings (category, published);
create index if not exists idx_freelancing_category on public.freelancing_services (category, status);
create index if not exists idx_tourism_kind on public.tourism_experiences (kind, status);
create index if not exists idx_language_kind on public.language_heritage_listings (kind, access_tier);
create index if not exists idx_land_food_category on public.land_food_listings (category, status);
