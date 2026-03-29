alter table if exists public.adv_donations
  add column if not exists assigned_reviewer_id text,
  add column if not exists assigned_reviewer_name text,
  add column if not exists assigned_reviewer_at timestamptz;

create index if not exists adv_donations_assigned_reviewer_id_idx
  on public.adv_donations (assigned_reviewer_id);
