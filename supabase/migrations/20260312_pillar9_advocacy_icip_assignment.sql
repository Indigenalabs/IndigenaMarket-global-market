alter table if exists public.adv_icip_registry_entries
  add column if not exists assigned_reviewer_id text,
  add column if not exists assigned_reviewer_name text,
  add column if not exists assigned_reviewer_at timestamptz;

alter table if exists public.adv_icip_registry_activity
  drop constraint if exists adv_icip_registry_activity_activity_type_check;

alter table if exists public.adv_icip_registry_activity
  add constraint adv_icip_registry_activity_activity_type_check
  check (activity_type in (
    'claim_submitted',
    'review_status_changed',
    'public_visibility_updated',
    'assignment_updated',
    'comment'
  ));
