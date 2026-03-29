export type MarketingPlacementScope =
  | 'homepage'
  | 'trending'
  | 'community'
  | 'digital-arts'
  | 'physical-items'
  | 'courses'
  | 'freelancing'
  | 'cultural-tourism'
  | 'language-heritage'
  | 'land-food'
  | 'advocacy-legal'
  | 'materials-tools';

export interface MarketingPlacement {
  id: string;
  title: string;
  scope: MarketingPlacementScope;
  priceLabel: string;
  summary: string;
  inventory: string;
  bestFor: string;
}

export interface MarketingPackage {
  id: string;
  title: string;
  priceLabel: string;
  summary: string;
  includes: string[];
}

export interface MarketingCampaignRun {
  id: string;
  offerId?: string;
  offerTitle: string;
  scope: MarketingPlacementScope;
  placementId?: string;
  placementTitle: string;
  status: 'pending-payment' | 'pending-approval' | 'changes-requested' | 'scheduled' | 'live' | 'paused' | 'completed' | 'rejected';
  paymentStatus?: 'requires-payment' | 'processing' | 'paid' | 'failed' | 'refunded';
  creativeStatus?: 'draft' | 'pending-review' | 'approved' | 'changes-requested';
  flight: string;
  result: string;
  launchWeek?: string;
  profileSlug?: string;
  checkoutReference?: string;
  reviewNotes?: string;
  creative?: {
    headline: string;
    subheadline: string;
    cta: string;
    image?: string;
  };
}

export interface GovernedPlacementSurface {
  id: string;
  title: string;
  summary: string;
  surface: string;
}

export const MARKETING_PACKAGES: MarketingPackage[] = [
  {
    id: 'starter',
    title: 'Starter Lift',
    priceLabel: '$14.99/mo',
    summary: 'For creators testing their first paid push.',
    includes: ['1 pillar placement credit', 'Basic click tracking', 'Scheduling up to 2 weeks out']
  },
  {
    id: 'growth',
    title: 'Growing Artist',
    priceLabel: '$29.99/mo',
    summary: 'For creators rotating placements across multiple drops or launches.',
    includes: ['2 pillar placement credits', 'Trending or community add-on access', 'Marketing snapshot digest']
  },
  {
    id: 'flagship',
    title: 'Master Artist',
    priceLabel: '$99/mo',
    summary: 'For cross-pillar creators running major launches, bundles, or seasonal pushes.',
    includes: ['Homepage consideration lane', '4 pillar placement credits', 'Priority scheduling + campaign support']
  }
];

export const MARKETING_SCOPES: Array<{ id: 'all' | MarketingPlacementScope; label: string }> = [
  { id: 'all', label: 'All placements' },
  { id: 'homepage', label: 'Homepage' },
  { id: 'trending', label: 'Trending' },
  { id: 'community', label: 'Community' },
  { id: 'digital-arts', label: 'Digital Arts' },
  { id: 'physical-items', label: 'Physical' },
  { id: 'courses', label: 'Courses' },
  { id: 'freelancing', label: 'Freelancing' },
  { id: 'cultural-tourism', label: 'Tourism' },
  { id: 'language-heritage', label: 'Language' },
  { id: 'land-food', label: 'Land & Food' },
  { id: 'advocacy-legal', label: 'Advocacy' },
  { id: 'materials-tools', label: 'Materials' }
];

