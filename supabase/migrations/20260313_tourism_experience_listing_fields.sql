alter table if exists public.tourism_experiences
  add column if not exists community text,
  add column if not exists summary text,
  add column if not exists media_url text,
  add column if not exists duration_label text,
  add column if not exists group_size text,
  add column if not exists max_capacity integer,
  add column if not exists reviews_count integer not null default 0,
  add column if not exists available_next_date date;
