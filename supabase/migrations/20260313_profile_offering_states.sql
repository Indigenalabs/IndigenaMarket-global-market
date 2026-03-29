alter table if exists public.creator_profile_offerings
  add column if not exists availability_label text,
  add column if not exists availability_tone text default 'default',
  add column if not exists featured boolean not null default false;

update public.creator_profile_offerings
set
  availability_label = coalesce(availability_label, case
    when pillar = 'digital-arts' then 'Auction live'
    when pillar = 'physical-items' then 'In stock'
    when pillar = 'courses' then 'Open enrollment'
    when pillar = 'freelancing' then 'Available'
    when pillar = 'cultural-tourism' then 'Book dates'
    when pillar = 'language-heritage' then 'Public access'
    when pillar = 'land-food' then 'In stock'
    when pillar = 'advocacy-legal' then 'Open intake'
    when pillar = 'materials-tools' then 'In stock'
    else null
  end),
  availability_tone = coalesce(availability_tone, case
    when pillar in ('courses', 'freelancing', 'land-food', 'materials-tools') then 'success'
    when pillar in ('digital-arts', 'physical-items', 'cultural-tourism') then 'warning'
    else 'default'
  end),
  featured = case when id in ('offer-1', 'offer-2', 'offer-3') then true else featured end
where availability_label is null
   or availability_tone is null
   or id in ('offer-1', 'offer-2', 'offer-3');
