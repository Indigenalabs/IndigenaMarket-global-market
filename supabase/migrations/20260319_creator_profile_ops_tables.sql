create table if not exists public.creator_profile_support_requests (
  id text primary key,
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  title text not null,
  detail text not null default '',
  status text not null default 'queued',
  channel text not null default 'chat',
  created_at_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_profile_verification_items (
  id text primary key,
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  title text not null,
  detail text not null default '',
  status text not null default 'ready',
  action_label text not null default 'Submit now',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_profile_payout_methods (
  id text primary key,
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  label text not null,
  detail text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_profile_transactions (
  id text primary key,
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  item text not null,
  amount text not null,
  status text not null default 'Paid',
  pillar text not null default 'digital-arts',
  entry_type text not null default 'sale',
  entry_date_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creator_profile_support_requests_slug on public.creator_profile_support_requests (profile_slug, created_at desc);
create index if not exists idx_creator_profile_verification_items_slug on public.creator_profile_verification_items (profile_slug, created_at desc);
create index if not exists idx_creator_profile_payout_methods_slug on public.creator_profile_payout_methods (profile_slug, created_at desc);
create index if not exists idx_creator_profile_transactions_slug on public.creator_profile_transactions (profile_slug, created_at desc);

insert into public.creator_profile_support_requests (id, profile_slug, title, detail, status, channel, created_at_label)
values
  ('support-1','aiyana-redbird','Callback for pricing strategy','Requested a Digital Champion callback for mixed pricing and royalties.','queued','callback','Today, 9:30 AM'),
  ('support-2','aiyana-redbird','Tourism booking setup help','Needed help configuring dates and blockout rules.','resolved','chat','Yesterday, 2:10 PM')
on conflict (id) do update set
  title = excluded.title,
  detail = excluded.detail,
  status = excluded.status,
  channel = excluded.channel,
  created_at_label = excluded.created_at_label,
  updated_at = now();

insert into public.creator_profile_verification_items (id, profile_slug, title, detail, status, action_label)
values
  ('verify-1','aiyana-redbird','Gold / Elder verification','Community references and supporting identity documents are ready to submit.','ready','Submit now'),
  ('verify-2','aiyana-redbird','Sacred content approval','One restricted archive item needs elder sign-off before public release.','needs-info','Upload files'),
  ('verify-3','aiyana-redbird','Premium placement readiness','Ad creative needs compliance review before the next homepage run.','submitted','Track review')
on conflict (id) do update set
  title = excluded.title,
  detail = excluded.detail,
  status = excluded.status,
  action_label = excluded.action_label,
  updated_at = now();

insert into public.creator_profile_payout_methods (id, profile_slug, label, detail, status)
values
  ('bank-us','aiyana-redbird','Bank account','US settlement in 2-3 business days.','active'),
  ('paypal','aiyana-redbird','PayPal','Instant payout path for smaller withdrawals.','active'),
  ('mobile-money','aiyana-redbird','Mobile money','Regional wallet setup for faster local access.','pending'),
  ('indi-token','aiyana-redbird','INDI token','On-chain withdrawal lane with reduced transfer fees.','active')
on conflict (id) do update set
  label = excluded.label,
  detail = excluded.detail,
  status = excluded.status,
  updated_at = now();

insert into public.creator_profile_transactions (id, profile_slug, item, amount, status, pillar, entry_type, entry_date_label)
values
  ('txn-1','aiyana-redbird','Buffalo Sky Ceremony','320 INDI','Paid','digital-arts','sale','Mar 13'),
  ('txn-2','aiyana-redbird','Night Loom Masterclass','$89','Settled','courses','sale','Mar 12'),
  ('txn-3','aiyana-redbird','Ancestor Pulse Mask','$1,200','Pending payout','physical-items','sale','Mar 11'),
  ('txn-4','aiyana-redbird','Weekly creator payout','$847','Settled','freelancing','payout','Mar 10')
on conflict (id) do update set
  item = excluded.item,
  amount = excluded.amount,
  status = excluded.status,
  pillar = excluded.pillar,
  entry_type = excluded.entry_type,
  entry_date_label = excluded.entry_date_label,
  updated_at = now();
