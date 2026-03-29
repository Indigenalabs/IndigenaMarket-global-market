create table if not exists public.platform_accounts (
  id text primary key,
  slug text not null unique,
  display_name text not null,
  description text not null default '',
  account_type text not null,
  location text not null default '',
  nation text not null default '',
  storefront_headline text not null default '',
  verification_status text not null default 'draft',
  treasury_label text not null default '',
  support_url text not null default '',
  payout_wallet text not null default '',
  avatar text not null default '',
  banner text not null default '',
  story text not null default '',
  featured_offering_ids jsonb not null default '[]'::jsonb,
  representative_actor_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_account_members (
  id text primary key,
  account_id text not null references public.platform_accounts(id) on delete cascade,
  actor_id text not null,
  display_name text not null default '',
  role text not null,
  permissions jsonb not null default '[]'::jsonb,
  joined_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platform_account_verifications (
  id text primary key,
  account_id text not null unique references public.platform_accounts(id) on delete cascade,
  authority_proof text not null default '',
  community_references jsonb not null default '[]'::jsonb,
  treasury_review_status text not null default 'draft',
  representative_review_status text not null default 'draft',
  elder_endorsement_status text not null default 'draft',
  notes text not null default '',
  reviewed_by text,
  submitted_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.elder_authorities (
  id text primary key,
  actor_id text not null unique,
  display_name text not null,
  nation text not null default '',
  status text not null default 'pending',
  authorities jsonb not null default '[]'::jsonb,
  council_seat text not null default '',
  notes text not null default '',
  approved_by text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.revenue_split_rules (
  id text primary key,
  owner_account_id text not null references public.platform_accounts(id) on delete cascade,
  offering_id text not null,
  offering_label text not null,
  pillar text not null,
  rule_type text not null,
  status text not null default 'draft',
  notes text not null default '',
  created_by text not null,
  updated_by text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.revenue_split_beneficiaries (
  id text primary key,
  split_rule_id text not null references public.revenue_split_rules(id) on delete cascade,
  beneficiary_type text not null,
  beneficiary_id text not null,
  label text not null,
  percentage numeric(5,2) not null,
  payout_target text not null default ''
);

create index if not exists idx_platform_accounts_type on public.platform_accounts(account_type);
create index if not exists idx_platform_accounts_verification_status on public.platform_accounts(verification_status);
create index if not exists idx_platform_account_members_account on public.platform_account_members(account_id);
create index if not exists idx_elder_authorities_status on public.elder_authorities(status);
create index if not exists idx_revenue_split_rules_owner_account on public.revenue_split_rules(owner_account_id);
create index if not exists idx_revenue_split_beneficiaries_rule on public.revenue_split_beneficiaries(split_rule_id);
