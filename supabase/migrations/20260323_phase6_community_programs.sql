create table if not exists public.digital_champion_profiles (
  id text primary key,
  slug text not null unique,
  display_name text not null,
  region text not null default '',
  communities jsonb not null default '[]'::jsonb,
  languages jsonb not null default '[]'::jsonb,
  specialties jsonb not null default '[]'::jsonb,
  bio text not null default '',
  status text not null default 'training',
  sponsorship_goal_amount numeric(12,2) not null default 0,
  current_sponsored_amount numeric(12,2) not null default 0,
  impact_summary text not null default '',
  avatar text not null default '',
  hero_image text not null default '',
  linked_account_id text not null default ''
);

create table if not exists public.digital_champion_sponsorships (
  id text primary key,
  champion_id text not null,
  sponsor_name text not null,
  sponsor_email text not null,
  sponsorship_type text not null,
  target_type text not null,
  target_account_id text not null,
  amount numeric(12,2) not null default 0,
  note text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.digital_champion_requests (
  id text primary key,
  requester_name text not null,
  requester_email text not null,
  community_name text not null,
  region text not null default '',
  support_needed text not null default '',
  preferred_language text not null default '',
  urgency text not null default 'medium',
  status text not null default 'open',
  assigned_champion_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.digital_champion_applications (
  id text primary key,
  applicant_name text not null,
  email text not null,
  region text not null default '',
  community_affiliation text not null default '',
  languages jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  story text not null default '',
  status text not null default 'submitted',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.digital_champion_impact_logs (
  id text primary key,
  champion_id text not null,
  metric_label text not null,
  metric_value text not null,
  detail text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.story_posts (
  id text primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  community_slug text not null default '',
  pillar text not null default '',
  format text not null default 'article',
  tags jsonb not null default '[]'::jsonb,
  cover_image text not null default '',
  author_type text not null default 'creator',
  author_id text not null default '',
  author_slug text not null default '',
  author_name text not null default '',
  author_role_label text not null default '',
  author_avatar text not null default '',
  published_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_rooms (
  id text primary key,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  community_slug text not null default '',
  status text not null default 'planning',
  members jsonb not null default '[]'::jsonb,
  task_count integer not null default 0,
  file_count integer not null default 0,
  thread_count integer not null default 0,
  focus text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_digital_champion_profiles_status on public.digital_champion_profiles(status);
create index if not exists idx_digital_champion_sponsorships_champion_id on public.digital_champion_sponsorships(champion_id);
create index if not exists idx_digital_champion_requests_status on public.digital_champion_requests(status);
create index if not exists idx_story_posts_community_slug on public.story_posts(community_slug);
create index if not exists idx_workspace_rooms_community_slug on public.workspace_rooms(community_slug);
