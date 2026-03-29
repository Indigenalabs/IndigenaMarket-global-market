create table if not exists public.materials_tools_orders (
  id text primary key,
  actor_id text,
  wallet_address text,
  product_id text references public.materials_tools_listings(id) on delete set null,
  product_title text,
  supplier_id text references public.materials_tools_suppliers(id) on delete set null,
  supplier_name text,
  quantity integer default 1,
  unit_price numeric default 0,
  currency text default 'USD',
  shipping_region text,
  delivery_mode text,
  fulfillment_status text default 'awaiting-payment',
  payment_status text default 'quoted',
  traceability_status text default 'batch-linked',
  estimated_ship_date date,
  reorder_ready boolean default false,
  receipt_id text,
  payment_intent_id text,
  processor_event_id text,
  amount_paid numeric default 0,
  paid_at timestamptz,
  reconciled_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.materials_tools_rental_bookings (
  id text primary key,
  actor_id text,
  wallet_address text,
  rental_id text references public.materials_tools_rentals(id) on delete set null,
  rental_title text,
  hub_name text,
  booking_date date,
  session_window text,
  deposit_label text,
  access_status text default 'orientation-required',
  return_protocol text,
  steward_status text default 'pending',
  checked_out_at timestamptz,
  returned_at timestamptz,
  condition_status text default 'not-started',
  condition_notes text,
  created_at timestamptz default now()
);

create table if not exists public.materials_tools_coop_commitments (
  id text primary key,
  actor_id text,
  wallet_address text,
  order_id text references public.materials_tools_coop_orders(id) on delete set null,
  order_title text,
  units integer default 1,
  contribution_status text default 'pledged',
  payment_window text,
  freight_lane text,
  invoice_id text,
  invoice_artifact_url text,
  settled_at timestamptz,
  dispatch_status text default 'not-started',
  dispatch_closed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.materials_tools_origin_stories (
  product_id text primary key references public.materials_tools_listings(id) on delete cascade,
  batch_code text,
  steward_name text,
  origin_title text,
  origin_summary text,
  stewardship_protocol text,
  chain_of_custody text[] default '{}',
  proof_documents jsonb default '[]'::jsonb,
  qr_destination_label text,
  created_at timestamptz default now()
);

alter table public.materials_tools_orders add column if not exists payment_intent_id text;
alter table public.materials_tools_orders add column if not exists processor_event_id text;
alter table public.materials_tools_orders add column if not exists reconciled_at timestamptz;

alter table public.materials_tools_rental_bookings add column if not exists steward_status text default 'pending';
alter table public.materials_tools_rental_bookings add column if not exists checked_out_at timestamptz;
alter table public.materials_tools_rental_bookings add column if not exists returned_at timestamptz;
alter table public.materials_tools_rental_bookings add column if not exists condition_status text default 'not-started';
alter table public.materials_tools_rental_bookings add column if not exists condition_notes text;

alter table public.materials_tools_coop_commitments add column if not exists invoice_id text;
alter table public.materials_tools_coop_commitments add column if not exists invoice_artifact_url text;
alter table public.materials_tools_coop_commitments add column if not exists settled_at timestamptz;
alter table public.materials_tools_coop_commitments add column if not exists dispatch_status text default 'not-started';
alter table public.materials_tools_coop_commitments add column if not exists dispatch_closed_at timestamptz;

do $$
begin
  begin
    alter table public.materials_tools_origin_stories
      alter column proof_documents type jsonb
      using case
        when proof_documents is null then '[]'::jsonb
        else to_jsonb(proof_documents)
      end;
  exception when undefined_column then
    alter table public.materials_tools_origin_stories add column proof_documents jsonb default '[]'::jsonb;
  end;
end $$;

alter table public.materials_tools_orders enable row level security;
alter table public.materials_tools_rental_bookings enable row level security;
alter table public.materials_tools_coop_commitments enable row level security;
alter table public.materials_tools_origin_stories enable row level security;

do $$ begin
  create policy "materials_tools_origin_public_read" on public.materials_tools_origin_stories for select using (true);
exception when duplicate_object then null; end $$;
