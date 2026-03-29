create table if not exists public.creator_verification_purchase_events (
  id text primary key,
  purchase_id text not null references public.creator_verification_purchases(id) on delete cascade,
  status text not null,
  note text,
  actor_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists creator_verification_purchase_events_purchase_idx
  on public.creator_verification_purchase_events (purchase_id, created_at desc);

create table if not exists public.language_heritage_sacred_request_events (
  id text primary key,
  request_id text not null references public.language_heritage_sacred_requests(id) on delete cascade,
  status text not null,
  note text,
  actor_id text,
  created_at timestamptz not null default now()
);

create index if not exists language_heritage_sacred_request_events_request_idx
  on public.language_heritage_sacred_request_events (request_id, created_at desc);
