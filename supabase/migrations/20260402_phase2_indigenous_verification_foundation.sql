create extension if not exists pgcrypto;

create table if not exists public.verification_applications (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null,
  wallet_address text,
  email text,
  profile_slug text,
  verification_type text not null,
  status text not null default 'pending_review',
  applicant_display_name text not null,
  nation_name text,
  community_name text,
  community_slug text,
  statement text,
  evidence_summary text,
  endorsement_summary text,
  decision_notes text,
  metadata jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_actor_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_evidence (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.verification_applications(id) on delete cascade,
  evidence_type text not null,
  label text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_endorsements (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.verification_applications(id) on delete cascade,
  endorser_actor_id text,
  endorser_name text not null,
  endorser_role text not null,
  endorsement_type text not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.verification_applications(id) on delete cascade,
  actor_id text not null,
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.seller_permissions (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null unique,
  wallet_address text,
  email text,
  verification_application_id uuid references public.verification_applications(id) on delete set null,
  verification_type text,
  status text not null default 'unverified',
  can_sell boolean not null default false,
  can_receive_payouts boolean not null default false,
  can_launch_verified_campaigns boolean not null default false,
  can_create_community_storefronts boolean not null default false,
  can_publish_sensitive_content boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_verification_applications_actor_created
  on public.verification_applications (actor_id, created_at desc);
create index if not exists idx_verification_applications_status_created
  on public.verification_applications (status, created_at desc);
create index if not exists idx_verification_applications_profile_slug
  on public.verification_applications (profile_slug)
  where profile_slug is not null;
create index if not exists idx_verification_evidence_application
  on public.verification_evidence (application_id, created_at asc);
create index if not exists idx_verification_endorsements_application
  on public.verification_endorsements (application_id, created_at asc);
create index if not exists idx_verification_status_history_application
  on public.verification_status_history (application_id, created_at desc);
create index if not exists idx_seller_permissions_status_updated
  on public.seller_permissions (status, updated_at desc);


