create table if not exists public.creator_profile_campaign_insights (
  campaign_id text primary key references public.creator_marketing_campaigns(id) on delete cascade,
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  placement_label text not null,
  status text not null default 'draft',
  impressions integer not null default 0,
  clicks integer not null default 0,
  ctr_label text not null default '0%',
  spend_label text not null default '$0',
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_profile_analytics_events (
  id text primary key,
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  offering_id text,
  bundle_id text,
  event_name text not null,
  page_kind text not null default 'profile',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_creator_profile_campaign_insights_slug
  on public.creator_profile_campaign_insights (profile_slug, updated_at desc);

create index if not exists idx_creator_profile_analytics_events_slug
  on public.creator_profile_analytics_events (profile_slug, created_at desc);

create index if not exists idx_creator_profile_analytics_events_offering
  on public.creator_profile_analytics_events (profile_slug, offering_id, created_at desc);

create index if not exists idx_creator_profile_analytics_events_bundle
  on public.creator_profile_analytics_events (profile_slug, bundle_id, created_at desc);
