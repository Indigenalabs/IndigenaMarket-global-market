export type ProfilePillarId =
  | 'digital-arts'
  | 'physical-items'
  | 'courses'
  | 'freelancing'
  | 'seva'
  | 'cultural-tourism'
  | 'language-heritage'
  | 'land-food'
  | 'advocacy-legal'
  | 'materials-tools';

export interface ProfileOffering {
  id: string;
  title: string;
  pillar: ProfilePillarId;
  pillarLabel: string;
  icon: string;
  type: string;
  priceLabel: string;
  image: string;
  href: string;
  blurb: string;
  status?: string;
  coverImage?: string;
  ctaMode?: 'view' | 'buy' | 'book' | 'enroll' | 'quote' | 'message';
  ctaPreset?: 'collect-now' | 'book-now' | 'enroll-now' | 'request-quote' | 'message-first';
  merchandisingRank?: number;
  galleryOrder?: string[];
  launchWindowStartsAt?: string;
  launchWindowEndsAt?: string;
  availabilityLabel?: string;
  availabilityTone?: 'default' | 'success' | 'warning' | 'danger';
  featured?: boolean;
  metadata?: string[];
}

export interface ProfileCollection {
  id: string;
  name: string;
  summary: string;
  cover: string;
  itemIds: string[];
  pillarBreakdown: { pillar: ProfilePillarId; icon: string; count: number }[];
  visibility: 'public' | 'private';
}

export interface ProfileBundle {
  id: string;
  name: string;
  summary: string;
  cover: string;
  itemIds: string[];
  pillarBreakdown: { pillar: ProfilePillarId; icon: string; count: number }[];
  priceLabel: string;
  savingsLabel: string;
  ctaLabel: string;
  ctaType?: 'shop' | 'book' | 'enroll' | 'message' | 'quote';
  leadAudience?: 'collectors' | 'learners' | 'clients' | 'travelers' | 'wholesale-buyers' | 'community-buyers';
  visibility?: 'public' | 'private';
}

export interface ProfileFeaturedReview {
  id: string;
  title: string;
  quote: string;
  authorName: string;
  authorHandle: string;
  pillar: ProfilePillarId;
  rating: number;
  ago: string;
}

