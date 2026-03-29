create table if not exists public.institutional_archive_seats (
  id text primary key,
  actor_id text not null,
  email text not null,
  role text not null default 'viewer',
  status text not null default 'invited',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists institutional_archive_seats_actor_email_idx
  on public.institutional_archive_seats (actor_id, email);
