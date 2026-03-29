alter table if exists public.language_heritage_sacred_requests
add column if not exists reviewed_by text;

alter table if exists public.language_heritage_sacred_requests
add column if not exists reviewed_at timestamptz;
