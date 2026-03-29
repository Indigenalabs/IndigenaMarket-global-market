-- Pillar 9: Advocacy operations workflow tables

create table if not exists public.adv_case_workflows (
  case_id text primary key references public.adv_case_intakes(id) on delete cascade,
  workflow_status text not null default 'submitted',
  priority text not null default 'high',
  queue_bucket text not null default 'general-intake',
  assigned_attorney_id text,
  assigned_attorney_name text,
  next_review_at timestamptz,
  last_note text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.adv_campaign_reviews (
  campaign_id text primary key,
  review_status text not null default 'pending',
  visibility_state text not null default 'draft',
  review_notes text,
  approved_by text,
  approved_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.adv_legal_clinic_slots (
  id text primary key,
  attorney_id text,
  attorney_name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  location_label text,
  booking_status text not null default 'open',
  capacity integer not null default 1,
  booked_count integer not null default 0,
  booking_url text,
  featured boolean not null default false,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_adv_case_workflows_status on public.adv_case_workflows (workflow_status, priority, updated_at desc);
create index if not exists idx_adv_case_workflows_assigned on public.adv_case_workflows (assigned_attorney_id, updated_at desc);
create index if not exists idx_adv_campaign_reviews_status on public.adv_campaign_reviews (review_status, visibility_state, updated_at desc);
create index if not exists idx_adv_legal_clinic_slots_time on public.adv_legal_clinic_slots (status, booking_status, starts_at asc);
create index if not exists idx_adv_legal_clinic_slots_attorney on public.adv_legal_clinic_slots (attorney_id, starts_at asc);

alter table public.adv_case_workflows enable row level security;
alter table public.adv_campaign_reviews enable row level security;
alter table public.adv_legal_clinic_slots enable row level security;

create policy if not exists "public_read_adv_clinic_slots"
  on public.adv_legal_clinic_slots for select
  using ((status = 'active' or status = 'published') and booking_status = 'open');
