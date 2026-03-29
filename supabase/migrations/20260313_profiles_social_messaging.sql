create table if not exists public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  owner_actor_id text not null unique,
  slug text not null unique,
  display_name text not null,
  username text not null,
  avatar_url text,
  cover_url text,
  location text,
  nation text,
  verification_label text default 'Verified Creator',
  bio_short text default '',
  bio_long text default '',
  member_since text,
  follower_count integer not null default 0,
  following_count integer not null default 0,
  sales_count integer not null default 0,
  languages jsonb not null default '[]'::jsonb,
  website_url text,
  socials jsonb not null default '[]'::jsonb,
  awards jsonb not null default '[]'::jsonb,
  exhibitions jsonb not null default '[]'::jsonb,
  publications jsonb not null default '[]'::jsonb,
  dashboard_stats jsonb not null default '{}'::jsonb,
  earnings_by_pillar jsonb not null default '[]'::jsonb,
  traffic_sources jsonb not null default '[]'::jsonb,
  notifications jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_profile_offerings (
  id text primary key,
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  title text not null,
  pillar text not null,
  pillar_label text not null,
  icon text not null,
  offering_type text not null,
  price_label text not null,
  image_url text,
  href text not null,
  blurb text,
  status text default 'Active',
  metadata jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_profile_collections (
  id text primary key,
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  name text not null,
  summary text default '',
  cover_url text,
  pillar_breakdown jsonb not null default '[]'::jsonb,
  visibility text not null default 'public',
  created_at timestamptz not null default now()
);

create table if not exists public.creator_profile_collection_items (
  collection_id text not null references public.creator_profile_collections(id) on delete cascade,
  offering_id text not null references public.creator_profile_offerings(id) on delete cascade,
  position integer not null default 0,
  primary key (collection_id, offering_id)
);

create table if not exists public.creator_profile_activities (
  id text primary key,
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  activity_type text not null,
  title text not null,
  detail text default '',
  ago_label text,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_profile_follows (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  follower_actor_id text not null,
  created_at timestamptz not null default now(),
  unique (profile_slug, follower_actor_id)
);

create table if not exists public.creator_profile_messages (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null references public.creator_profiles(slug) on delete cascade,
  recipient_actor_id text not null,
  sender_actor_id text not null,
  sender_label text not null,
  subject text not null,
  body text not null,
  pillar text default 'digital-arts',
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_creator_profiles_slug on public.creator_profiles (slug);
create index if not exists idx_creator_offerings_profile on public.creator_profile_offerings (profile_slug, pillar);
create index if not exists idx_creator_collections_profile on public.creator_profile_collections (profile_slug);
create index if not exists idx_creator_activities_profile on public.creator_profile_activities (profile_slug, created_at desc);
create index if not exists idx_creator_follows_profile on public.creator_profile_follows (profile_slug, created_at desc);
create index if not exists idx_creator_messages_recipient on public.creator_profile_messages (recipient_actor_id, created_at desc);

insert into public.creator_profiles (
  owner_actor_id,
  slug,
  display_name,
  username,
  avatar_url,
  cover_url,
  location,
  nation,
  verification_label,
  bio_short,
  bio_long,
  member_since,
  follower_count,
  following_count,
  sales_count,
  languages,
  website_url,
  socials,
  awards,
  exhibitions,
  publications,
  dashboard_stats,
  earnings_by_pillar,
  traffic_sources,
  notifications
)
values (
  'aiyana-redbird',
  'aiyana-redbird',
  'Aiyana Redbird',
  '@aiyana.redbird',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1800&h=900&fit=crop',
  'Window Rock, Arizona',
  'Diné / Navajo Nation',
  'Verified Artist',
  'Visual storyteller building a sovereign studio across digital art, education, cultural tourism, and community-funded creation.',
  'Aiyana Redbird is a Diné digital artist, educator, and creative producer whose work bridges ceremonial memory, contemporary visual systems, and community-led economies. Her studio spans original digital art, physical collector pieces, immersive learning, consulting, tourism experiences, and materials sourcing. Every offering is rooted in cultural care, reciprocity, and traceable storytelling.',
  'March 2024',
  1234,
  567,
  892,
  '["Diné Bizaad","English"]'::jsonb,
  'https://indigena.market/aiyana-redbird',
  '[{"label":"Instagram","href":"https://instagram.com"},{"label":"YouTube","href":"https://youtube.com"},{"label":"X","href":"https://x.com"}]'::jsonb,
  '["Indigenous Futures Art Prize 2025","XR Storytelling Fellowship 2024"]'::jsonb,
  '["Desert Light Biennial","Digital Sovereignty Week","Voices of Memory XR"]'::jsonb,
  '["Indigenous Design Journal","Creative Economies Quarterly"]'::jsonb,
  '{"salesMtd":"$1,247","activeListings":24,"followers":1234,"availablePayout":"$847"}'::jsonb,
  '[{"label":"Digital Art","value":44,"color":"#d4af37"},{"label":"Courses","value":21,"color":"#dc143c"},{"label":"Physical","value":15,"color":"#4ade80"},{"label":"Freelancing","value":12,"color":"#60a5fa"},{"label":"Other","value":8,"color":"#f97316"}]'::jsonb,
  '[{"label":"Follower Feed","value":"41%"},{"label":"Marketplace Discovery","value":"27%"},{"label":"Collections","value":"18%"},{"label":"Direct Profile Visits","value":"14%"}]'::jsonb,
  '[{"label":"New sale","channel":"Email + In-app","enabled":true},{"label":"New message","channel":"In-app","enabled":true},{"label":"Follow activity","channel":"In-app","enabled":true},{"label":"Review posted","channel":"Email","enabled":true},{"label":"Low stock / capacity","channel":"Email + In-app","enabled":false}]'::jsonb
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  username = excluded.username,
  avatar_url = excluded.avatar_url,
  cover_url = excluded.cover_url,
  location = excluded.location,
  nation = excluded.nation,
  verification_label = excluded.verification_label,
  bio_short = excluded.bio_short,
  bio_long = excluded.bio_long,
  member_since = excluded.member_since,
  follower_count = excluded.follower_count,
  following_count = excluded.following_count,
  sales_count = excluded.sales_count,
  languages = excluded.languages,
  website_url = excluded.website_url,
  socials = excluded.socials,
  awards = excluded.awards,
  exhibitions = excluded.exhibitions,
  publications = excluded.publications,
  dashboard_stats = excluded.dashboard_stats,
  earnings_by_pillar = excluded.earnings_by_pillar,
  traffic_sources = excluded.traffic_sources,
  notifications = excluded.notifications,
  updated_at = now();

insert into public.creator_profile_offerings (
  id, profile_slug, title, pillar, pillar_label, icon, offering_type, price_label, image_url, href, blurb, status, metadata
)
values
  ('offer-1','aiyana-redbird','Buffalo Sky Ceremony','digital-arts','Digital Art','🖼️','1/1 Digital Artwork','320 INDI','https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&h=900&fit=crop','/digital-arts/artwork/aw-101','Ceremonial visual storytelling with layered spiritual motifs.','Auction Live','["Auction Live","Royalty 10%","Verified provenance"]'::jsonb),
  ('offer-2','aiyana-redbird','Ancestor Pulse Mask','physical-items','Physical','🪑','Collector Object','$1,200','https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=900&h=900&fit=crop','/?pillar=physical-items','Mixed-media ceremonial mask with QR-linked origin notes.','Active','["1 left","Ships globally"]'::jsonb),
  ('offer-3','aiyana-redbird','Navajo Weaving in Digital Space','courses','Courses','🎓','Premium Course','$89','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=900&fit=crop','/courses','A six-module course on pattern systems, symbolism, and digital adaptation.','Active','["847 learners","4.9 rating"]'::jsonb),
  ('offer-4','aiyana-redbird','Cultural Visual Direction','freelancing','Freelancing','🤝','Consulting Service','$150/hr','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=900&fit=crop','/freelancing','Creative direction for campaigns, exhibitions, and Indigenous-led brands.','Active','["3 active clients","Response in 24h"]'::jsonb),
  ('offer-5','aiyana-redbird','Healing Through Color Fund','seva','Seva','❤️','Community Project','Donate','https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&h=900&fit=crop','/seva','Supports youth art kits and elder-led workshops in Diné communities.','Active','["82% funded"]'::jsonb),
  ('offer-6','aiyana-redbird','Sunrise Story Trail','cultural-tourism','Tourism','⛰️','Cultural Experience','From $120','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=900&fit=crop','/cultural-tourism','Protocol-aware guided walk with visual storytelling and artist meet-up.','Live','["12 spots left","Verified host"]'::jsonb),
  ('offer-7','aiyana-redbird','Heritage Indigo Dye Set','materials-tools','Materials','🛠️','Supply Listing','$48','https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&h=900&fit=crop','/materials-tools','Traceable dye pigments with harvest notes and care guide.','Active','["Proof docs attached","Co-op eligible"]'::jsonb)
on conflict (id) do update set
  title = excluded.title,
  pillar = excluded.pillar,
  pillar_label = excluded.pillar_label,
  icon = excluded.icon,
  offering_type = excluded.offering_type,
  price_label = excluded.price_label,
  image_url = excluded.image_url,
  href = excluded.href,
  blurb = excluded.blurb,
  status = excluded.status,
  metadata = excluded.metadata;

insert into public.creator_profile_collections (
  id, profile_slug, name, summary, cover_url, pillar_breakdown, visibility
)
values
  ('collection-1','aiyana-redbird','Desert Signal','A cross-pillar set of digital works, object pieces, and course material rooted in land memory.','https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&h=900&fit=crop','[{"pillar":"digital-arts","icon":"🖼️","count":1},{"pillar":"physical-items","icon":"🪑","count":1},{"pillar":"courses","icon":"🎓","count":1}]'::jsonb,'public'),
  ('collection-2','aiyana-redbird','Community Color Systems','Consulting, materials, and seva support bundled around Indigenous color stories and reciprocity.','https://images.unsplash.com/photo-1494253109108-2e30c049369b?w=1400&h=900&fit=crop','[{"pillar":"freelancing","icon":"🤝","count":1},{"pillar":"seva","icon":"❤️","count":1},{"pillar":"materials-tools","icon":"🛠️","count":1}]'::jsonb,'public')
on conflict (id) do update set
  name = excluded.name,
  summary = excluded.summary,
  cover_url = excluded.cover_url,
  pillar_breakdown = excluded.pillar_breakdown,
  visibility = excluded.visibility;

insert into public.creator_profile_collection_items (collection_id, offering_id, position)
values
  ('collection-1','offer-1',1),
  ('collection-1','offer-2',2),
  ('collection-1','offer-3',3),
  ('collection-2','offer-4',1),
  ('collection-2','offer-5',2),
  ('collection-2','offer-7',3)
on conflict (collection_id, offering_id) do update set
  position = excluded.position;

insert into public.creator_profile_activities (id, profile_slug, activity_type, title, detail, ago_label)
values
  ('activity-1','aiyana-redbird','listing','Listed new digital artwork','Published "Buffalo Sky Ceremony" with provenance metadata and royalty terms.','2h ago'),
  ('activity-2','aiyana-redbird','review','Received a 5-star review','Learners praised the clarity and care in "Navajo Weaving in Digital Space".','Yesterday'),
  ('activity-3','aiyana-redbird','sale','Closed a collector sale','Sold "Ancestor Pulse Mask" to @mesa.collector and released shipping prep notes.','2 days ago'),
  ('activity-4','aiyana-redbird','release','Opened a new tourism experience','Launched "Sunrise Story Trail" with protocol notes and limited seating.','5 days ago'),
  ('activity-5','aiyana-redbird','project','Funded a Seva milestone','Reached 82% funding for "Healing Through Color Fund".','1 week ago')
on conflict (id) do update set
  title = excluded.title,
  detail = excluded.detail,
  ago_label = excluded.ago_label;

insert into public.creator_profile_messages (
  profile_slug, recipient_actor_id, sender_actor_id, sender_label, subject, body, pillar, unread
)
select 'aiyana-redbird','aiyana-redbird','collector123','@collector123','Commission request','Looking for a ceremonial sunrise visual for a gallery installation.','digital-arts',true
where not exists (
  select 1 from public.creator_profile_messages
  where recipient_actor_id = 'aiyana-redbird'
    and sender_actor_id = 'collector123'
    and subject = 'Commission request'
);
