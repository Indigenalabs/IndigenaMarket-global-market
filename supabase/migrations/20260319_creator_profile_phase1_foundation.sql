alter table if exists public.creator_profile_offerings
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.creator_profiles
  add column if not exists funnel_metrics jsonb not null default '[]'::jsonb,
  add column if not exists item_insights jsonb not null default '[]'::jsonb,
  add column if not exists campaign_insights jsonb not null default '[]'::jsonb,
  add column if not exists payout_methods jsonb not null default '[]'::jsonb,
  add column if not exists transaction_history jsonb not null default '[]'::jsonb,
  add column if not exists verification_workflow jsonb not null default '[]'::jsonb,
  add column if not exists support_requests jsonb not null default '[]'::jsonb,
  add column if not exists help_resources jsonb not null default '[]'::jsonb;

update public.creator_profiles
set
  funnel_metrics = coalesce(funnel_metrics, '[]'::jsonb),
  item_insights = coalesce(item_insights, '[]'::jsonb),
  campaign_insights = coalesce(campaign_insights, '[]'::jsonb),
  payout_methods = coalesce(payout_methods, '[]'::jsonb),
  transaction_history = coalesce(transaction_history, '[]'::jsonb),
  verification_workflow = coalesce(verification_workflow, '[]'::jsonb),
  support_requests = coalesce(support_requests, '[]'::jsonb),
  help_resources = coalesce(help_resources, '[]'::jsonb)
where slug = 'aiyana-redbird';