export const MARKETING_ACTIVE_CAMPAIGNS: MarketingCampaignRun[] = [
  {
    id: 'campaign-1',
    offerTitle: 'Buffalo Sky Ceremony',
    scope: 'digital-arts',
    placementTitle: 'Digital Arts Hero Placement',
    status: 'live',
    flight: 'Mar 11 - Mar 18',
    result: '4.8k impressions | 126 saves'
  },
  {
    id: 'campaign-2',
    offerTitle: 'Sunrise Story Trail',
    scope: 'cultural-tourism',
    placementTitle: 'Operator Spotlight',
    status: 'scheduled',
    flight: 'Mar 18 - Mar 25',
    result: 'Launch ready'
  },
  {
    id: 'campaign-3',
    offerTitle: 'Navajo Weaving in Digital Space',
    scope: 'courses',
    placementTitle: 'Category Featured Course',
    status: 'completed',
    flight: 'Mar 01 - Mar 08',
    result: '39 enrollments'
  },
  {
    id: 'campaign-4',
    offerTitle: 'Heritage Indigo Dye Set',
    scope: 'materials-tools',
    placementTitle: 'Supplier Spotlight',
    status: 'live',
    flight: 'Mar 14 - Mar 21',
    result: '11 wholesale inquiries'
  },
  {
    id: 'campaign-5',
    offerTitle: 'Community Color Systems',
    scope: 'community',
    placementTitle: 'Community Story Placement',
    status: 'scheduled',
    flight: 'Mar 24 - Mar 31',
    result: 'Awaiting creative approval'
  },
  {
    id: 'campaign-6',
    offerTitle: 'Protection Pulse Legal Guide',
    scope: 'advocacy-legal',
    placementTitle: 'Advocacy Resource Feature',
    status: 'completed',
    flight: 'Feb 22 - Mar 01',
    result: '312 resource opens'
  },
  {
    id: 'campaign-7',
    offerTitle: 'Passamaquoddy Audio Conversation Pack',
    scope: 'language-heritage',
    placementTitle: 'Archive Collection Spotlight',
    status: 'live',
    flight: 'Mar 16 - Mar 23',
    result: '91 saves | 18 purchases'
  }
];

export const MARKETING_GLOBAL_PLACEMENTS: MarketingPlacement[] = [
  {
    id: 'home-hero',
    title: 'Homepage Hero Spotlight',
    scope: 'homepage',
    priceLabel: '$500/week',
    summary: 'Prime banner placement above the fold on the platform homepage.',
    inventory: '1 slot / week',
    bestFor: 'Major drops, flagship bundles, high-trust launches'
  },
  {
    id: 'home-creator',
    title: 'Homepage Creator Spotlight',
    scope: 'homepage',
    priceLabel: '$400/week',
    summary: 'Featured creator module with profile callout and conversion CTA.',
    inventory: '2 slots / week',
    bestFor: 'Profile growth, brand recognition, multi-pillar creators'
  },
  {
    id: 'home-collections',
    title: 'Homepage Featured Collections',
    scope: 'homepage',
    priceLabel: '$300/week',
    summary: 'Collection or bundle carousel promotion from the home feed.',
    inventory: '3 slots / week',
    bestFor: 'Curated bundles, collector stories, cross-pillar merchandising'
  },
  {
    id: 'trending-takeover',
    title: 'Trending Takeover',
    scope: 'trending',
    priceLabel: '$450/week',
    summary: 'High-visibility placement inside the trending discovery surface.',
    inventory: '1 slot / cycle',
    bestFor: 'Momentum campaigns, fast-moving drops, time-limited offers'
  },
  {
    id: 'trending-creator',
    title: 'Trending Creator Spotlight',
    scope: 'trending',
    priceLabel: '$275/week',
    summary: 'Creator card placement inside trend-driven discovery modules.',
    inventory: '3 slots / week',
    bestFor: 'Audience growth and discovery acceleration'
  },
  {
    id: 'community-calendar',
    title: 'Community Event Placement',
    scope: 'community',
    priceLabel: '$95/week',
    summary: 'Featured community callout near events, gatherings, and updates.',
    inventory: '4 slots / week',
    bestFor: 'Live sessions, launches, community-led participation'
  },
  {
    id: 'community-story',
    title: 'Community Story Placement',
    scope: 'community',
    priceLabel: '$180/week',
    summary: 'Narrative placement for causes, updates, and creator-community stories.',
    inventory: '2 slots / week',
    bestFor: 'Brand trust, community engagement, social proof'
  }
];

