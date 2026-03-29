create table if not exists public.archive_access_logs (
  id text primary key,
  actor_id text,
  wallet_address text,
  listing_id text,
  action text not null,
  access_level text,
  file_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_archive_access_logs_created_at
  on public.archive_access_logs (created_at desc);
