create table if not exists public.enterprise_inquiries (
  id text primary key,
  channel text not null,
  name text not null,
  email text not null,
  organization text not null default '',
  scope text not null default '',
  budget text not null default '',
  detail text not null,
  status text not null default 'new',
  contract_stage text not null default 'lead',
  estimated_value numeric not null default 0,
  pipeline_owner text not null default '',
  next_step text not null default '',
  expected_close_date date null,
  contract_storage_path text not null default '',
  contract_attachment_url text not null default '',
  contract_attachment_name text not null default '',
  last_reviewed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.enterprise_inquiries add column if not exists contract_stage text not null default 'lead';
alter table public.enterprise_inquiries add column if not exists estimated_value numeric not null default 0;
alter table public.enterprise_inquiries add column if not exists pipeline_owner text not null default '';
alter table public.enterprise_inquiries add column if not exists next_step text not null default '';
alter table public.enterprise_inquiries add column if not exists expected_close_date date null;
alter table public.enterprise_inquiries add column if not exists contract_storage_path text not null default '';
alter table public.enterprise_inquiries add column if not exists contract_attachment_url text not null default '';
alter table public.enterprise_inquiries add column if not exists contract_attachment_name text not null default '';
alter table public.enterprise_inquiries add column if not exists last_reviewed_at timestamptz null;
alter table public.enterprise_inquiries add column if not exists contract_lifecycle_state text not null default 'draft';
alter table public.enterprise_inquiries add column if not exists pipeline_owner_role text not null default '';

create table if not exists public.enterprise_contract_access_logs (
  id text primary key,
  contract_storage_path text not null,
  actor_id text not null default 'guest',
  ip_address text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.enterprise_pipeline_settings (
  settings_key text primary key,
  stage_weights jsonb not null default '{"lead":0.15,"discovery":0.25,"proposal":0.4,"negotiation":0.7,"won":1,"lost":0}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.enterprise_inquiry_events (
  id text primary key,
  inquiry_id text not null references public.enterprise_inquiries(id) on delete cascade,
  actor_id text not null default 'platform-admin',
  event_type text not null,
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.enterprise_milestones (
  id text primary key,
  inquiry_id text not null references public.enterprise_inquiries(id) on delete cascade,
  title text not null,
  owner text not null default '',
  due_date date null,
  status text not null default 'pending',
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.enterprise_artifacts (
  id text primary key,
  inquiry_id text not null references public.enterprise_inquiries(id) on delete cascade,
  kind text not null,
  title text not null,
  amount numeric not null default 0,
  currency text not null default 'USD',
  status text not null default 'draft',
  issued_at date null,
  due_date date null,
  attachment_url text not null default '',
  attachment_name text not null default '',
  storage_path text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.enterprise_signatures (
  id text primary key,
  inquiry_id text not null references public.enterprise_inquiries(id) on delete cascade,
  signer_name text not null,
  signer_email text not null,
  signer_role text not null,
  status text not null default 'pending',
  requested_at timestamptz not null default timezone('utc', now()),
  signed_at timestamptz null,
  note text not null default ''
);

create table if not exists public.enterprise_artifact_payments (
  id text primary key,
  artifact_id text not null references public.enterprise_artifacts(id) on delete cascade,
  amount numeric not null default 0,
  currency text not null default 'USD',
  reference text not null default '',
  paid_at timestamptz not null default timezone('utc', now()),
  note text not null default ''
);
