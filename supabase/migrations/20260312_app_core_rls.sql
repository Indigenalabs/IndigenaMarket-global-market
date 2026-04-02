-- App-wide RLS baseline (server routes using service role will bypass these policies)

alter table if exists public.user_profiles enable row level security;
alter table if exists public.wallet_accounts enable row level security;
alter table if exists public.premium_placements enable row level security;
alter table if exists public.marketplace_events enable row level security;
alter table if exists public.digital_art_listings enable row level security;
alter table if exists public.physical_item_listings enable row level security;
alter table if exists public.course_listings enable row level security;
alter table if exists public.freelancing_services enable row level security;
alter table if exists public.seva_projects enable row level security;
alter table if exists public.tourism_experiences enable row level security;
alter table if exists public.language_heritage_listings enable row level security;
alter table if exists public.land_food_listings enable row level security;
alter table if exists public.advocacy_entities enable row level security;

-- Read-only public marketplace visibility
drop policy if exists "public_read_digital_art" on public.digital_art_listings;
create policy "public_read_digital_art"
  on public.digital_art_listings for select
  using (status = 'published' or status = 'active');

drop policy if exists "public_read_physical_items" on public.physical_item_listings;
create policy "public_read_physical_items"
  on public.physical_item_listings for select
  using (status = 'published' or status = 'active');

drop policy if exists "public_read_courses" on public.course_listings;
create policy "public_read_courses"
  on public.course_listings for select
  using (published = true);

drop policy if exists "public_read_freelancing" on public.freelancing_services;
create policy "public_read_freelancing"
  on public.freelancing_services for select
  using (status = 'published' or status = 'active');

drop policy if exists "public_read_tourism" on public.tourism_experiences;
create policy "public_read_tourism"
  on public.tourism_experiences for select
  using (status = 'published' or status = 'active');

drop policy if exists "public_read_language_heritage" on public.language_heritage_listings;
create policy "public_read_language_heritage"
  on public.language_heritage_listings for select
  using (access_tier = 'public');

drop policy if exists "public_read_land_food" on public.land_food_listings;
create policy "public_read_land_food"
  on public.land_food_listings for select
  using (status = 'published' or status = 'active');

drop policy if exists "public_read_advocacy_entities" on public.advocacy_entities;
create policy "public_read_advocacy_entities"
  on public.advocacy_entities for select
  using (status = 'published' or status = 'active');

drop policy if exists "public_read_seva_projects" on public.seva_projects;
create policy "public_read_seva_projects"
  on public.seva_projects for select
  using (status = 'active' or status = 'published');

drop policy if exists "public_read_premium_placements" on public.premium_placements;
create policy "public_read_premium_placements"
  on public.premium_placements for select
  using (active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
