alter table if exists public.seva_project_requests
  add column if not exists review_notes text not null default '',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by_actor text,
  add column if not exists published_project_id text;

create index if not exists idx_seva_project_requests_reviewer
  on public.seva_project_requests (reviewed_by_actor, reviewed_at desc);
