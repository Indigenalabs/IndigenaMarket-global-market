-- Pillar 9: Advocacy & Legal public marketplace catalog
-- Dedicated tables for public attorney, campaign, resource, and victory discovery.

create table if not exists public.advocacy_attorneys (
  id text primary key,
  actor_id text,
  name text not null,
  nation text,
  specialty text not null,
  category_slug text not null,
  region text,
  rate_label text,
  pro_bono boolean not null default false,
  verification_level text not null default 'verified',
  image text,
  bio text,
  languages jsonb not null default '[]'::jsonb,
  jurisdictions jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advocacy_campaigns (
  id text primary key,
  actor_id text,
  title text not null,
  campaign_type text not null,
  category_slug text not null,
  region text,
  raised_amount numeric(12,2) not null default 0,
  target_amount numeric(12,2) not null default 0,
  supporters_count integer not null default 0,
  urgent boolean not null default false,
  image text,
  summary text,
  status text not null default 'active',
  featured boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advocacy_resources (
  id text primary key,
  actor_id text,
  title text not null,
  resource_kind text not null,
  audience text,
  language text,
  category_slug text not null,
  image text,
  summary text,
  featured boolean not null default false,
  status text not null default 'active',
  download_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advocacy_victories (
  id text primary key,
  actor_id text,
  title text not null,
  impact text,
  year text,
  image text,
  summary text,
  featured boolean not null default false,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_advocacy_attorneys_category on public.advocacy_attorneys (category_slug, status, featured);
create index if not exists idx_advocacy_attorneys_specialty on public.advocacy_attorneys (specialty, status);
create index if not exists idx_advocacy_campaigns_category on public.advocacy_campaigns (category_slug, status, urgent);
create index if not exists idx_advocacy_campaigns_type on public.advocacy_campaigns (campaign_type, status);
create index if not exists idx_advocacy_resources_category on public.advocacy_resources (category_slug, status, resource_kind);
create index if not exists idx_advocacy_victories_status on public.advocacy_victories (status, featured, created_at desc);

alter table public.advocacy_attorneys enable row level security;
alter table public.advocacy_campaigns enable row level security;
alter table public.advocacy_resources enable row level security;
alter table public.advocacy_victories enable row level security;

drop policy if exists "public_read_advocacy_attorneys" on public.advocacy_attorneys;
create policy "public_read_advocacy_attorneys"
  on public.advocacy_attorneys for select
  using (status = 'published' or status = 'active');

drop policy if exists "public_read_advocacy_campaigns" on public.advocacy_campaigns;
create policy "public_read_advocacy_campaigns"
  on public.advocacy_campaigns for select
  using (status = 'published' or status = 'active');

drop policy if exists "public_read_advocacy_resources" on public.advocacy_resources;
create policy "public_read_advocacy_resources"
  on public.advocacy_resources for select
  using (status = 'published' or status = 'active');

drop policy if exists "public_read_advocacy_victories" on public.advocacy_victories;
create policy "public_read_advocacy_victories"
  on public.advocacy_victories for select
  using (status = 'published' or status = 'active');
