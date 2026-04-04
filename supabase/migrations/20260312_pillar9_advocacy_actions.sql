-- Pillar 9: Advocacy & Legal action storage
-- Run this in Supabase SQL editor or via supabase migration tooling.

create extension if not exists pgcrypto;

create table if not exists public.adv_case_intakes (
  id text primary key,
  community_name text not null,
  contact_email text not null,
  issue_summary text not null,
  jurisdiction text,
  urgency text not null check (urgency in ('low','medium','high','critical')),
  actor_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.adv_pro_bono_requests (
  id text primary key,
  case_name text not null,
  jurisdiction text not null,
  details text not null,
  urgency text not null check (urgency in ('low','medium','high','critical')),
  actor_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.adv_alert_subscriptions (
  id text primary key,
  email text not null,
  mobile text,
  topics jsonb not null default '[]'::jsonb,
  channels jsonb not null default '["email"]'::jsonb,
  actor_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.adv_donations (
  id text primary key,
  campaign_id text not null,
  campaign_title text not null,
  amount numeric(12,2) not null check (amount > 0),
  donor_name text not null,
  actor_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.adv_consultation_requests (
  id text primary key,
  attorney_id text not null,
  attorney_name text not null,
  type text not null check (type in ('consultation','pro-bono-review')),
  case_summary text not null,
  contact_email text not null,
  actor_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.adv_policy_actions (
  id text primary key,
  bill_id text not null,
  title text not null,
  action_type text not null check (action_type in ('letter','petition','hearing-rsvp')),
  actor_name text not null,
  actor_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.adv_audit_events (
  id text primary key,
  event text not null,
  actor_id text not null,
  timestamp timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_adv_case_intakes_created_at on public.adv_case_intakes (created_at desc);
create index if not exists idx_adv_case_intakes_actor_id on public.adv_case_intakes (actor_id);
create index if not exists idx_adv_pro_bono_requests_created_at on public.adv_pro_bono_requests (created_at desc);
create index if not exists idx_adv_pro_bono_requests_actor_id on public.adv_pro_bono_requests (actor_id);
create index if not exists idx_adv_alert_subscriptions_created_at on public.adv_alert_subscriptions (created_at desc);
create index if not exists idx_adv_alert_subscriptions_actor_id on public.adv_alert_subscriptions (actor_id);
create index if not exists idx_adv_donations_created_at on public.adv_donations (created_at desc);
create index if not exists idx_adv_donations_actor_id on public.adv_donations (actor_id);
create index if not exists idx_adv_consultation_requests_created_at on public.adv_consultation_requests (created_at desc);
create index if not exists idx_adv_consultation_requests_actor_id on public.adv_consultation_requests (actor_id);
create index if not exists idx_adv_policy_actions_created_at on public.adv_policy_actions (created_at desc);
create index if not exists idx_adv_policy_actions_actor_id on public.adv_policy_actions (actor_id);
create index if not exists idx_adv_audit_events_created_at on public.adv_audit_events (created_at desc);
create index if not exists idx_adv_audit_events_actor_id on public.adv_audit_events (actor_id);

alter table public.adv_case_intakes enable row level security;
alter table public.adv_pro_bono_requests enable row level security;
alter table public.adv_alert_subscriptions enable row level security;
alter table public.adv_donations enable row level security;
alter table public.adv_consultation_requests enable row level security;
alter table public.adv_policy_actions enable row level security;
alter table public.adv_audit_events enable row level security;

-- App writes through server route with service role key (bypasses RLS).
-- These policies are for future direct client access and least privilege defaults.

drop policy if exists "adv_case_intakes_select_own" on public.adv_case_intakes;
create policy "adv_case_intakes_select_own"
  on public.adv_case_intakes for select
  using (actor_id = auth.uid()::text);

drop policy if exists "adv_case_intakes_insert_own" on public.adv_case_intakes;
create policy "adv_case_intakes_insert_own"
  on public.adv_case_intakes for insert
  with check (actor_id = auth.uid()::text);

drop policy if exists "adv_pro_bono_requests_select_own" on public.adv_pro_bono_requests;
create policy "adv_pro_bono_requests_select_own"
  on public.adv_pro_bono_requests for select
  using (actor_id = auth.uid()::text);

drop policy if exists "adv_pro_bono_requests_insert_own" on public.adv_pro_bono_requests;
create policy "adv_pro_bono_requests_insert_own"
  on public.adv_pro_bono_requests for insert
  with check (actor_id = auth.uid()::text);

drop policy if exists "adv_alert_subscriptions_select_own" on public.adv_alert_subscriptions;
create policy "adv_alert_subscriptions_select_own"
  on public.adv_alert_subscriptions for select
  using (actor_id = auth.uid()::text);

drop policy if exists "adv_alert_subscriptions_insert_own" on public.adv_alert_subscriptions;
create policy "adv_alert_subscriptions_insert_own"
  on public.adv_alert_subscriptions for insert
  with check (actor_id = auth.uid()::text);

drop policy if exists "adv_donations_select_own" on public.adv_donations;
create policy "adv_donations_select_own"
  on public.adv_donations for select
  using (actor_id = auth.uid()::text);

drop policy if exists "adv_donations_insert_own" on public.adv_donations;
create policy "adv_donations_insert_own"
  on public.adv_donations for insert
  with check (actor_id = auth.uid()::text);

drop policy if exists "adv_consultation_requests_select_own" on public.adv_consultation_requests;
create policy "adv_consultation_requests_select_own"
  on public.adv_consultation_requests for select
  using (actor_id = auth.uid()::text);

drop policy if exists "adv_consultation_requests_insert_own" on public.adv_consultation_requests;
create policy "adv_consultation_requests_insert_own"
  on public.adv_consultation_requests for insert
  with check (actor_id = auth.uid()::text);

drop policy if exists "adv_policy_actions_select_own" on public.adv_policy_actions;
create policy "adv_policy_actions_select_own"
  on public.adv_policy_actions for select
  using (actor_id = auth.uid()::text);

drop policy if exists "adv_policy_actions_insert_own" on public.adv_policy_actions;
create policy "adv_policy_actions_insert_own"
  on public.adv_policy_actions for insert
  with check (actor_id = auth.uid()::text);

drop policy if exists "adv_audit_events_select_own" on public.adv_audit_events;
create policy "adv_audit_events_select_own"
  on public.adv_audit_events for select
  using (actor_id = auth.uid()::text);

drop policy if exists "adv_audit_events_insert_own" on public.adv_audit_events;
create policy "adv_audit_events_insert_own"
  on public.adv_audit_events for insert
  with check (actor_id = auth.uid()::text);
