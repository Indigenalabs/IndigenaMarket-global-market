-- Courses pillar transactional tables

create table if not exists public.course_enrollments (
  id text primary key,
  course_id text not null,
  student_actor_id text not null,
  status text not null default 'active',
  completed boolean not null default false,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  certificate_nft_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, student_actor_id)
);

create table if not exists public.course_receipts (
  receipt_id text primary key,
  course_id text not null,
  student_actor_id text not null,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  status text not null default 'captured',
  created_at timestamptz not null default now()
);

create table if not exists public.course_progress (
  id text primary key,
  course_id text not null,
  student_actor_id text not null,
  completed_modules jsonb not null default '[]'::jsonb,
  percent_complete numeric(5,2) not null default 0,
  current_lesson_id text,
  resume_position_sec integer,
  last_accessed timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, student_actor_id)
);

create table if not exists public.course_events (
  id text primary key,
  course_id text,
  event text not null,
  actor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_course_enrollments_student on public.course_enrollments (student_actor_id, created_at desc);
create index if not exists idx_course_enrollments_course on public.course_enrollments (course_id, created_at desc);
create index if not exists idx_course_receipts_student on public.course_receipts (student_actor_id, created_at desc);
create index if not exists idx_course_progress_student on public.course_progress (student_actor_id, updated_at desc);
create index if not exists idx_course_events_created on public.course_events (created_at desc);

alter table if exists public.course_enrollments enable row level security;
alter table if exists public.course_receipts enable row level security;
alter table if exists public.course_progress enable row level security;
alter table if exists public.course_events enable row level security;
