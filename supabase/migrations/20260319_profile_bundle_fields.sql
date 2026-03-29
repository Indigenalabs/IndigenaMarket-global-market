alter table if exists public.creator_profile_collections
  add column if not exists price_label text,
  add column if not exists savings_label text,
  add column if not exists cta_label text,
  add column if not exists cta_type text,
  add column if not exists lead_audience text,
  add column if not exists updated_at timestamptz not null default now();

update public.creator_profile_collections
set
  price_label = coalesce(price_label, 'Curated bundle'),
  savings_label = coalesce(savings_label, 'Grouped for easier discovery'),
  cta_label = coalesce(cta_label, 'View bundle'),
  cta_type = coalesce(cta_type, 'shop'),
  lead_audience = coalesce(lead_audience, 'collectors'),
  updated_at = now()
where
  price_label is null
  or savings_label is null
  or cta_label is null
  or cta_type is null
  or lead_audience is null;
