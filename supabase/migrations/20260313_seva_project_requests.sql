create table if not exists public.seva_project_requests (
  id text primary key,
  requester_actor_id text,
  requester_wallet text,
  requester_label text,
  title text not null,
  community text,
  nation text,
  category text not null default 'cultural_education',
  target_amount numeric(12,2),
  summary text not null default '',
  impact_plan text not null default '',
  status text not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_seva_project_requests_status
  on public.seva_project_requests (status, created_at desc);

alter table if exists public.seva_project_requests enable row level security;
