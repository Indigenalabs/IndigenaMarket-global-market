-- Pillar 6 Cultural Tourism core transactional tables

create table if not exists public.tourism_bookings (
  booking_id text primary key,
  experience_id text not null,
  traveler_actor_id text,
  traveler_name text not null,
  traveler_email text not null,
  date text not null,
  session_id text,
  session_label text,
  guests integer not null,
  base_fare numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'confirmed',
  payment_status text,
  payment_intent_id text,
  payment_provider text,
  payment_reference text,
  receipt_id text,
  payment_due_at timestamptz,
  protocol_snapshot jsonb not null default '[]'::jsonb,
  media_restrictions jsonb not null default '{}'::jsonb,
  ticket_id text,
  notes text,
  cancellation_reason text,
  rescheduled_from_date text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tourism_reviews (
  review_id text primary key,
  booking_id text not null,
  experience_id text not null,
  reviewer_actor_id text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tourism_operators (
  wallet text primary key,
  operator_name text not null,
  nation text,
  verification_tier text not null default 'Bronze',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tourism_territories (
  id text primary key,
  territory_name text not null,
  nation text not null,
  region text not null,
  protocols_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tourism_events (
  id text primary key,
  event text not null,
  experience_id text,
  kind text,
  actor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tourism_bookings_experience_date on public.tourism_bookings (experience_id, date, created_at desc);
create index if not exists idx_tourism_bookings_traveler on public.tourism_bookings (traveler_actor_id, created_at desc);
create index if not exists idx_tourism_reviews_experience on public.tourism_reviews (experience_id, created_at desc);
create index if not exists idx_tourism_events_created_at on public.tourism_events (created_at desc);
create index if not exists idx_tourism_events_event on public.tourism_events (event, created_at desc);

alter table if exists public.tourism_bookings enable row level security;
alter table if exists public.tourism_reviews enable row level security;
alter table if exists public.tourism_operators enable row level security;
alter table if exists public.tourism_territories enable row level security;
alter table if exists public.tourism_events enable row level security;
