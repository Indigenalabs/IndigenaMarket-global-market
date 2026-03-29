create table if not exists governance_compliance_profiles (
  id text primary key,
  actor_id text not null,
  wallet_address text,
  kyc_status text not null default 'pending',
  aml_status text not null default 'pending',
  payout_enabled boolean not null default false,
  bnpl_enabled boolean not null default false,
  tax_reporting_enabled boolean not null default false,
  reviewed_by text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists governance_compliance_profiles_actor_idx
  on governance_compliance_profiles (actor_id);

create table if not exists governance_data_use_consents (
  id text primary key,
  actor_id text not null,
  buyer_name text not null,
  buyer_email text not null,
  usage_purpose text not null,
  scopes jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  reference text,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists governance_audit_events (
  id text primary key,
  actor_id text not null,
  domain text not null,
  action text not null,
  target_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);