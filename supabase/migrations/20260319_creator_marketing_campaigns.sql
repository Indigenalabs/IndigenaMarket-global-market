create table if not exists public.creator_marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  owner_actor_id text not null,
  offering_id text,
  offer_title text not null,
  scope text not null,
  placement_id text not null,
  placement_title text not null,
  placement_key text not null,
  price_amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  billing_period text not null default 'week',
  launch_week text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'scheduled',
  creative jsonb not null default '{}'::jsonb,
  result_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creator_marketing_campaigns_profile on public.creator_marketing_campaigns (profile_slug, created_at desc);
create index if not exists idx_creator_marketing_campaigns_scope on public.creator_marketing_campaigns (scope, status, starts_at, ends_at);