export interface ProfileTrustSignal {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface ProfilePresentationSettings {
  leadTab: 'shop' | 'about' | 'bundles' | 'collections' | 'activity';
  leadSection: 'story' | 'reviews' | 'bundles';
  featuredBundleId?: string;
  featuredOfferingIds?: string[];
  showFeaturedReviews: boolean;
  showTrustSignals: boolean;
}

export interface CreatorShippingSettings {
  domesticProfile: string;
  internationalProfile: string;
  defaultPackage: string;
  handlingTime: string;
  integrations: {
    label: string;
    detail: string;
    connected: boolean;
  }[];
}

export interface CreatorPayoutMethod {
  id: string;
  label: string;
  detail: string;
  status: 'active' | 'pending' | 'needs-review';
}

export interface CreatorTransaction {
  id: string;
  date: string;
  item: string;
  amount: string;
  status: 'Paid' | 'Pending payout' | 'Settled' | 'Refunded';
  pillar: ProfilePillarId;
  type: 'sale' | 'payout' | 'refund';
}

export interface CreatorFunnelMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface CreatorItemInsight {
  offeringId: string;
  title: string;
  pillar: ProfilePillarId;
  views: number;
  saves: number;
  conversions: number;
  revenueLabel: string;
}

export interface CreatorCampaignInsight {
  campaignId: string;
  placementLabel: string;
  status: 'draft' | 'scheduled' | 'live' | 'completed';
  impressions: number;
  clicks: number;
  ctrLabel: string;
  spendLabel: string;
}

export interface CreatorVerificationWorkflowItem {
  id: string;
  title: string;
  detail: string;
  status: 'ready' | 'submitted' | 'needs-info' | 'approved';
  actionLabel: string;
}

export interface CreatorSupportRequest {
  id: string;
  title: string;
  detail: string;
  status: 'open' | 'queued' | 'resolved';
  channel: 'chat' | 'callback' | 'tutorial' | 'compliance';
  createdAt: string;
}

export interface CreatorHelpResource {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
  href: string;
}

export interface CreatorFinanceSummary {
  availablePayoutAmount: number;
  pendingPayoutAmount: number;
  lifetimeGrossAmount: number;
  lifetimeNetAmount: number;
  platformFeeRevenueAmount: number;
  processorFeeAmount: number;
  refundAmount: number;
  disputeAmount: number;
  pendingRefundCount: number;
  openDisputeCount: number;
}

export interface CreatorSubscriptionMetrics {
  activeCount: number;
  cancelledCount: number;
  churnCount: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  oneTimeRevenue: number;
  featureAdoption: {
    creatorAnalyticsUnlocked: boolean;
    unlimitedListingsUnlocked: boolean;
    teamWorkspaceUnlocked: boolean;
    archiveAccessUnlocked: boolean;
  };
}

export interface CreatorPlanCapabilities {
  maxListings: number | null;
  analyticsLevel: 'basic' | 'advanced';
  teamWorkspace: boolean;
}

export interface CreatorFinanceCase {
  id: string;
  pillar: ProfilePillarId;
  caseType: 'refund' | 'dispute';
  status: 'open' | 'under_review' | 'approved' | 'rejected' | 'resolved' | 'withdrawn';
  item: string;
  amount: number;
  reason: string;
  details: string;
  resolutionNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileActivity {
  id: string;
  type: 'listing' | 'sale' | 'review' | 'follow' | 'project' | 'release';
  title: string;
  detail: string;
  ago: string;
}

export interface CreatorMessage {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  unread: boolean;
  pillar: ProfilePillarId;
}

export interface ProfileConnection {
  actorId: string;
  slug: string;
  displayName: string;
  username: string;
  avatar: string;
  nation: string;
  location: string;
  verificationLabel: string;
  bioShort: string;
  relationship: 'follower' | 'following';
}

export interface CreatorThreadMessage {
  id: string;
  subject: string;
  body: string;
  pillar: ProfilePillarId;
  unread: boolean;
  createdAt: string;
  fromActorId: string;
  fromLabel: string;
  toActorId: string;
  direction: 'inbound' | 'outbound';
}

export interface CreatorMessageThread {
  counterpartActorId: string;
  counterpartSlug: string;
  counterpartLabel: string;
  counterpartAvatar: string;
  pillar: ProfilePillarId;
  unreadCount: number;
  latestSubject: string;
  latestPreview: string;
  latestAt: string;
  messages: CreatorThreadMessage[];
}

export interface CreatorProfileRecord {
  slug: string;
  displayName: string;
  username: string;
  avatar: string;
  cover: string;
  location: string;
  nation: string;
  verificationLabel: string;
  bioShort: string;
  bioLong: string;
  memberSince: string;
  followerCount: number;
  followingCount: number;
  salesCount: number;
  languages: string[];
  website: string;
  socials: { label: string; href: string }[];
  awards: string[];
  exhibitions: string[];
  publications: string[];
  offerings: ProfileOffering[];
  bundles: ProfileBundle[];
  featuredReviews: ProfileFeaturedReview[];
  trustSignals: ProfileTrustSignal[];
  presentation: ProfilePresentationSettings;
  collections: ProfileCollection[];
  activity: ProfileActivity[];
  dashboardStats: {
    salesMtd: string;
    activeListings: number;
    followers: number;
    availablePayout: string;
  };
  earningsByPillar: { label: string; value: number; color: string }[];
  trafficSources: { label: string; value: string }[];
  funnelMetrics: CreatorFunnelMetric[];
  itemInsights: CreatorItemInsight[];
  campaignInsights: CreatorCampaignInsight[];
  payoutMethods: CreatorPayoutMethod[];
  transactionHistory: CreatorTransaction[];
  notifications: { label: string; channel: string; enabled: boolean }[];
  shippingSettings: CreatorShippingSettings;
  verificationWorkflow: CreatorVerificationWorkflowItem[];
  supportRequests: CreatorSupportRequest[];
  helpResources: CreatorHelpResource[];
  messages: CreatorMessage[];
  financeSummary?: CreatorFinanceSummary;
  financeCases?: CreatorFinanceCase[];
  subscriptionMetrics?: CreatorSubscriptionMetrics;
  creatorPlanCapabilities?: CreatorPlanCapabilities;
}

const offerings: ProfileOffering[] = [
  {
    id: 'offer-1',
    title: 'Buffalo Sky Ceremony',
    pillar: 'digital-arts',
    pillarLabel: 'Digital Art',
    icon: 'ART',
    type: '1/1 Digital Artwork',
    priceLabel: '320 INDI',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&h=900&fit=crop',
    href: '/digital-arts/artwork/aw-101',
    blurb: 'Ceremonial visual storytelling with layered spiritual motifs.',
    availabilityLabel: 'Auction live',
    availabilityTone: 'warning',
    featured: true,
    metadata: ['Auction Live', 'Royalty 10%', 'Verified provenance']
  },
  {
    id: 'offer-2',
    title: 'Ancestor Pulse Mask',
    pillar: 'physical-items',
    pillarLabel: 'Physical',
    icon: 'OBJ',
    type: 'Collector Object',
    priceLabel: '$1,200',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=900&h=900&fit=crop',
    href: '/?pillar=physical-items',
    blurb: 'Mixed-media ceremonial mask with QR-linked origin notes.',
    availabilityLabel: '1 left',
    availabilityTone: 'warning',
    featured: true,
    metadata: ['1 left', 'Ships globally']
  },
  {
    id: 'offer-3',
    title: 'Navajo Weaving in Digital Space',
    pillar: 'courses',
    pillarLabel: 'Courses',
    icon: 'EDU',
    type: 'Premium Course',
    priceLabel: '$89',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=900&fit=crop',
    href: '/courses',
    blurb: 'A six-module course on pattern systems, symbolism, and digital adaptation.',
    availabilityLabel: 'Open enrollment',
    availabilityTone: 'success',
    featured: true,
    metadata: ['847 learners', '4.9 rating']
  },
  {
    id: 'offer-4',
    title: 'Cultural Visual Direction',
    pillar: 'freelancing',
    pillarLabel: 'Freelancing',
    icon: 'SRV',
    type: 'Consulting Service',
    priceLabel: '$150/hr',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=900&fit=crop',
    href: '/freelancing',
    blurb: 'Creative direction for campaigns, exhibitions, and Indigenous-led brands.',
    availabilityLabel: 'Available this week',
    availabilityTone: 'success',
    metadata: ['3 active clients', 'Response in 24h']
  },

  {
    id: 'offer-6',
    title: 'Sunrise Story Trail',
    pillar: 'cultural-tourism',
    pillarLabel: 'Tourism',
    icon: 'TRIP',
    type: 'Cultural Experience',
    priceLabel: 'From $120',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=900&fit=crop',
    href: '/cultural-tourism',
    blurb: 'Protocol-aware guided walk with visual storytelling and artist meet-up.',
    availabilityLabel: '12 spots left',
    availabilityTone: 'warning',
    metadata: ['12 spots left', 'Verified host']
  },
  {
    id: 'offer-7',
    title: 'Heritage Indigo Dye Set',
    pillar: 'materials-tools',
    pillarLabel: 'Materials',
    icon: 'MAT',
    type: 'Supply Listing',
    priceLabel: '$48',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&h=900&fit=crop',
    href: '/materials-tools',
    blurb: 'Traceable dye pigments with harvest notes and care guide.',
    availabilityLabel: 'In stock',
    availabilityTone: 'success',
    metadata: ['Proof docs attached', 'Co-op eligible']
  }
];

const collections: ProfileCollection[] = [
  {
    id: 'collection-1',
    name: 'Desert Signal',
    summary: 'A cross-pillar set of digital works, object pieces, and course material rooted in land memory.',
    cover: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&h=900&fit=crop',
    itemIds: ['offer-1', 'offer-2', 'offer-3'],
    pillarBreakdown: [
      { pillar: 'digital-arts', icon: 'ART', count: 1 },
      { pillar: 'physical-items', icon: 'OBJ', count: 1 },
      { pillar: 'courses', icon: 'EDU', count: 1 }
    ],
    visibility: 'public'
  },
  {
    id: 'collection-2',
    name: 'Community Color Systems',
    summary: 'Consulting and materials bundled around Indigenous color stories, reciprocity, and studio practice.',
    cover: 'https://images.unsplash.com/photo-1494253109108-2e30c049369b?w=1400&h=900&fit=crop',
    itemIds: ['offer-4', 'offer-7'],
    pillarBreakdown: [
      { pillar: 'freelancing', icon: 'SRV', count: 1 },
      { pillar: 'materials-tools', icon: 'MAT', count: 1 }
    ],
    visibility: 'public'
  }
];

const bundles: ProfileBundle[] = [
  {
    id: 'bundle-1',
    name: 'Desert Storyworld Bundle',
    summary: 'A collector-ready cross-pillar package pairing one digital artwork, one object piece, and one premium learning experience.',
    cover: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&h=900&fit=crop',
    itemIds: ['offer-1', 'offer-2', 'offer-3'],
    pillarBreakdown: [
      { pillar: 'digital-arts', icon: 'ART', count: 1 },
      { pillar: 'physical-items', icon: 'OBJ', count: 1 },
      { pillar: 'courses', icon: 'EDU', count: 1 }
    ],
    priceLabel: '$1,489 bundle value',
    savingsLabel: 'Curated release with collector note included',
    ctaLabel: 'Build this bundle',
    ctaType: 'shop',
    leadAudience: 'collectors',
    visibility: 'public'
  },
  {
    id: 'bundle-2',
    name: 'Studio Practice Bundle',
    summary: 'A working-creator package that pairs consulting time, materials sourcing, and a tourism experience for deeper studio immersion.',
    cover: 'https://images.unsplash.com/photo-1494253109108-2e30c049369b?w=1400&h=900&fit=crop',
    itemIds: ['offer-4', 'offer-6', 'offer-7'],
    pillarBreakdown: [
      { pillar: 'freelancing', icon: 'SRV', count: 1 },
      { pillar: 'cultural-tourism', icon: 'TRIP', count: 1 },
      { pillar: 'materials-tools', icon: 'MAT', count: 1 }
    ],
    priceLabel: 'From $318',
    savingsLabel: 'Designed for artists building a full creative workflow',
    ctaLabel: 'Plan this bundle',
    ctaType: 'message',
    leadAudience: 'clients',
    visibility: 'public'
  }
];

const featuredReviews: ProfileFeaturedReview[] = [
  {
    id: 'review-1',
    title: 'Collector confidence',
    quote: 'The provenance notes, the delivery, and the care around the cultural context were all exceptional. It felt like buying into a living story, not just an image file.',
    authorName: 'Mesa Collector',
    authorHandle: '@mesa.collector',
    pillar: 'digital-arts',
    rating: 5,
    ago: '3 weeks ago'
  },
  {
    id: 'review-2',
    title: 'Course experience',
    quote: 'Clear, grounded teaching with real respect for the knowledge being shared. This is one of the few courses that felt both generous and rigorously framed.',
    authorName: 'Lina Begay',
    authorHandle: '@lina.learns',
    pillar: 'courses',
    rating: 5,
    ago: '1 month ago'
  },
  {
    id: 'review-3',
    title: 'Creative collaboration',
    quote: 'We brought Aiyana in for visual direction and got more than a design outcome. We got a process the whole team trusted.',
    authorName: 'River Archive',
    authorHandle: '@river.archive',
    pillar: 'freelancing',
    rating: 5,
    ago: '6 weeks ago'
  }
];

const shippingSettings: CreatorShippingSettings = {
  domesticProfile: 'Domestic (US): $10 flat + $2 per lb',
  internationalProfile: 'International: $25 flat + $5 per lb',
  defaultPackage: 'Default box: 12 x 12 x 12 in, 5 lbs',
  handlingTime: '2 business days',
  integrations: [
    { label: 'ShipStation', detail: 'Connect label generation and fulfillment workflows.', connected: false },
    { label: 'EasyParcel', detail: 'Route regional delivery options for Asia-Pacific orders.', connected: false },
    { label: 'Studio defaults', detail: 'Handling time, packaging dimensions, and fragile-item rules.', connected: true }
  ]
};

const payoutMethods: CreatorPayoutMethod[] = [
  { id: 'bank-us', label: 'Bank account', detail: 'US settlement in 2-3 business days.', status: 'active' },
  { id: 'paypal', label: 'PayPal', detail: 'Instant payout path for smaller withdrawals.', status: 'active' },
  { id: 'mobile-money', label: 'Mobile money', detail: 'Regional wallet setup for faster local access.', status: 'pending' },
  { id: 'indi-token', label: 'INDI token', detail: 'On-chain withdrawal lane with reduced transfer fees.', status: 'active' }
];

const transactionHistory: CreatorTransaction[] = [
  { id: 'txn-1', date: 'Mar 13', item: 'Buffalo Sky Ceremony', amount: '320 INDI', status: 'Paid', pillar: 'digital-arts', type: 'sale' },
  { id: 'txn-2', date: 'Mar 12', item: 'Night Loom Masterclass', amount: '$89', status: 'Settled', pillar: 'courses', type: 'sale' },
  { id: 'txn-3', date: 'Mar 11', item: 'Ancestor Pulse Mask', amount: '$1,200', status: 'Pending payout', pillar: 'physical-items', type: 'sale' },
  { id: 'txn-4', date: 'Mar 10', item: 'Weekly creator payout', amount: '$847', status: 'Settled', pillar: 'freelancing', type: 'payout' }
];

const financeCases: CreatorFinanceCase[] = [
  {
    id: 'finance-case-1',
    pillar: 'physical-items',
    caseType: 'refund',
    status: 'under_review',
    item: 'Ancestor Pulse Mask',
    amount: 1200,
    reason: 'Shipping damage reported',
    details: 'Buyer supplied photos showing damage on arrival and requested a partial refund review.',
    resolutionNotes: '',
    createdAt: '2026-03-14T10:00:00.000Z',
    updatedAt: '2026-03-15T09:30:00.000Z'
  },
  {
    id: 'finance-case-2',
    pillar: 'digital-arts',
    caseType: 'dispute',
    status: 'open',
    item: 'Buffalo Sky Ceremony',
    amount: 320,
    reason: 'Commercial usage scope disagreement',
    details: 'Buyer requested expanded licensing terms outside the original listing agreement.',
    resolutionNotes: '',
    createdAt: '2026-03-16T08:00:00.000Z',
    updatedAt: '2026-03-16T08:00:00.000Z'
  }
];

const funnelMetrics: CreatorFunnelMetric[] = [
  { id: 'funnel-1', label: 'Store visits', value: '18.4k', detail: 'Total storefront visits in the current 30-day window.' },
  { id: 'funnel-2', label: 'Offer clicks', value: '4.1k', detail: 'Buyers who opened a listing, bundle, or booking page.' },
  { id: 'funnel-3', label: 'Buyer actions', value: '612', detail: 'Adds to cart, bookings started, enrollments started, and inquiry opens.' },
  { id: 'funnel-4', label: 'Converted orders', value: '84', detail: 'Completed sales, bookings, enrollments, and paid project starts.' }
];

const itemInsights: CreatorItemInsight[] = [
  { offeringId: 'offer-1', title: 'Buffalo Sky Ceremony', pillar: 'digital-arts', views: 3240, saves: 148, conversions: 11, revenueLabel: '320 INDI' },
  { offeringId: 'offer-3', title: 'Night Loom Masterclass', pillar: 'courses', views: 2890, saves: 201, conversions: 34, revenueLabel: '$3,026' },
  { offeringId: 'offer-2', title: 'Ancestor Pulse Mask', pillar: 'physical-items', views: 1182, saves: 76, conversions: 2, revenueLabel: '$2,400' },
  { offeringId: 'offer-4', title: 'Color Story Advisory', pillar: 'freelancing', views: 964, saves: 42, conversions: 6, revenueLabel: '$900' }
];

const campaignInsights: CreatorCampaignInsight[] = [
  { campaignId: 'camp-1', placementLabel: 'Homepage Artist Spotlight', status: 'live', impressions: 12400, clicks: 482, ctrLabel: '3.9%', spendLabel: '$400' },
  { campaignId: 'camp-2', placementLabel: 'Digital Arts Hero Placement', status: 'completed', impressions: 9800, clicks: 361, ctrLabel: '3.7%', spendLabel: '$200' },
  { campaignId: 'camp-3', placementLabel: 'Trending Collection Takeover', status: 'scheduled', impressions: 0, clicks: 0, ctrLabel: 'Starts Monday', spendLabel: '$300' }
];

const verificationWorkflow: CreatorVerificationWorkflowItem[] = [
  { id: 'verify-1', title: 'Gold / Elder verification', detail: 'Community references and supporting identity documents are ready to submit.', status: 'ready', actionLabel: 'Submit now' },
  { id: 'verify-2', title: 'Sacred content approval', detail: 'One restricted archive item needs elder sign-off before public release.', status: 'needs-info', actionLabel: 'Upload files' },
  { id: 'verify-3', title: 'Premium placement readiness', detail: 'Ad creative needs compliance review before the next homepage run.', status: 'submitted', actionLabel: 'Track review' }
];

const supportRequests: CreatorSupportRequest[] = [
  { id: 'support-1', title: 'Callback for pricing strategy', detail: 'Requested a Digital Champion callback for mixed pricing and royalties.', status: 'queued', channel: 'callback', createdAt: 'Today, 9:30 AM' },
  { id: 'support-2', title: 'Tourism booking setup help', detail: 'Needed help configuring dates and blockout rules.', status: 'resolved', channel: 'chat', createdAt: 'Yesterday, 2:10 PM' }
];

const helpResources: CreatorHelpResource[] = [
  { id: 'help-1', title: 'Voice-first listing guide', detail: 'Record the story first, then polish the listing details.', actionLabel: 'Play', href: '/creator-hub?tab=help#voice-guide' },
  { id: 'help-2', title: 'Royalties explained', detail: 'Understand resale royalties and rights settings in plain language.', actionLabel: 'Read', href: '/creator-hub?tab=help#royalties' },
  { id: 'help-3', title: 'Offline mode', detail: 'See how drafts sync after connection returns.', actionLabel: 'Learn', href: '/creator-hub?tab=help#offline-mode' }
];

const trustSignals: ProfileTrustSignal[] = [
  {
    id: 'trust-1',
    label: 'Average rating',
    value: '4.9/5',
    detail: 'Across courses, commissions, and collector releases.'
  },
  {
    id: 'trust-2',
    label: 'Repeat buyers',
    value: '38%',
    detail: 'Collectors and clients returning across more than one pillar.'
  },
  {
    id: 'trust-3',
    label: 'Response time',
    value: '< 24h',
    detail: 'Fast replies on commissions, bookings, and collaboration inquiries.'
  },
  {
    id: 'trust-4',
    label: 'Verified releases',
    value: '100%',
    detail: 'Listings published with provenance, protocol, or studio notes attached.'
  }
];

const presentation: ProfilePresentationSettings = {
  leadTab: 'shop',
  leadSection: 'reviews',
  featuredBundleId: 'bundle-1',
  featuredOfferingIds: ['offer-1', 'offer-2', 'offer-3'],
  showFeaturedReviews: true,
  showTrustSignals: true
};

const activity: ProfileActivity[] = [
  {
    id: 'activity-1',
    type: 'listing',
    title: 'Listed new digital artwork',
    detail: 'Published "Buffalo Sky Ceremony" with provenance metadata and royalty terms.',
    ago: '2h ago'
  },
  {
    id: 'activity-2',
    type: 'review',
    title: 'Received a 5-star review',
    detail: 'Learners praised the clarity and care in "Navajo Weaving in Digital Space".',
    ago: 'Yesterday'
  },
  {
    id: 'activity-3',
    type: 'sale',
    title: 'Closed a collector sale',
    detail: 'Sold "Ancestor Pulse Mask" to @mesa.collector and released shipping prep notes.',
    ago: '2 days ago'
  },
  {
    id: 'activity-4',
    type: 'release',
    title: 'Opened a new tourism experience',
    detail: 'Launched "Sunrise Story Trail" with protocol notes and limited seating.',
    ago: '5 days ago'
  },
];

export const creatorProfiles: CreatorProfileRecord[] = [
  {
    slug: 'aiyana-redbird',
    displayName: 'Aiyana Redbird',
    username: '@aiyana.redbird',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop',
    cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1800&h=900&fit=crop',
    location: 'Window Rock, Arizona',
    nation: 'Dine / Navajo Nation',
    verificationLabel: 'Verified Artist',
    bioShort: 'Visual storyteller building a sovereign studio across digital art, education, cultural tourism, and materials.',
    bioLong:
      'Aiyana Redbird is a Dine digital artist, educator, and creative producer whose work bridges ceremonial memory, contemporary visual systems, and community-led economies. Her studio spans original digital art, physical collector pieces, immersive learning, consulting, tourism experiences, and materials sourcing. Every offering is rooted in cultural care, reciprocity, and traceable storytelling.',
    memberSince: 'March 2024',
    followerCount: 1234,
    followingCount: 567,
    salesCount: 892,
    languages: ['Diné Bizaad', 'English'],
    website: 'https://indigena.market/aiyana-redbird',
    socials: [
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'YouTube', href: 'https://youtube.com' },
      { label: 'X', href: 'https://x.com' }
    ],
    awards: ['Indigenous Futures Art Prize 2025', 'XR Storytelling Fellowship 2024'],
    exhibitions: ['Desert Light Biennial', 'Digital Sovereignty Week', 'Voices of Memory XR'],
    publications: ['Indigenous Design Journal', 'Creative Economies Quarterly'],
    offerings,
    bundles,
    featuredReviews,
    trustSignals,
    presentation,
    collections,
    activity,
    dashboardStats: {
      salesMtd: '$1,247',
      activeListings: 24,
      followers: 1234,
      availablePayout: '$847'
    },
    earningsByPillar: [
      { label: 'Digital Art', value: 44, color: '#d4af37' },
      { label: 'Courses', value: 21, color: '#dc143c' },
      { label: 'Physical', value: 15, color: '#4ade80' },
      { label: 'Freelancing', value: 12, color: '#60a5fa' },
      { label: 'Tourism & Materials', value: 8, color: '#f97316' }
    ],
    trafficSources: [
      { label: 'Follower Feed', value: '41%' },
      { label: 'Marketplace Discovery', value: '27%' },
      { label: 'Collections', value: '18%' },
      { label: 'Direct Profile Visits', value: '14%' }
    ],
    funnelMetrics,
    itemInsights,
    campaignInsights,
    payoutMethods,
    transactionHistory,
    notifications: [
      { label: 'New sale', channel: 'Email + In-app', enabled: true },
      { label: 'New message', channel: 'In-app', enabled: true },
      { label: 'Follow activity', channel: 'In-app', enabled: true },
      { label: 'Review posted', channel: 'Email', enabled: true },
      { label: 'Low stock / capacity', channel: 'Email + In-app', enabled: false }
    ],
    shippingSettings,
    verificationWorkflow,
    supportRequests,
    helpResources,
    financeCases,
    messages: [
      {
        id: 'msg-1',
        sender: '@collector123',
        subject: 'Commission request',
        preview: 'Looking for a ceremonial sunrise visual for a gallery installation.',
        unread: true,
        pillar: 'digital-arts'
      },
      {
        id: 'msg-2',
        sender: '@culture.travel',
        subject: 'Tourism collaboration',
        preview: 'Can we reserve a private group version of Sunrise Story Trail?',
        unread: false,
        pillar: 'cultural-tourism'
      },
      {
        id: 'msg-3',
        sender: '@studio.supply',
        subject: 'Materials reorder',
        preview: 'Your indigo dye set is getting traction. Ready for a bulk co-op run?',
        unread: false,
        pillar: 'materials-tools'
      }
    ]
  }
];

export function getCreatorProfileBySlug(slug: string): CreatorProfileRecord {
  return creatorProfiles.find((profile) => profile.slug === slug) ?? creatorProfiles[0];
}

export function updateCreatorProfilePresentation(
  slug: string,
  nextPresentation: Partial<ProfilePresentationSettings>
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.presentation = {
    ...profile.presentation,
    ...nextPresentation
  };
  return profile;
}

export function updateCreatorProfileBasics(
  slug: string,
  nextBasics: Partial<Pick<CreatorProfileRecord, 'displayName' | 'username' | 'location' | 'nation' | 'bioShort' | 'bioLong' | 'website' | 'languages' | 'avatar' | 'cover'>>
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.displayName = nextBasics.displayName ?? profile.displayName;
  profile.username = nextBasics.username ?? profile.username;
  profile.location = nextBasics.location ?? profile.location;
  profile.nation = nextBasics.nation ?? profile.nation;
  profile.bioShort = nextBasics.bioShort ?? profile.bioShort;
  profile.bioLong = nextBasics.bioLong ?? profile.bioLong;
  profile.website = nextBasics.website ?? profile.website;
  profile.languages = nextBasics.languages ?? profile.languages;
  profile.avatar = nextBasics.avatar ?? profile.avatar;
  profile.cover = nextBasics.cover ?? profile.cover;
  return profile;
}

export function updateCreatorProfileShippingSettings(
  slug: string,
  nextSettings: Partial<CreatorShippingSettings>
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.shippingSettings = {
    ...profile.shippingSettings,
    ...nextSettings,
    integrations: nextSettings.integrations ?? profile.shippingSettings.integrations
  };
  return profile;
}

export function updateCreatorProfileNotifications(
  slug: string,
  nextNotifications: CreatorProfileRecord['notifications']
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.notifications = nextNotifications;
  return profile;
}

export function appendCreatorProfileOffering(
  slug: string,
  offering: ProfileOffering,
  activity?: Pick<ProfileActivity, 'type' | 'title' | 'detail' | 'ago'>
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.offerings = [offering, ...profile.offerings.filter((entry) => entry.id !== offering.id)];
  profile.dashboardStats.activeListings = profile.offerings.length;
  if (activity) {
    profile.activity = [
      {
        id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...activity
      },
      ...profile.activity
    ];
  }
  return profile;
}

export function updateCreatorProfileOfferingState(
  slug: string,
  offeringId: string,
  nextState: Partial<Pick<ProfileOffering, 'status' | 'availabilityLabel' | 'availabilityTone' | 'featured'>>
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.offerings = profile.offerings.map((entry) =>
    entry.id === offeringId
      ? {
          ...entry,
          ...nextState
        }
      : entry
  );
  return profile;
}

export function updateCreatorProfileOfferingsBulk(
  slug: string,
  offeringIds: string[],
  nextState: Partial<Pick<ProfileOffering, 'status' | 'availabilityLabel' | 'availabilityTone' | 'featured'>>
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  const idSet = new Set(offeringIds);
  profile.offerings = profile.offerings.map((entry) =>
    idSet.has(entry.id)
      ? {
          ...entry,
          ...nextState
        }
      : entry
  );
  return profile;
}

export function updateCreatorProfileOfferingDetails(
  slug: string,
  offeringId: string,
  nextOffering: Partial<Pick<ProfileOffering, 'title' | 'blurb' | 'priceLabel' | 'status' | 'coverImage' | 'ctaMode' | 'ctaPreset' | 'merchandisingRank' | 'galleryOrder' | 'launchWindowStartsAt' | 'launchWindowEndsAt' | 'availabilityLabel' | 'availabilityTone' | 'featured'>>
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.offerings = profile.offerings.map((entry) =>
    entry.id === offeringId
      ? {
          ...entry,
          ...nextOffering
        }
      : entry
  );
  return profile;
}

export function updateCreatorProfileCollectionsBulk(
  slug: string,
  collectionIds: string[],
  nextVisibility: 'public' | 'private'
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  const idSet = new Set(collectionIds);
  profile.collections = profile.collections.map((entry) =>
    idSet.has(entry.id)
      ? {
          ...entry,
          visibility: nextVisibility
        }
      : entry
  );
  return profile;
}

export function updateCreatorProfileFeaturedBundle(
  slug: string,
  bundleId?: string
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.presentation = {
    ...profile.presentation,
    featuredBundleId: bundleId
  };
  return profile;
}

export function saveCreatorProfileBundle(
  slug: string,
  bundle: ProfileBundle
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.bundles = [bundle, ...profile.bundles.filter((entry) => entry.id !== bundle.id)];
  profile.collections = [
    {
      id: bundle.id,
      name: bundle.name,
      summary: bundle.summary,
      cover: bundle.cover,
      itemIds: bundle.itemIds,
      pillarBreakdown: bundle.pillarBreakdown,
      visibility: bundle.visibility ?? 'public'
    },
    ...profile.collections.filter((entry) => entry.id !== bundle.id)
  ];
  return profile;
}

export function updateCreatorProfileVerificationWorkflow(
  slug: string,
  workflowId: string,
  nextStatus: CreatorVerificationWorkflowItem['status']
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) return getCreatorProfileBySlug(slug);
  profile.verificationWorkflow = profile.verificationWorkflow.map((entry) =>
    entry.id === workflowId
      ? {
          ...entry,
          status: nextStatus,
          actionLabel:
            nextStatus === 'approved'
              ? 'Approved'
              : nextStatus === 'submitted'
                ? 'In review'
                : nextStatus === 'needs-info'
                  ? 'Upload files'
                  : 'Submit now'
        }
      : entry
  );
  return profile;
}

