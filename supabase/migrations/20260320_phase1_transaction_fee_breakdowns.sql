alter table if exists public.materials_tools_orders
  add column if not exists payment_breakdown jsonb not null default '{}'::jsonb;

alter table if exists public.course_receipts
  add column if not exists payment_breakdown jsonb not null default '{}'::jsonb;

alter table if exists public.tourism_bookings
  add column if not exists payment_breakdown jsonb not null default '{}'::jsonb;
