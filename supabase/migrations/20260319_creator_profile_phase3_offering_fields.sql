alter table if exists public.creator_profile_offerings
  add column if not exists cover_image_url text,
  add column if not exists cta_mode text not null default 'view',
  add column if not exists merchandising_rank integer not null default 0;

update public.creator_profile_offerings
set
  cover_image_url = coalesce(cover_image_url, image_url),
  cta_mode = coalesce(nullif(cta_mode, ''), 'view'),
  merchandising_rank = coalesce(merchandising_rank, 0);
