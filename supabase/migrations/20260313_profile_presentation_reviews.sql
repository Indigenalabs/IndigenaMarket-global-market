alter table if exists public.creator_profiles
  add column if not exists featured_reviews jsonb not null default '[]'::jsonb,
  add column if not exists trust_signals jsonb not null default '[]'::jsonb,
  add column if not exists presentation_settings jsonb not null default '{}'::jsonb;

update public.creator_profiles
set
  featured_reviews = coalesce(featured_reviews, '[]'::jsonb) || '[
    {
      "id":"review-1",
      "title":"Collector confidence",
      "quote":"The provenance notes, the delivery, and the care around the cultural context were all exceptional. It felt like buying into a living story, not just an image file.",
      "authorName":"Mesa Collector",
      "authorHandle":"@mesa.collector",
      "pillar":"digital-arts",
      "rating":5,
      "ago":"3 weeks ago"
    },
    {
      "id":"review-2",
      "title":"Course experience",
      "quote":"Clear, grounded teaching with real respect for the knowledge being shared. This is one of the few courses that felt both generous and rigorously framed.",
      "authorName":"Lina Begay",
      "authorHandle":"@lina.learns",
      "pillar":"courses",
      "rating":5,
      "ago":"1 month ago"
    },
    {
      "id":"review-3",
      "title":"Creative collaboration",
      "quote":"We brought Aiyana in for visual direction and got more than a design outcome. We got a process the whole team trusted.",
      "authorName":"River Archive",
      "authorHandle":"@river.archive",
      "pillar":"freelancing",
      "rating":5,
      "ago":"6 weeks ago"
    }
  ]'::jsonb,
  trust_signals = coalesce(trust_signals, '[]'::jsonb) || '[
    {
      "id":"trust-1",
      "label":"Average rating",
      "value":"4.9/5",
      "detail":"Across courses, commissions, and collector releases."
    },
    {
      "id":"trust-2",
      "label":"Repeat buyers",
      "value":"38%",
      "detail":"Collectors and clients returning across more than one pillar."
    },
    {
      "id":"trust-3",
      "label":"Response time",
      "value":"< 24h",
      "detail":"Fast replies on commissions, bookings, and collaboration inquiries."
    },
    {
      "id":"trust-4",
      "label":"Verified releases",
      "value":"100%",
      "detail":"Listings published with provenance, protocol, or studio notes attached."
    }
  ]'::jsonb,
  presentation_settings = jsonb_build_object(
    'leadTab', 'shop',
    'leadSection', 'reviews',
    'featuredBundleId', 'bundle-1',
    'showFeaturedReviews', true,
    'showTrustSignals', true
  )
where slug = 'aiyana-redbird';