export const MARKETING_PILLAR_PLACEMENTS: Record<
  Exclude<MarketingPlacementScope, 'homepage' | 'trending' | 'community'>,
  MarketingPlacement[]
> = {
  'digital-arts': [
    {
      id: 'digital-sticky',
      title: 'Digital Arts Sticky Banner',
      scope: 'digital-arts',
      priceLabel: '$110/week',
      summary: 'Persistent announcement banner across Digital Arts pages and marketplace.',
      inventory: '1 slot / week',
      bestFor: 'Drop countdowns, auction urgency, creator launches'
    },
    {
      id: 'digital-hero',
      title: 'Digital Arts Hero Placement',
      scope: 'digital-arts',
      priceLabel: '$200/week',
      summary: 'Lead placement inside the Digital Arts marketplace hero lane.',
      inventory: '1 slot / week',
      bestFor: 'New collections, auctions, signature releases'
    },
    {
      id: 'digital-card',
      title: 'Digital Arts Sponsored Card',
      scope: 'digital-arts',
      priceLabel: '$180/week',
      summary: 'Promoted card inside the discovery grid and carousel mix.',
      inventory: '4 slots / week',
      bestFor: 'Edition launches, evergreen bestsellers'
    },
    {
      id: 'digital-artist',
      title: 'Artist Spotlight',
      scope: 'digital-arts',
      priceLabel: '$160/week',
      summary: 'Premium creator card in the featured artist lane.',
      inventory: '3 slots / week',
      bestFor: 'Profile growth and new collector reach'
    },
    {
      id: 'digital-trending',
      title: 'Trending Collections Rail',
      scope: 'digital-arts',
      priceLabel: '$145/week',
      summary: 'Placement inside trending collections and new-arrivals strips.',
      inventory: '4 slots / week',
      bestFor: 'Momentum launches and returning favorites'
    },
    {
      id: 'digital-newsletter',
      title: 'Collector Newsletter Feature',
      scope: 'digital-arts',
      priceLabel: '$300/send',
      summary: 'Feature a collection, artist, or drop in the Digital Arts digest.',
      inventory: '1 slot / send',
      bestFor: 'Collector callouts and major release reminders'
    },
    {
      id: 'digital-takeover',
      title: 'Limited Drop Takeover',
      scope: 'digital-arts',
      priceLabel: '$260/week',
      summary: 'Full drop-story treatment across launch badge, pinned arrival, and hero support.',
      inventory: '1 slot / week',
      bestFor: 'Signature release weeks and premium launch windows'
    }
  ],
  'physical-items': [
    {
      id: 'physical-sticky',
      title: 'Physical Items Sticky Banner',
      scope: 'physical-items',
      priceLabel: '$85/week',
      summary: 'Sticky banner for shipping windows, waitlists, and maker launches.',
      inventory: '1 slot / week',
      bestFor: 'Shipping urgency and limited inventory'
    },
    {
      id: 'physical-hero',
      title: 'Physical Hero Placement',
      scope: 'physical-items',
      priceLabel: '$145/week',
      summary: 'Featured hero lane for collector objects and signature maker releases.',
      inventory: '1 slot / week',
      bestFor: 'High-value object launches'
    },
    {
      id: 'physical-maker',
      title: 'Physical Maker Feature',
      scope: 'physical-items',
      priceLabel: '$35/week',
      summary: 'Featured maker card in the physical marketplace spotlight lane.',
      inventory: '5 slots / week',
      bestFor: 'Craft objects, collectible one-offs, small-batch inventory'
    },
    {
      id: 'physical-drop',
      title: 'Physical Limited Drop',
      scope: 'physical-items',
      priceLabel: '$120/week',
      summary: 'Promoted placement for limited inventory or waitlist-ready launches.',
      inventory: '2 slots / week',
      bestFor: 'Scarce goods, fresh arrivals, seasonal releases'
    },
    {
      id: 'physical-category',
      title: 'Category Shelf Feature',
      scope: 'physical-items',
      priceLabel: '$95/week',
      summary: 'Pin an item into curated category shelves across the marketplace.',
      inventory: '6 slots / week',
      bestFor: 'Evergreen best sellers'
    },
    {
      id: 'physical-newsletter',
      title: 'Maker Digest Feature',
      scope: 'physical-items',
      priceLabel: '$190/send',
      summary: 'Feature new maker releases in the physical items digest.',
      inventory: '1 slot / send',
      bestFor: 'Collector reminders and new arrivals'
    },
    {
      id: 'physical-seasonal',
      title: 'Seasonal Craft Takeover',
      scope: 'physical-items',
      priceLabel: '$210/week',
      summary: 'Cross-module seasonal promotion for gifting and ceremonial runs.',
      inventory: '1 slot / week',
      bestFor: 'Holiday, gifting, and event-based pushes'
    }
  ],
  courses: [
    {
      id: 'courses-sticky',
      title: 'Courses Sticky Banner',
      scope: 'courses',
      priceLabel: '$90/week',
      summary: 'Sticky promotion for cohort deadlines, certificates, and enroll-now windows.',
      inventory: '1 slot / week',
      bestFor: 'Urgent cohort starts'
    },
    {
      id: 'courses-hero',
      title: 'Courses Hero Placement',
      scope: 'courses',
      priceLabel: '$180/week',
      summary: 'Hero placement for flagship programs and educational bundles.',
      inventory: '1 slot / week',
      bestFor: 'Anchor courses and premium launches'
    },
    {
      id: 'courses-promoted-card',
      title: 'Promoted Course Card',
      scope: 'courses',
      priceLabel: '$75/week',
      summary: 'Sponsored course placement in browse and discovery lanes.',
      inventory: '6 slots / week',
      bestFor: 'Evergreen education offers and mini-courses'
    },
    {
      id: 'courses-category',
      title: 'Category Featured Course',
      scope: 'courses',
      priceLabel: '$150/week',
      summary: 'Category-level course spotlight inside the Courses marketplace.',
      inventory: '3 slots / week',
      bestFor: 'Enrollment pushes and cohort launches'
    },
    {
      id: 'courses-sidebar',
      title: 'Course Sidebar Ad',
      scope: 'courses',
      priceLabel: '$100/week',
      summary: 'Persistent placement in high-intent sidebar learning rails.',
      inventory: '4 slots / week',
      bestFor: 'Supportive learning products and upsells'
    },
    {
      id: 'courses-spotlight',
      title: 'Instructor Spotlight',
      scope: 'courses',
      priceLabel: '$300/week',
      summary: 'Instructor-led profile feature with direct enrollment CTA.',
      inventory: '2 slots / week',
      bestFor: 'Brand-building and cohort trust'
    },
    {
      id: 'courses-bundle',
      title: 'Featured Bundle Promotion',
      scope: 'courses',
      priceLabel: '$250/week',
      summary: 'Bundle placement for learning tracks and cross-course packages.',
      inventory: '2 slots / week',
      bestFor: 'Higher-order learning paths'
    }
  ],
  freelancing: [
    {
      id: 'freelance-sticky',
      title: 'Freelancing Sticky Banner',
      scope: 'freelancing',
      priceLabel: '$75/week',
      summary: 'Sticky promotion for open calendars, rush slots, and booking windows.',
      inventory: '1 slot / week',
      bestFor: 'Urgent lead capture'
    },
    {
      id: 'freelance-hero',
      title: 'Featured Pro Banner',
      scope: 'freelancing',
      priceLabel: '$250/week',
      summary: 'Featured provider banner inside the Freelancing marketplace.',
      inventory: '2 slots / week',
      bestFor: 'High-value consulting, custom commissions, agency-style offers'
    },
    {
      id: 'freelance-search-boost',
      title: 'Freelance Search Boost',
      scope: 'freelancing',
      priceLabel: '$85/week',
      summary: 'Priority ranking in service discovery and quick-hire results.',
      inventory: '8 slots / week',
      bestFor: 'Lead generation and rapid inquiry flow'
    },
    {
      id: 'freelance-card',
      title: 'Promoted Service Card',
      scope: 'freelancing',
      priceLabel: '$95/week',
      summary: 'Sponsored service card inserted into category and search feeds.',
      inventory: '6 slots / week',
      bestFor: 'Always-on visibility'
    },
    {
      id: 'freelance-spotlight',
      title: 'Creator Services Spotlight',
      scope: 'freelancing',
      priceLabel: '$140/week',
      summary: 'Trust-building feature highlighting delivery quality and response time.',
      inventory: '3 slots / week',
      bestFor: 'Consultation credibility'
    },
    {
      id: 'freelance-newsletter',
      title: 'Services Newsletter Feature',
      scope: 'freelancing',
      priceLabel: '$180/send',
      summary: 'Feature one service provider in the weekly services digest.',
      inventory: '1 slot / send',
      bestFor: 'Specialized service discovery'
    },
    {
      id: 'freelance-takeover',
      title: 'Lead Gen Takeover',
      scope: 'freelancing',
      priceLabel: '$220/week',
      summary: 'Extended multi-module campaign across hero, spotlight, and search boost.',
      inventory: '1 slot / week',
      bestFor: 'Lead-generation campaigns'
    }
  ],
  'cultural-tourism': [
    {
      id: 'tourism-sticky',
      title: 'Tourism Sticky Banner',
      scope: 'cultural-tourism',
      priceLabel: '$120/week',
      summary: 'Sticky announcement banner across tourism pages for season launches and booking urgency.',
      inventory: '1 slot / week',
      bestFor: 'Retreat launches, sold-out alerts, deadline pushes'
    },
    {
      id: 'tourism-hero',
      title: 'Featured Destination Banner',
      scope: 'cultural-tourism',
      priceLabel: '$300/week',
      summary: 'Hero placement for experiences, hosts, and travel-season launches.',
      inventory: '2 slots / week',
      bestFor: 'Bookings, retreat launches, destination storytelling'
    },
    {
      id: 'tourism-operator',
      title: 'Operator Spotlight',
      scope: 'cultural-tourism',
      priceLabel: '$250/week',
      summary: 'Operator story card with direct booking CTA.',
      inventory: '2 slots / week',
      bestFor: 'Host visibility, trust-building, premium experience offers'
    },
    {
      id: 'tourism-sponsored-card',
      title: 'Sponsored Experience Card',
      scope: 'cultural-tourism',
      priceLabel: '$180/week',
      summary: 'Sponsored card injected inside discovery grids and search results.',
      inventory: '4 slots / week',
      bestFor: 'Evergreen experiences and workshops'
    },
    {
      id: 'tourism-region',
      title: 'Region Boost',
      scope: 'cultural-tourism',
      priceLabel: '$100/week',
      summary: 'Regional priority ranking in tourism search and recommendation modules.',
      inventory: '4 slots / week',
      bestFor: 'Destination-specific campaigns'
    },
    {
      id: 'tourism-newsletter',
      title: 'Newsletter Feature',
      scope: 'cultural-tourism',
      priceLabel: '$350/send',
      summary: 'Direct placement in the tourism newsletter and outbound destination digest.',
      inventory: '1 slot / send',
      bestFor: 'Seasonal launches and host storytelling'
    },
    {
      id: 'tourism-takeover',
      title: 'Seasonal Campaign Takeover',
      scope: 'cultural-tourism',
      priceLabel: '$220/week',
      summary: 'Full seasonal promotion package for events, lodges, and tours.',
      inventory: '1 slot / week',
      bestFor: 'Destination-wide seasonal storytelling'
    }
  ],
  'language-heritage': [
    {
      id: 'language-sticky',
      title: 'Language & Heritage Sticky Banner',
      scope: 'language-heritage',
      priceLabel: '$130/week',
      summary: 'Sticky placement for archive launches, approvals, and protocol-aware announcements.',
      inventory: '1 slot / week',
      bestFor: 'Program launches and archive visibility'
    },
    {
      id: 'language-hero',
      title: 'Language & Heritage Hero',
      scope: 'language-heritage',
      priceLabel: '$220/week',
      summary: 'Premium hero placement for language resources, collections, or programs.',
      inventory: '1 slot / week',
      bestFor: 'Archive launches, learning resources, community programs'
    },
    {
      id: 'language-collection',
      title: 'Archive Collection Spotlight',
      scope: 'language-heritage',
      priceLabel: '$140/week',
      summary: 'Collection placement for archive clusters and heritage bundles.',
      inventory: '4 slots / week',
      bestFor: 'Story clusters, archive drops, language drives'
    },
    {
      id: 'language-keepers',
      title: 'Featured Keepers Spotlight',
      scope: 'language-heritage',
      priceLabel: '$220/week',
      summary: 'Feature recognized Elders and verified keepers in profile spotlight modules.',
      inventory: '3 slots / week',
      bestFor: 'Trust-building and speaker discovery'
    },
    {
      id: 'language-sponsored-card',
      title: 'Sponsored Listings Injection',
      scope: 'language-heritage',
      priceLabel: '$150/week',
      summary: 'Injected sponsored cards inside listing discovery feed.',
      inventory: '4 slots / week',
      bestFor: 'Resource discovery and archive conversion'
    },
    {
      id: 'language-live-rail',
      title: 'Live Sessions Rail Sponsor',
      scope: 'language-heritage',
      priceLabel: '$180/week',
      summary: 'Sponsor the live sessions and bundle lane modules.',
      inventory: '2 slots / week',
      bestFor: 'Immersion sessions and program signups'
    },
    {
      id: 'language-map',
      title: 'Territory Map Takeover',
      scope: 'language-heritage',
      priceLabel: '$240/week',
      summary: 'Premium placement over territory visibility and map storytelling sections.',
      inventory: '1 slot / week',
      bestFor: 'Institutional visibility and flagship archive storytelling'
    }
  ],
  'land-food': [
    {
      id: 'land-sticky',
      title: 'Land & Food Sticky Banner',
      scope: 'land-food',
      priceLabel: '$95/week',
      summary: 'Sticky surface for harvest windows, produce drops, and stewardship actions.',
      inventory: '1 slot / week',
      bestFor: 'Seasonal urgency'
    },
    {
      id: 'land-hero',
      title: 'Land & Food Hero Placement',
      scope: 'land-food',
      priceLabel: '$190/week',
      summary: 'Hero lane for regenerative producer stories and flagship harvest runs.',
      inventory: '1 slot / week',
      bestFor: 'Producer storytelling and flagship harvests'
    },
    {
      id: 'land-producer',
      title: 'Producer Feature',
      scope: 'land-food',
      priceLabel: '$160/week',
      summary: 'Showcase a verified producer, regenerative product line, or stewardship offer.',
      inventory: '3 slots / week',
      bestFor: 'Harvest windows, food boxes, stewardship storytelling'
    },
    {
      id: 'land-seasonal',
      title: 'Seasonal Harvest Placement',
      scope: 'land-food',
      priceLabel: '$120/week',
      summary: 'Timed placement tied to seasonal availability and recent sales.',
      inventory: '5 slots / week',
      bestFor: 'Limited harvest products, freshness-driven demand'
    },
    {
      id: 'land-card',
      title: 'Sponsored Product Card',
      scope: 'land-food',
      priceLabel: '$110/week',
      summary: 'Promoted product or service card inside marketplace discovery.',
      inventory: '6 slots / week',
      bestFor: 'Everyday product visibility'
    },
    {
      id: 'land-newsletter',
      title: 'Regenerative Digest Feature',
      scope: 'land-food',
      priceLabel: '$220/send',
      summary: 'Feature a harvest or stewardship offer inside the food sovereignty digest.',
      inventory: '1 slot / send',
      bestFor: 'Producer trust and return buyers'
    },
    {
      id: 'land-takeover',
      title: 'Recent Sales Takeover',
      scope: 'land-food',
      priceLabel: '$175/week',
      summary: 'Premium push through recent sales, producer feature, and homepage module tie-ins.',
      inventory: '1 slot / week',
      bestFor: 'Momentum-based product pushes'
    }
  ],
  'advocacy-legal': [
    {
      id: 'advocacy-sticky',
      title: 'Advocacy Sticky Banner',
      scope: 'advocacy-legal',
      priceLabel: '$135/week',
      summary: 'Sticky banner for urgent legal fund drives, alerts, and rights updates.',
      inventory: '1 slot / week',
      bestFor: 'Urgent response and legal momentum'
    },
    {
      id: 'advocacy-hero',
      title: 'Advocacy Hero Placement',
      scope: 'advocacy-legal',
      priceLabel: '$260/week',
      summary: 'Lead hero placement inside the protection marketplace pages.',
      inventory: '1 slot / week',
      bestFor: 'Major campaigns and rights defense launches'
    },
    {
      id: 'advocacy-resource',
      title: 'Advocacy Resource Feature',
      scope: 'advocacy-legal',
      priceLabel: '$175/week',
      summary: 'Promote legal resources, guides, or approved rights services.',
      inventory: '3 slots / week',
      bestFor: 'Education, awareness campaigns, trusted services'
    },
    {
      id: 'advocacy-attorney',
      title: 'Attorney / Advocate Spotlight',
      scope: 'advocacy-legal',
      priceLabel: '$240/week',
      summary: 'Service-led spotlight for approved legal and advocacy professionals.',
      inventory: '2 slots / week',
      bestFor: 'Consultation pipelines and lead generation'
    },
    {
      id: 'advocacy-trending',
      title: 'Trending Legal Actions Rail',
      scope: 'advocacy-legal',
      priceLabel: '$150/week',
      summary: 'Placement in high-attention pulse and action modules.',
      inventory: '4 slots / week',
      bestFor: 'Visibility during active rights cycles'
    },
    {
      id: 'advocacy-keepers',
      title: 'Featured Keepers / Counsel',
      scope: 'advocacy-legal',
      priceLabel: '$185/week',
      summary: 'High-trust spotlight alongside top counsel and campaign stewards.',
      inventory: '3 slots / week',
      bestFor: 'Trust-building and professional discovery'
    },
    {
      id: 'advocacy-institutional',
      title: 'Institutional Partner Banner',
      scope: 'advocacy-legal',
      priceLabel: '$210/week',
      summary: 'Partner-facing placement near clinics, resources, and rights infrastructure.',
      inventory: '2 slots / week',
      bestFor: 'Organizations and service providers'
    }
  ],
  'materials-tools': [
    {
      id: 'materials-sticky',
      title: 'Materials Sticky Banner',
      scope: 'materials-tools',
      priceLabel: '$110/week',
      summary: 'Sticky banner for supply runs, tool-library windows, and co-op deadlines.',
      inventory: '1 slot / week',
      bestFor: 'Urgent inventory pushes and studio supply campaigns'
    },
    {
      id: 'materials-hero',
      title: 'Materials Hero Placement',
      scope: 'materials-tools',
      priceLabel: '$180/week',
      summary: 'Hero lane for supply chain stories, lead materials, and tool-library campaigns.',
      inventory: '1 slot / week',
      bestFor: 'Flagship supply launches and sourcing stories'
    },
    {
      id: 'materials-sponsored',
      title: 'Sponsored Supply Listing',
      scope: 'materials-tools',
      priceLabel: '$95/week',
      summary: 'Featured listing card for materials, tools, and sourcing services.',
      inventory: '6 slots / week',
      bestFor: 'Supply discovery, repeat-buyer demand, lot movement'
    },
    {
      id: 'materials-supplier',
      title: 'Supplier Spotlight',
      scope: 'materials-tools',
      priceLabel: '$145/week',
      summary: 'Trust-building supplier story card for verified harvesters and tool stewards.',
      inventory: '3 slots / week',
      bestFor: 'Supplier credibility and long-term procurement'
    },
    {
      id: 'materials-rental',
      title: 'Tool Library Highlight',
      scope: 'materials-tools',
      priceLabel: '$120/week',
      summary: 'Premium placement for rental windows, steward events, and library campaigns.',
      inventory: '3 slots / week',
      bestFor: 'Equipment access and community hubs'
    },
    {
      id: 'materials-coop',
      title: 'Co-op Order Boost',
      scope: 'materials-tools',
      priceLabel: '$130/week',
      summary: 'Feature bulk-buy runs and group inventory windows.',
      inventory: '3 slots / week',
      bestFor: 'Bulk commitments and order closing cycles'
    },
    {
      id: 'materials-newsletter',
      title: 'Supply Digest Feature',
      scope: 'materials-tools',
      priceLabel: '$185/send',
      summary: 'Promote a supply run, supplier, or tool library in the supply digest.',
      inventory: '1 slot / send',
      bestFor: 'Repeat buyers and studio teams'
    }
  ]
};

