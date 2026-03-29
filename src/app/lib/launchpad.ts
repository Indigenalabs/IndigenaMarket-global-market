export type LaunchpadCategory =
  | 'artist'
  | 'athlete'
  | 'scholarship'
  | 'travel'
  | 'emergency'
  | 'community'
  | 'digital-champion'
  | 'entrepreneurship'
  | 'business-starter';

export type LaunchpadCadence = 'one-time' | 'monthly';
export type LaunchpadCampaignStatus = 'draft' | 'pending_review' | 'published';

export interface LaunchpadSupportTier {
  id: string;
  label: string;
  amount: number;
  badge: string;
  description: string;
  cadence: LaunchpadCadence;
}

export interface LaunchpadCampaign {
  id: string;
  slug: string;
  status?: LaunchpadCampaignStatus;
  category: LaunchpadCategory;
  title: string;
  subtitle: string;
  beneficiaryName: string;
  beneficiaryRole: string;
  beneficiaryImage: string;
  location: string;
  image: string;
  gallery: string[];
  goalAmount: number;
  raisedAmount: number;
  sponsorCount: number;
  urgencyLabel: string;
  summary: string;
  story: string;
  useOfFunds: string[];
  impactPoints: string[];
  tags: string[];
  linkedAccountSlug?: string;
  linkedEntityHref?: string;
  closesInLabel: string;
  recentBackers: Array<{
    name: string;
    amount: number;
    note: string;
  }>;
  milestonePlan: Array<{
    label: string;
    amount: number;
    detail: string;
  }>;
  campaignUpdates: Array<{
    title: string;
    detail: string;
    postedLabel: string;
  }>;
  supportTiers: {
    oneTime: LaunchpadSupportTier[];
    monthly: LaunchpadSupportTier[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface LaunchpadQuote {
  subtotal: number;
  platformFee: number;
  processorFee: number;
  total: number;
  beneficiaryNet: number;
}

export const LAUNCHPAD_PLATFORM_FEE_RATE = 0.05;
const LAUNCHPAD_PROCESSOR_RATE = 0.029;
const LAUNCHPAD_PROCESSOR_FIXED = 0.3;

function makeTiers(kind: string, oneTime: number[], monthly: number[]): { oneTime: LaunchpadSupportTier[]; monthly: LaunchpadSupportTier[] } {
  const oneTimeLabels = ['Spark', 'Builder', 'Patron', 'Cornerstone'];
  const monthlyLabels = ['Seed', 'Circle', 'Steward', 'Anchor'];
  return {
    oneTime: oneTime.map((amount, index) => ({
      id: `one-time-${index + 1}`,
      label: oneTimeLabels[index],
      amount,
      badge: kind,
      cadence: 'one-time',
      description: `One-time ${kind.toLowerCase()} support at the ${oneTimeLabels[index].toLowerCase()} tier.`
    })),
    monthly: monthly.map((amount, index) => ({
      id: `monthly-${index + 1}`,
      label: monthlyLabels[index],
      amount,
      badge: kind,
      cadence: 'monthly',
      description: `Monthly ${kind.toLowerCase()} backing at the ${monthlyLabels[index].toLowerCase()} tier.`
    }))
  };
}

export const launchpadCategoryMeta: Record<LaunchpadCategory, { label: string; description: string; image: string }> = {
  artist: {
    label: 'Artists',
    description: 'Tours, exhibitions, drops, and creator-led public work.',
    image: '/launchpad/artist-tour.svg'
  },
  athlete: {
    label: 'Athletes',
    description: 'Training, camps, travel, equipment, and competition readiness.',
    image: '/launchpad/athlete-camp.svg'
  },
  scholarship: {
    label: 'Scholarships',
    description: 'Language, cultural education, and youth learning pathways.',
    image: '/launchpad/scholarship-circle.svg'
  },
  travel: {
    label: 'Travel',
    description: 'Flights, lodging, and mobility for cultural and professional opportunity.',
    image: '/launchpad/travel-fund.svg'
  },
  emergency: {
    label: 'Emergency',
    description: 'Rapid support for urgent family, community, and mutual-aid needs.',
    image: '/launchpad/emergency-relief.svg'
  },
  community: {
    label: 'Community',
    description: 'Treasury-backed community builds, halls, and collective initiatives.',
    image: '/launchpad/community-hall.svg'
  },
  'digital-champion': {
    label: 'Digital Champions',
    description: 'Regional onboarding, launch help, device support, and treasury literacy.',
    image: '/launchpad/champion-fund.svg'
  },
  entrepreneurship: {
    label: 'Entrepreneurship',
    description: 'Scaling Indigenous founders and culturally rooted ventures.',
    image: '/launchpad/founder-lab.svg'
  },
  'business-starter': {
    label: 'Business Starter',
    description: 'Small first-step funding for setup, equipment, and licensing.',
    image: '/launchpad/starter-kits.svg'
  }
};

export const seedLaunchpadCampaigns: LaunchpadCampaign[] = [
  {
    id: 'launch-1',
    slug: 'talia-riverstone',
    category: 'digital-champion',
    title: 'Fund Talia Riverstone to onboard three Northern Plains communities.',
    subtitle: 'Digital Champion campaign',
    beneficiaryName: 'Talia Riverstone',
    beneficiaryRole: 'Regional Digital Champion',
    beneficiaryImage: '/communities/reps/talia-riverstone.svg',
    location: 'Northern Plains | Riverstone Nation',
    image: '/launchpad/champion-fund.svg',
    gallery: ['/launchpad/champion-fund.svg', '/communities/reps/talia-riverstone.svg', '/communities/riverstone-banner.svg'],
    goalAmount: 7500,
    raisedAmount: 4200,
    sponsorCount: 28,
    urgencyLabel: 'Current launch window',
    summary: 'Travel, onboarding time, device setup, and treasury literacy support for communities moving into live storefront operation.',
    story: 'Talia is already helping Riverstone-area communities create pages, assign representatives, and get their first listings live. This campaign pays for actual field capacity: travel, office hours, launch support, and the work of making the platform usable in-region.',
    useOfFunds: ['Regional travel and in-person onboarding', 'Wallet and treasury literacy sessions', 'Device and connectivity support', 'Launch-day seller setup'],
    impactPoints: ['3 community pages scheduled', '37 creators already supported', '2 archive onboarding drives underway'],
    tags: ['Launch support', 'Regional onboarding', 'Treasury literacy'],
    linkedAccountSlug: 'talia-riverstone-champion',
    linkedEntityHref: '/creator-hub',
    closesInLabel: '18 days left',
    recentBackers: [
      { name: 'North River Co-op', amount: 250, note: 'Monthly field support' },
      { name: 'Cedar Valley Arts House', amount: 95, note: 'Device setup support' },
      { name: 'Anonymous backer', amount: 45, note: 'Travel contribution' }
    ],
    milestonePlan: [
      { label: 'Field kit', amount: 1500, detail: 'Connectivity kit, onboarding materials, and travel pack.' },
      { label: 'Regional circuit', amount: 4200, detail: 'Fund the current three-community launch round.' },
      { label: 'Expanded support desk', amount: 7500, detail: 'Create stable monthly office hours and device lending.' }
    ],
    campaignUpdates: [
      { title: 'Riverstone storefront is now live', detail: 'First listings and representative roles are now active on the community page.', postedLabel: 'Posted 2 days ago' },
      { title: 'Second onboarding trip booked', detail: 'Travel and meeting logistics are set for the next two communities in the queue.', postedLabel: 'Posted 5 days ago' }
    ],
    supportTiers: makeTiers('Champion fund', [35, 95, 220, 500], [18, 45, 110, 250])
  },
  {
    id: 'launch-2',
    slug: 'aiyana-redbird-tour-fund',
    category: 'artist',
    title: "Back Aiyana Redbird's exhibition and workshop tour.",
    subtitle: 'Artist campaign',
    beneficiaryName: 'Aiyana Redbird',
    beneficiaryRole: 'Artist and educator',
    beneficiaryImage: '/communities/reps/aiyana-redbird.svg',
    location: 'Vancouver Island',
    image: '/launchpad/artist-tour.svg',
    gallery: ['/launchpad/artist-tour.svg', '/communities/reps/aiyana-redbird.svg', '/launchpad/travel-fund.svg'],
    goalAmount: 12000,
    raisedAmount: 7800,
    sponsorCount: 46,
    urgencyLabel: 'Travel booking window',
    summary: 'Support a touring program that pairs exhibitions with paid youth workshops and community storytelling sessions.',
    story: 'Aiyana is preparing a multi-stop tour that combines digital art installation, print sales, and youth-facing workshops. The campaign closes the gap between confirmed venue interest and the travel and materials budget needed to make the tour real.',
    useOfFunds: ['Travel and lodging', 'Workshop material kits', 'Venue transport and installation', 'Youth scholarship seats'],
    impactPoints: ['5 host communities engaged', '12 workshop seats reserved', 'Tour materials already in production'],
    tags: ['Artist tour', 'Youth workshops', 'Exhibition support'],
    linkedAccountSlug: 'aiyana-redbird',
    linkedEntityHref: '/digital-arts',
    closesInLabel: '23 days left',
    recentBackers: [
      { name: 'Coastal Print House', amount: 180, note: 'Workshop materials' },
      { name: 'Elaine Morningdew', amount: 75, note: 'Travel support' },
      { name: 'Anonymous backer', amount: 25, note: 'General encouragement' }
    ],
    milestonePlan: [
      { label: 'Travel booking', amount: 3000, detail: 'Lock flights and lodging for the first three stops.' },
      { label: 'Workshop production', amount: 7800, detail: 'Materials, kits, and youth seats for community sessions.' },
      { label: 'Full tour delivery', amount: 12000, detail: 'Covers installation, freight, and complete travel run.' }
    ],
    campaignUpdates: [
      { title: 'First host venue confirmed', detail: 'Aiyana has secured the opening venue and workshop room for stop one.', postedLabel: 'Posted yesterday' },
      { title: 'Youth scholarship seats reserved', detail: 'Twelve workshop seats are already held for community youth participants.', postedLabel: 'Posted 6 days ago' }
    ],
    supportTiers: makeTiers('Tour support', [25, 75, 180, 400], [12, 35, 85, 180])
  },
  {
    id: 'launch-3',
    slug: 'riverstone-youth-athlete-camp',
    category: 'athlete',
    title: 'Sponsor a youth athlete camp pathway for Riverstone runners.',
    subtitle: 'Athlete campaign',
    beneficiaryName: 'Riverstone Youth Track Circle',
    beneficiaryRole: 'Athlete development group',
    beneficiaryImage: '/launchpad/athlete-camp.svg',
    location: 'Northern Plains',
    image: '/launchpad/athlete-camp.svg',
    gallery: ['/launchpad/athlete-camp.svg', '/launchpad/travel-fund.svg', '/launchpad/champion-fund.svg'],
    goalAmount: 6800,
    raisedAmount: 2500,
    sponsorCount: 19,
    urgencyLabel: 'Training season',
    summary: 'Travel, gear, camp fees, and support for Indigenous youth athletes preparing for regional competition.',
    story: 'The Riverstone Youth Track Circle needs camp fees, travel support, and gear funding so athletes are not excluded because of cost. The program is coached locally and tied to community wellness and visibility.',
    useOfFunds: ['Camp registration', 'Travel and lodging', 'Shoes and equipment', 'Nutrition and wellness support'],
    impactPoints: ['11 athletes in cohort', '4 already qualified', 'Local coaching secured'],
    tags: ['Athletes', 'Youth support', 'Travel'],
    closesInLabel: '14 days left',
    recentBackers: [
      { name: 'Riverstone Running Club', amount: 150, note: 'Camp fees' },
      { name: 'Anonymous backer', amount: 28, note: 'Gear support' }
    ],
    milestonePlan: [
      { label: 'Registration floor', amount: 2400, detail: 'Cover essential camp registration fees.' },
      { label: 'Travel and gear', amount: 4600, detail: 'Transport, shoes, and equipment for the cohort.' },
      { label: 'Full athlete support', amount: 6800, detail: 'Nutrition, lodging, and coaching extras.' }
    ],
    campaignUpdates: [
      { title: 'Four athletes qualified', detail: 'Regional qualifying results are in and the camp pathway is now time-sensitive.', postedLabel: 'Posted 3 days ago' }
    ],
    supportTiers: makeTiers('Athlete support', [20, 60, 150, 320], [10, 28, 70, 150])
  },
  {
    id: 'launch-4',
    slug: 'ngarra-language-scholarships',
    category: 'scholarship',
    title: 'Fund Ngarra language scholarships for teacher training.',
    subtitle: 'Scholarship campaign',
    beneficiaryName: 'Ngarra Learning Circle',
    beneficiaryRole: 'Tribe education program',
    beneficiaryImage: '/communities/ngarra-avatar.svg',
    location: 'Central Desert',
    image: '/launchpad/scholarship-circle.svg',
    gallery: ['/launchpad/scholarship-circle.svg', '/communities/ngarra-banner.svg', '/communities/store/ngarra-course-pass.svg'],
    goalAmount: 15000,
    raisedAmount: 9300,
    sponsorCount: 61,
    urgencyLabel: 'School-year intake',
    summary: 'Scholarships for teachers and youth mentors joining language archive and curriculum training programs.',
    story: 'Ngarra is building a stronger language teaching pipeline and needs scholarship support so teachers and youth mentors can train without carrying the entire cost themselves.',
    useOfFunds: ['Training fees', 'Archive orientation stipends', 'Travel to intensive sessions', 'Learning materials'],
    impactPoints: ['14 scholarship candidates identified', '2 elders advising curriculum', 'Archive lessons already scheduled'],
    tags: ['Language', 'Education', 'Scholarships'],
    linkedAccountSlug: 'ngarra-learning-circle',
    linkedEntityHref: '/communities/ngarra-learning-circle',
    closesInLabel: '31 days left',
    recentBackers: [
      { name: 'Learning Futures Fund', amount: 250, note: 'Teacher scholarship pool' },
      { name: 'Archive Friends Circle', amount: 100, note: 'Curriculum support' }
    ],
    milestonePlan: [
      { label: 'First cohort support', amount: 5000, detail: 'Covers the initial teacher and youth mentor places.' },
      { label: 'Travel intensive', amount: 9300, detail: 'Current level supports travel and archive orientation.' },
      { label: 'Full scholarship intake', amount: 15000, detail: 'Enables the complete annual intake to proceed.' }
    ],
    campaignUpdates: [
      { title: 'Curriculum advisors confirmed', detail: 'Two elders are now advising the teaching sequence for the scholarship cohort.', postedLabel: 'Posted 4 days ago' }
    ],
    supportTiers: makeTiers('Scholarship support', [30, 100, 250, 600], [15, 55, 140, 320])
  },
  {
    id: 'launch-5',
    slug: 'northern-emergency-relief-kits',
    category: 'emergency',
    title: 'Emergency relief and reconnection kits for displaced families.',
    subtitle: 'Emergency campaign',
    beneficiaryName: 'Northern Relief Circle',
    beneficiaryRole: 'Emergency mutual aid network',
    beneficiaryImage: '/launchpad/emergency-relief.svg',
    location: 'Northwest territories',
    image: '/launchpad/emergency-relief.svg',
    gallery: ['/launchpad/emergency-relief.svg', '/launchpad/travel-fund.svg', '/launchpad/community-hall.svg'],
    goalAmount: 9800,
    raisedAmount: 6100,
    sponsorCount: 74,
    urgencyLabel: 'Immediate need',
    summary: 'Rapid support for families affected by displacement, with culturally specific supplies and transport assistance.',
    story: 'This campaign helps families facing sudden displacement by funding transport, temporary support, and culturally relevant care kits rather than generic emergency parcels.',
    useOfFunds: ['Transport assistance', 'Emergency kits', 'Temporary accommodation support', 'Coordination and distribution'],
    impactPoints: ['22 families identified', 'Distribution partners ready', 'Priority cases already triaged'],
    tags: ['Emergency', 'Mutual aid', 'Rapid response'],
    closesInLabel: '7 days left',
    recentBackers: [
      { name: 'Northern Mutual Aid', amount: 420, note: 'Critical family support' },
      { name: 'Anonymous backer', amount: 80, note: 'Emergency travel' }
    ],
    milestonePlan: [
      { label: 'Rapid triage', amount: 3000, detail: 'Cover immediate transport and essential emergency kits.' },
      { label: 'Family support block', amount: 6100, detail: 'Current level supports already-identified priority cases.' },
      { label: 'Full emergency reserve', amount: 9800, detail: 'Buffer for new cases and extended accommodation support.' }
    ],
    campaignUpdates: [
      { title: 'Distribution partners activated', detail: 'Community and regional partners are ready to deploy support as funds arrive.', postedLabel: 'Posted today' }
    ],
    supportTiers: makeTiers('Relief support', [25, 80, 180, 420], [12, 36, 90, 200])
  },
  {
    id: 'launch-6',
    slug: 'riverstone-weaving-hall-rebuild',
    category: 'community',
    title: 'Help rebuild the Riverstone weaving hall and market space.',
    subtitle: 'Community campaign',
    beneficiaryName: 'Riverstone Arts Council',
    beneficiaryRole: 'Community entity',
    beneficiaryImage: '/communities/riverstone-avatar.svg',
    location: 'Northern Plains | Riverstone Nation',
    image: '/launchpad/community-hall.svg',
    gallery: ['/launchpad/community-hall.svg', '/communities/riverstone-banner.svg', '/communities/store/riverstone-market-bundle.svg'],
    goalAmount: 22000,
    raisedAmount: 14800,
    sponsorCount: 89,
    urgencyLabel: 'Build season',
    summary: 'A community-owned campaign tied directly to a sovereign page, treasury, and long-term cultural space use.',
    story: 'Riverstone is raising support for a weaving hall and market space that will host sales, teaching, and youth programming. This is tied to the community treasury and long-term operating plan, not a one-off ask.',
    useOfFunds: ['Structural repairs', 'Workshop equipment', 'Public market setup', 'Youth program space'],
    impactPoints: ['Treasury already active', 'Community page verified in progress', 'Featured market inventory queued'],
    tags: ['Community build', 'Weaving hall', 'Treasury-backed'],
    linkedAccountSlug: 'riverstone-arts-council',
    linkedEntityHref: '/communities/riverstone-arts-council',
    closesInLabel: '26 days left',
    recentBackers: [
      { name: 'Plains Women Weavers Guild', amount: 300, note: 'Hall fit-out' },
      { name: 'Makers Circle', amount: 120, note: 'Market-day fixtures' },
      { name: 'Anonymous backer', amount: 65, note: 'Monthly hall support' }
    ],
    milestonePlan: [
      { label: 'Structure secure', amount: 10000, detail: 'Roof, repairs, and immediate hall safety work.' },
      { label: 'Market fit-out', amount: 14800, detail: 'Current level supports workshop equipment and fixtures.' },
      { label: 'Public opening', amount: 22000, detail: 'Finishes the hall and opens the first full market season.' }
    ],
    campaignUpdates: [
      { title: 'Market inventory is being prepared', detail: 'First treasury-linked merchandise sets are already staged for opening season.', postedLabel: 'Posted 2 days ago' },
      { title: 'Builder walkthrough complete', detail: 'The repair sequence is confirmed and tied to the next funding milestone.', postedLabel: 'Posted 1 week ago' }
    ],
    supportTiers: makeTiers('Community build', [40, 120, 300, 800], [20, 65, 150, 360])
  },
  {
    id: 'launch-7',
    slug: 'cedar-coast-founder-lab',
    category: 'entrepreneurship',
    title: 'Fund the Cedar Coast founder lab for Indigenous entrepreneurs.',
    subtitle: 'Entrepreneurship campaign',
    beneficiaryName: 'Cedar Coast Founder Lab',
    beneficiaryRole: 'Entrepreneurship accelerator',
    beneficiaryImage: '/launchpad/founder-lab.svg',
    location: 'Coastal Northwest',
    image: '/launchpad/founder-lab.svg',
    gallery: ['/launchpad/founder-lab.svg', '/launchpad/starter-kits.svg', '/launchpad/artist-tour.svg'],
    goalAmount: 18000,
    raisedAmount: 8400,
    sponsorCount: 35,
    urgencyLabel: 'Cohort selection underway',
    summary: 'Support founder stipends, mentoring, and market-readiness for Indigenous ventures moving from idea to revenue.',
    story: 'The Cedar Coast founder lab is building a cohort of Indigenous entrepreneurs who need early support to validate products, price offers, and launch publicly without losing cultural direction.',
    useOfFunds: ['Founder stipends', 'Mentor honoraria', 'Prototype and branding costs', 'Market-readiness workshops'],
    impactPoints: ['8 founders shortlisted', '3 mentors confirmed', 'Launch showcase venue reserved'],
    tags: ['Entrepreneurship', 'Founders', 'Business growth'],
    closesInLabel: '20 days left',
    recentBackers: [
      { name: 'Cedar Coast Ventures', amount: 260, note: 'Founder stipend support' },
      { name: 'Anonymous backer', amount: 55, note: 'Workshop access' }
    ],
    milestonePlan: [
      { label: 'Mentor base', amount: 4500, detail: 'Lock mentor honoraria and core program delivery.' },
      { label: 'Cohort support', amount: 8400, detail: 'Current level funds stipends and materials for the founder lab.' },
      { label: 'Launch showcase', amount: 18000, detail: 'Supports the full cohort, showcase, and market launch.' }
    ],
    campaignUpdates: [
      { title: 'Founder shortlist published', detail: 'The first eight ventures are now moving into mentor matching.', postedLabel: 'Posted 3 days ago' }
    ],
    supportTiers: makeTiers('Founder support', [35, 100, 260, 700], [18, 55, 125, 300])
  },
  {
    id: 'launch-8',
    slug: 'firebird-business-starter-kits',
    category: 'business-starter',
    title: 'Starter kits for first-time makers building their businesses.',
    subtitle: 'Business starter campaign',
    beneficiaryName: 'Firebird Starter Circle',
    beneficiaryRole: 'Micro-business starter program',
    beneficiaryImage: '/launchpad/starter-kits.svg',
    location: 'Prairie Region',
    image: '/launchpad/starter-kits.svg',
    gallery: ['/launchpad/starter-kits.svg', '/launchpad/founder-lab.svg', '/launchpad/artist-tour.svg'],
    goalAmount: 9500,
    raisedAmount: 3200,
    sponsorCount: 21,
    urgencyLabel: 'Starter intake open',
    summary: 'Fund packaging, equipment, licensing, and first-run inventory support for new Indigenous sellers.',
    story: 'This campaign helps early-stage makers cover the boring but real first costs that stop many businesses before they start: packaging, permits, starter inventory, and launch photography.',
    useOfFunds: ['Starter inventory', 'Licensing and permits', 'Packaging kits', 'Launch photography'],
    impactPoints: ['17 starter applicants', 'Shared vendor support ready', 'Local market dates confirmed'],
    tags: ['Business starter', 'Maker support', 'First launch'],
    closesInLabel: '12 days left',
    recentBackers: [
      { name: 'Prairie Co-op', amount: 160, note: 'Starter inventory kits' },
      { name: 'Anonymous backer', amount: 30, note: 'Permit fees' }
    ],
    milestonePlan: [
      { label: 'Starter materials', amount: 3200, detail: 'Current level covers first-round packaging and permits.' },
      { label: 'Launch kits', amount: 6200, detail: 'Expands support to more applicants with photography included.' },
      { label: 'Full intake support', amount: 9500, detail: 'Completes all starter kits for the intake round.' }
    ],
    campaignUpdates: [
      { title: 'Market dates confirmed', detail: 'The local market schedule is locked, making startup timing much clearer for applicants.', postedLabel: 'Posted 5 days ago' }
    ],
    supportTiers: makeTiers('Starter support', [20, 65, 160, 380], [10, 30, 80, 180])
  },
  {
    id: 'launch-9',
    slug: 'southern-cross-cultural-travel-fund',
    category: 'travel',
    title: 'Travel fund for artists and youth crossing regions for cultural exchange.',
    subtitle: 'Travel campaign',
    beneficiaryName: 'Southern Cross Travel Circle',
    beneficiaryRole: 'Travel support program',
    beneficiaryImage: '/launchpad/travel-fund.svg',
    location: 'Cross-region exchange',
    image: '/launchpad/travel-fund.svg',
    gallery: ['/launchpad/travel-fund.svg', '/launchpad/artist-tour.svg', '/launchpad/scholarship-circle.svg'],
    goalAmount: 11000,
    raisedAmount: 5400,
    sponsorCount: 32,
    urgencyLabel: 'Flights need booking',
    summary: 'Travel support for exchange, showcase attendance, teaching visits, and cultural mobility that would otherwise be unaffordable.',
    story: 'This fund exists for the cost that often kills opportunity: getting there. It supports artists, youth, and cultural workers who already have the invitation or placement but not the fare.',
    useOfFunds: ['Flights and baggage', 'Accommodation support', 'Ground transport', 'Travel coordination'],
    impactPoints: ['9 trips identified', '4 host invitations secured', 'Travel dates already proposed'],
    tags: ['Travel', 'Exchange', 'Mobility support'],
    closesInLabel: '16 days left',
    recentBackers: [
      { name: 'Southern Exchange Fund', amount: 190, note: 'Flight subsidy' },
      { name: 'Anonymous backer', amount: 36, note: 'Travel coordination' }
    ],
    milestonePlan: [
      { label: 'First route booked', amount: 3000, detail: 'Book the first wave of flights and baggage costs.' },
      { label: 'Current trip block', amount: 5400, detail: 'Current support covers several active invitations.' },
      { label: 'Full travel reserve', amount: 11000, detail: 'Allows all identified exchange trips to proceed.' }
    ],
    campaignUpdates: [
      { title: 'Host invitations secured', detail: 'Four host communities are already confirmed for incoming artists and youth.', postedLabel: 'Posted 2 days ago' }
    ],
    supportTiers: makeTiers('Travel support', [25, 70, 190, 420], [12, 36, 92, 210])
  }
];

export function listLaunchpadCampaigns() {
  return seedLaunchpadCampaigns;
}

export function getLaunchpadCampaignBySlug(slug: string) {
  return seedLaunchpadCampaigns.find((campaign) => campaign.slug === slug) || null;
}

export function getLaunchpadCategoryLabel(category: LaunchpadCategory) {
  return launchpadCategoryMeta[category].label;
}

export function getLaunchpadSupportTiers(campaign: LaunchpadCampaign, cadence: LaunchpadCadence) {
  return cadence === 'monthly' ? campaign.supportTiers.monthly : campaign.supportTiers.oneTime;
}

export function calculateLaunchpadQuote(subtotal: number): LaunchpadQuote {
  const safeSubtotal = Math.max(0, Number(subtotal || 0));
  const platformFee = Number((safeSubtotal * LAUNCHPAD_PLATFORM_FEE_RATE).toFixed(2));
  const processorFee = safeSubtotal > 0 ? Number((safeSubtotal * LAUNCHPAD_PROCESSOR_RATE + LAUNCHPAD_PROCESSOR_FIXED).toFixed(2)) : 0;
  const total = Number((safeSubtotal + platformFee + processorFee).toFixed(2));
  const beneficiaryNet = Number((safeSubtotal - processorFee).toFixed(2));
  return { subtotal: safeSubtotal, platformFee, processorFee, total, beneficiaryNet };
}
