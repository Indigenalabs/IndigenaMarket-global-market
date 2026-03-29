create table if not exists public.app_rate_limit_windows (
  scope text not null,
  bucket_key text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  last_request_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (scope, bucket_key, window_start)
);

create index if not exists idx_app_rate_limit_windows_last_request
  on public.app_rate_limit_windows (last_request_at desc);

create table if not exists public.adv_operational_events (
  id text primary key,
  event_type text not null,
  severity text not null default 'info',
  source text not null,
  actor_id text,
  entity_type text,
  entity_id text,
  status text not null default 'recorded',
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_adv_operational_events_created_at
  on public.adv_operational_events (created_at desc);
create index if not exists idx_adv_operational_events_event_type
  on public.adv_operational_events (event_type, created_at desc);
create index if not exists idx_adv_operational_events_severity
  on public.adv_operational_events (severity, created_at desc);

create table if not exists public.adv_payment_webhook_events (
  id text primary key,
  processor_event_id text,
  payment_intent_id text not null,
  payment_state text not null,
  verification_status text not null,
  processing_outcome text not null,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_adv_payment_webhook_events_created_at
  on public.adv_payment_webhook_events (created_at desc);
create index if not exists idx_adv_payment_webhook_events_processor_event
  on public.adv_payment_webhook_events (processor_event_id, created_at desc);