export const MARKETING_PLACEMENTS: MarketingPlacement[] = [
  ...MARKETING_GLOBAL_PLACEMENTS,
  ...Object.values(MARKETING_PILLAR_PLACEMENTS).flat()
];

export const TOTAL_GLOBAL_MARKETING_PLACEMENTS = MARKETING_GLOBAL_PLACEMENTS.length;
export const TOTAL_PILLAR_MARKETING_PLACEMENTS = Object.values(MARKETING_PILLAR_PLACEMENTS).flat().length;
export const TOTAL_MARKETING_PLACEMENTS = MARKETING_PLACEMENTS.length;
export const TOTAL_SELF_SERVE_PILLARS = Object.keys(MARKETING_PILLAR_PLACEMENTS).length;
export const PLATFORM_GOVERNED_PILLARS = ['seva'] as const;
export const TOTAL_PLATFORM_PILLARS =
  TOTAL_SELF_SERVE_PILLARS + PLATFORM_GOVERNED_PILLARS.length;

export const SEVA_GOVERNED_PLACEMENTS: GovernedPlacementSurface[] = [
  {
    id: 'seva-sticky',
    title: 'Seva Sticky Banner',
    summary: 'Platform-set urgency banner for verified relief windows, matching campaigns, and donor drives.',
    surface: 'All Seva pages'
  },
  {
    id: 'seva-hero',
    title: 'Seva Hero Cause',
    summary: 'Lead request or fund lane promoted in the main Seva hero after governance review.',
    surface: 'Seva home hero'
  },
  {
    id: 'seva-spotlight',
    title: 'Community Spotlight',
    summary: 'Editorial spotlight for a reviewed community need, stewardship team, or project update.',
    surface: 'Seva spotlight rail'
  },
  {
    id: 'seva-urgent',
    title: 'Urgent Need Feature',
    summary: 'High-visibility urgent request placement for time-sensitive, verified projects.',
    surface: 'Priority request grid'
  },
  {
    id: 'seva-region',
    title: 'Regional Support Boost',
    summary: 'Geography-led placement used for region-specific mobilization and donor matching pushes.',
    surface: 'Cause filters and discovery'
  },
  {
    id: 'seva-digest',
    title: 'Seva Donor Digest Feature',
    summary: 'Platform-curated donor newsletter feature for approved Seva causes and updates.',
    surface: 'Email + community digest'
  },
  {
    id: 'seva-takeover',
    title: 'Solidarity Takeover',
    summary: 'Seasonal or community-wide support campaign that coordinates Seva discovery across the platform.',
    surface: 'Cross-platform campaign windows'
  }
];