export function createCreatorProfileSupportRequest(
  slug: string,
  input: Pick<CreatorSupportRequest, 'title' | 'detail' | 'channel'>
) {
  const profile = creatorProfiles.find((entry) => entry.slug === slug);
  if (!profile) {
    return {
      profile: getCreatorProfileBySlug(slug),
      request: {
        id: `support-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: input.title,
        detail: input.detail,
        channel: input.channel,
        status: 'queued' as const,
        createdAt: 'Just now'
      }
    };
  }
  const request: CreatorSupportRequest = {
    id: `support-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    detail: input.detail,
    channel: input.channel,
    status: 'queued',
    createdAt: 'Just now'
  };
  profile.supportRequests = [request, ...profile.supportRequests];
  return { profile, request };
}

const fallbackConnections: Record<string, { followers: ProfileConnection[]; following: ProfileConnection[] }> = {
  'aiyana-redbird': {
    followers: [
      {
        actorId: 'mesa.collector',
        slug: 'mesa-collector',
        displayName: 'Mesa Collector',
        username: '@mesa.collector',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
        nation: 'Tohono O’odham',
        location: 'Tucson, Arizona',
        verificationLabel: 'Verified Collector',
        bioShort: 'Collecting Indigenous digital art, land-based editions, and artist-led study experiences.',
        relationship: 'follower'
      },
      {
        actorId: 'river.archive',
        slug: 'river-archive',
        displayName: 'River Archive',
        username: '@river.archive',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
        nation: 'Yolngu',
        location: 'Darwin, Australia',
        verificationLabel: 'Verified Community',
        bioShort: 'Documenting living collections, licensing pathways, and artist-led cultural releases.',
        relationship: 'follower'
      }
    ],
    following: [
      {
        actorId: 'lena-sky',
        slug: 'lena-sky',
        displayName: 'Lena Sky',
        username: '@lena.sky',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
        nation: 'Lakota',
        location: 'Rapid City, South Dakota',
        verificationLabel: 'Verified Artist',
        bioShort: 'Motion designer, beadwork educator, and cultural brand collaborator.',
        relationship: 'following'
      },
      {
        actorId: 'earth-supply',
        slug: 'earth-supply',
        displayName: 'Earth Supply Collective',
        username: '@earth.supply',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop',
        nation: 'Maori',
        location: 'Rotorua, Aotearoa',
        verificationLabel: 'Verified Supplier',
        bioShort: 'Traceable pigments, fibers, and natural dye systems for Indigenous studios.',
        relationship: 'following'
      }
    ]
  }
};

const fallbackThreads: Record<string, CreatorMessageThread[]> = {
  'aiyana-redbird': [
    {
      counterpartActorId: 'collector123',
      counterpartSlug: 'collector123',
      counterpartLabel: '@collector123',
      counterpartAvatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=300&h=300&fit=crop',
      pillar: 'digital-arts',
      unreadCount: 1,
      latestSubject: 'Commission request',
      latestPreview: 'Looking for a ceremonial sunrise visual for a gallery installation.',
      latestAt: '2h ago',
      messages: [
        {
          id: 'thread-msg-1',
          subject: 'Commission request',
          body: 'Looking for a ceremonial sunrise visual for a gallery installation.',
          pillar: 'digital-arts',
          unread: true,
          createdAt: '2h ago',
          fromActorId: 'collector123',
          fromLabel: '@collector123',
          toActorId: 'aiyana-redbird',
          direction: 'inbound'
        }
      ]
    },
    {
      counterpartActorId: 'studio.supply',
      counterpartSlug: 'studio-supply',
      counterpartLabel: '@studio.supply',
      counterpartAvatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300&h=300&fit=crop',
      pillar: 'materials-tools',
      unreadCount: 0,
      latestSubject: 'Materials reorder',
      latestPreview: 'Your indigo dye set is getting traction. Ready for a bulk co-op run?',
      latestAt: '1d ago',
      messages: [
        {
          id: 'thread-msg-2',
          subject: 'Materials reorder',
          body: 'Your indigo dye set is getting traction. Ready for a bulk co-op run?',
          pillar: 'materials-tools',
          unread: false,
          createdAt: '1d ago',
          fromActorId: 'studio.supply',
          fromLabel: '@studio.supply',
          toActorId: 'aiyana-redbird',
          direction: 'inbound'
        }
      ]
    }
  ]
};

export function getProfileConnectionsBySlug(
  slug: string,
  kind: 'followers' | 'following'
): ProfileConnection[] {
  return fallbackConnections[slug]?.[kind] ?? [];
}

export function getProfileMessageThreadsBySlug(slug: string): CreatorMessageThread[] {
  return fallbackThreads[slug] ?? [];
}

export function getProfileBundleBySlug(slug: string, bundleId: string) {
  const profile = getCreatorProfileBySlug(slug);
  const bundle = profile.bundles.find((entry) => entry.id === bundleId) ?? profile.bundles[0] ?? null;
  return { profile, bundle };
}



