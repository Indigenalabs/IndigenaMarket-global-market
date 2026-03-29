export type MonetizationPillarId =
  | 'digital-arts'
  | 'physical-items'
  | 'courses'
  | 'freelancing'
  | 'cultural-tourism'
  | 'language-heritage'
  | 'land-food'
  | 'advocacy-legal'
  | 'materials-tools'
  | 'seva';

export type CreatorPlanId = 'free' | 'creator' | 'studio';
export type MemberPlanId = 'free' | 'community' | 'patron' | 'all-access';
export type AccessPlanId =
  | 'digital-arts-pass'
  | 'heritage-archive-pass'
  | 'seva-impact-pass'
  | 'tourism-explorer-pass'
  | 'creative-pro-pass'
  | 'all-access-pass'
  | 'basic-archive'
  | 'researcher-access'
  | 'institutional-archive';
export type TeamPlanId = 'collective' | 'hub' | 'organization';
export type LifetimePlanId = 'founder' | 'elder';

export interface PlanFeature {
  label: string;
  emphasis?: boolean;
}

export interface MemberPlan {
  id: MemberPlanId;
  family: 'member';
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: PlanFeature[];
  badge?: string;
  highlight?: string;
  popular?: boolean;
}

export interface CreatorPlan {
  id: CreatorPlanId;
  family: 'creator';
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  feeRateDiscountBps: number;
  features: PlanFeature[];
  badge?: string;
  popular?: boolean;
}

export interface AccessPlan {
  id: AccessPlanId;
  family: 'access';
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  scope: 'pillar' | 'archive' | 'all-access';
  features: PlanFeature[];
  highlight?: string;
  badge?: string;
}

export interface TeamPlan {
  id: TeamPlanId;
  family: 'team';
  name: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  seatCount: string;
  description: string;
  features: PlanFeature[];
  ctaLabel: string;
  badge?: string;
  highlighted?: boolean;
}

export interface LifetimePlan {
  id: LifetimePlanId;
  family: 'lifetime';
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  badge?: string;
  featured?: boolean;
  valueLabel?: string;
}

export interface PillarFeePolicy {
  pillar: MonetizationPillarId;
  label: string;
  minRate: number;
  maxRate: number;
  defaultRate: number;
  creatorKeepsRange: string;
  notes: string;
  creatorPlanFloorRate?: number;
  buyerFeeWaivedByPatron?: boolean;
}

export interface TransactionQuoteInput {
  pillar: MonetizationPillarId;
  subtotal: number;
  creatorPlanId?: CreatorPlanId;
  memberPlanId?: MemberPlanId;
  shippingFee?: number;
  escrowProtected?: boolean;
  includePhysicalProtection?: boolean;
}

export interface TransactionQuote {
  subtotal: number;
  shippingFee: number;
  buyerServiceFee: number;
  escrowFee: number;
  buyerTotal: number;
  platformFee: number;
  creatorNet: number;
  effectiveCreatorRate: number;
  creatorKeepsPercent: number;
  policy: PillarFeePolicy;
}

export const MEMBER_PLANS: MemberPlan[] = [
  {
    id: 'free',
    family: 'member',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Browse and discover across every pillar.',
    features: [
      { label: 'Browse all collections' },
      { label: 'Basic profile and favourites' },
      { label: 'Community discussions and newsletter' }
    ]
  },
  {
    id: 'community',
    family: 'member',
    name: 'Community',
    monthlyPrice: 4.99,
    annualPrice: 49.9,
    description: 'For supporters who want a cleaner, deeper browsing experience.',
    badge: 'Ad-free browsing',
    features: [
      { label: 'Ad-free browsing' },
      { label: 'Supporter badge and monthly newsletter' },
      { label: 'Basic archive access and unlimited favourites' }
    ]
  },
  {
    id: 'patron',
    family: 'member',
    name: 'Patron',
    monthlyPrice: 29.99,
    annualPrice: 299.9,
    description: 'For serious collectors and repeat buyers.',
    badge: 'Buyer-fee perks',
    features: [
      { label: '0% buyer fees where eligible', emphasis: true },
      { label: '24-hour early access to drops' },
      { label: 'VIP events and curator alerts' }
    ]
  },
  {
    id: 'all-access',
    family: 'member',
    name: 'All-Access',
    monthlyPrice: 14.99,
    annualPrice: 149.9,
    description: 'Best value for members who want broad access across pillars.',
    highlight: 'Save against multiple passes',
    popular: true,
    features: [
      { label: 'Everything in Community' },
      { label: 'Cross-pillar access perks' },
      { label: 'Premium archive and supporter benefits' }
    ]
  }
];

export const CREATOR_PLANS: CreatorPlan[] = [
  {
    id: 'free',
    family: 'creator',
    name: 'Creator Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Start publishing and selling with standard platform fees.',
    feeRateDiscountBps: 0,
    features: [
      { label: 'Basic storefront and listings' },
      { label: 'Standard transaction fees' },
      { label: 'Core Creator Hub tools' }
    ]
  },
  {
    id: 'creator',
    family: 'creator',
    name: 'Creator',
    monthlyPrice: 9.99,
    annualPrice: 99.9,
    description: 'For active sellers who want lower fees and stronger analytics.',
    feeRateDiscountBps: 300,
    badge: 'Reduced fees',
    popular: true,
    features: [
      { label: 'Reduced transaction fees where eligible', emphasis: true },
      { label: 'Unlimited listings and deeper analytics' },
      { label: 'Priority creator tools and support' }
    ]
  },
  {
    id: 'studio',
    family: 'creator',
    name: 'Studio / Team',
    monthlyPrice: 29.99,
    annualPrice: 299.9,
    description: 'For collectives, hubs, and multi-creator operations.',
    feeRateDiscountBps: 300,
    badge: 'Shared workspace',
    features: [
      { label: '5 creator seats and shared analytics' },
      { label: 'Reduced fees plus team workflows' },
      { label: 'Bulk listing and collaboration tools' }
    ]
  }
];

export const ACCESS_PLANS: AccessPlan[] = [
  {
    id: 'digital-arts-pass',
    family: 'access',
    name: 'Digital Arts Pass',
    monthlyPrice: 3.99,
    annualPrice: 39.9,
    description: 'Unlock premium digital art drops and artist extras.',
    scope: 'pillar',
    features: [
      { label: 'Early access to digital releases' },
      { label: 'Drop alerts and artist extras' }
    ]
  },
  {
    id: 'heritage-archive-pass',
    family: 'access',
    name: 'Heritage Archive Pass',
    monthlyPrice: 4.99,
    annualPrice: 49.9,
    description: 'Premium archive and language resources.',
    scope: 'pillar',
    features: [
      { label: 'Extended archive access' },
      { label: 'Language tools and recordings' }
    ]
  },
  {
    id: 'seva-impact-pass',
    family: 'access',
    name: 'Seva Impact Pass',
    monthlyPrice: 5.99,
    annualPrice: 59.9,
    description: 'Deeper impact reporting and community updates.',
    scope: 'pillar',
    features: [
      { label: 'Project impact reports' },
      { label: 'Community updates and donor recognition' }
    ]
  },
  {
    id: 'tourism-explorer-pass',
    family: 'access',
    name: 'Tourism Explorer',
    monthlyPrice: 4.99,
    annualPrice: 49.9,
    description: 'Travel-planning tools and preferred booking access.',
    scope: 'pillar',
    features: [
      { label: 'Experience discounts and planning tools' },
      { label: 'Cultural etiquette guides' }
    ]
  },
  {
    id: 'creative-pro-pass',
    family: 'access',
    name: 'Creative Pro Pass',
    monthlyPrice: 6.99,
    annualPrice: 69.9,
    description: 'For buyers and clients who work heavily in the service pillars.',
    scope: 'pillar',
    features: [
      { label: 'Priority project matching' },
      { label: 'Direct messaging and templates' }
    ]
  },
  {
    id: 'all-access-pass',
    family: 'access',
    name: 'All-Access Pass',
    monthlyPrice: 14.99,
    annualPrice: 149.9,
    description: 'Best value if you want multiple pillar passes.',
    scope: 'all-access',
    badge: 'Best value',
    highlight: 'Save versus buying multiple passes',
    features: [
      { label: 'All pillar passes included' },
      { label: 'Cross-pillar perks and exclusive drops' }
    ]
  },
  {
    id: 'basic-archive',
    family: 'access',
    name: 'Basic Archive',
    monthlyPrice: 3,
    annualPrice: 30,
    description: 'Entry-level archive access.',
    scope: 'archive',
    features: [
      { label: 'Public recordings and limited downloads' },
      { label: 'Basic archive search' }
    ]
  },
  {
    id: 'researcher-access',
    family: 'access',
    name: 'Researcher Access',
    monthlyPrice: 20,
    annualPrice: 200,
    description: 'For deep archive work and citation-ready research.',
    scope: 'archive',
    features: [
      { label: 'Full archive tools and citation export' },
      { label: 'Advanced search and download options' }
    ]
  },
  {
    id: 'institutional-archive',
    family: 'access',
    name: 'Institutional Archive',
    monthlyPrice: 100,
    annualPrice: 1000,
    description: 'Institutional archive access for up to 50 users.',
    scope: 'archive',
    features: [
      { label: 'Up to 50 seats' },
      { label: 'Institutional governance and reporting' }
    ]
  }
];

export const TEAM_PLANS: TeamPlan[] = [
  {
    id: 'collective',
    family: 'team',
    name: 'Small Collective',
    monthlyPrice: 29.99,
    annualPrice: 299.9,
    seatCount: '5 seats',
    description: 'Shared tools for a small creative collective.',
    ctaLabel: 'Start collective plan',
    badge: 'Save versus solo plans',
    features: [
      { label: '5 creator accounts' },
      { label: 'Shared analytics dashboard' },
      { label: 'Collaborative collections and branding' }
    ]
  },
  {
    id: 'hub',
    family: 'team',
    name: 'Community Hub',
    monthlyPrice: 99,
    annualPrice: 990,
    seatCount: '20 seats',
    description: 'For community-run hubs and larger creator operations.',
    ctaLabel: 'Start hub plan',
    badge: 'Priority support',
    highlighted: true,
    features: [
      { label: '20 creator accounts' },
      { label: 'Bulk listing and hub analytics' },
      { label: 'Community manager workflow' }
    ]
  },
  {
    id: 'organization',
    family: 'team',
    name: 'Nation / Organization',
    monthlyPrice: null,
    annualPrice: null,
    seatCount: 'Custom seats',
    description: 'Contract-based access for large institutions.',
    ctaLabel: 'Contact sales',
    features: [
      { label: 'API access and onboarding' },
      { label: 'Dedicated support and custom contracts' },
      { label: 'Institution-grade controls' }
    ]
  }
];

export const LIFETIME_PLANS: LifetimePlan[] = [
  {
    id: 'founder',
    family: 'lifetime',
    name: "Founder's Circle",
    price: 499,
    description: 'Lifetime Patron access with founder recognition.',
    badge: 'Limited availability',
    valueLabel: '$15,000+ projected lifetime value',
    features: [
      { label: 'Lifetime Patron tier access' },
      { label: 'Founding member recognition' },
      { label: 'Annual founders-only event' }
    ]
  },
  {
    id: 'elder',
    family: 'lifetime',
    name: "Elder's Legacy",
    price: 999,
    description: 'Lifetime All-Access with legacy recognition and annual gift.',
    badge: 'Most prestigious',
    featured: true,
    valueLabel: '$50,000+ projected lifetime value',
    features: [
      { label: 'Lifetime All-Access pass' },
      { label: 'Annual physical gift from community' },
      { label: 'Legacy recognition and priority support' }
    ]
  }
];

export const PILLAR_FEE_POLICIES: Record<MonetizationPillarId, PillarFeePolicy> = {
  'digital-arts': {
    pillar: 'digital-arts',
    label: 'Digital Arts',
    minRate: 0.05,
    maxRate: 0.08,
    defaultRate: 0.08,
    creatorKeepsRange: '92-95%',
    notes: 'Lower rates for high-volume digital releases, higher for premium or limited editions.',
    creatorPlanFloorRate: 0.05,
    buyerFeeWaivedByPatron: true
  },
  'physical-items': {
    pillar: 'physical-items',
    label: 'Physical Items',
    minRate: 0.03,
    maxRate: 0.05,
    defaultRate: 0.05,
    creatorKeepsRange: '95-97%',
    notes: 'Competitive marketplace rate with protection and packaging ops supported separately.',
    creatorPlanFloorRate: 0.03,
    buyerFeeWaivedByPatron: true
  },
  courses: {
    pillar: 'courses',
    label: 'Courses',
    minRate: 0.06,
    maxRate: 0.1,
    defaultRate: 0.08,
    creatorKeepsRange: '90-94%',
    notes: 'Supports hosting, enrolment tools, and learner support.',
    creatorPlanFloorRate: 0.06,
    buyerFeeWaivedByPatron: true
  },
  freelancing: {
    pillar: 'freelancing',
    label: 'Freelancing',
    minRate: 0.06,
    maxRate: 0.1,
    defaultRate: 0.08,
    creatorKeepsRange: '90-94%',
    notes: 'Escrow protection can add a separate client-side service fee.',
    creatorPlanFloorRate: 0.06,
    buyerFeeWaivedByPatron: true
  },
  'cultural-tourism': {
    pillar: 'cultural-tourism',
    label: 'Cultural Tourism',
    minRate: 0.06,
    maxRate: 0.08,
    defaultRate: 0.07,
    creatorKeepsRange: '92-94%',
    notes: 'Aligned with guided-experience and booking marketplace norms.',
    creatorPlanFloorRate: 0.06,
    buyerFeeWaivedByPatron: true
  },
  'language-heritage': {
    pillar: 'language-heritage',
    label: 'Language & Heritage',
    minRate: 0.05,
    maxRate: 0.08,
    defaultRate: 0.06,
    creatorKeepsRange: '92-95%',
    notes: 'Reduced rates help community-controlled archive and learning materials stay accessible.',
    creatorPlanFloorRate: 0.05,
    buyerFeeWaivedByPatron: true
  },
  'land-food': {
    pillar: 'land-food',
    label: 'Land & Food',
    minRate: 0.04,
    maxRate: 0.06,
    defaultRate: 0.05,
    creatorKeepsRange: '94-96%',
    notes: 'Designed to keep producer-to-consumer sales affordable.',
    creatorPlanFloorRate: 0.04,
    buyerFeeWaivedByPatron: true
  },
  'advocacy-legal': {
    pillar: 'advocacy-legal',
    label: 'Advocacy & Legal',
    minRate: 0.05,
    maxRate: 0.08,
    defaultRate: 0.06,
    creatorKeepsRange: '92-95%',
    notes: 'Part of the platform fee supports trust, intake, and defense-support operations.',
    creatorPlanFloorRate: 0.05,
    buyerFeeWaivedByPatron: true
  },
  'materials-tools': {
    pillar: 'materials-tools',
    label: 'Materials & Tools',
    minRate: 0.04,
    maxRate: 0.06,
    defaultRate: 0.05,
    creatorKeepsRange: '94-96%',
    notes: 'Low rate to keep sourcing and tool access affordable.',
    creatorPlanFloorRate: 0.04,
    buyerFeeWaivedByPatron: true
  },
  seva: {
    pillar: 'seva',
    label: 'Seva',
    minRate: 0,
    maxRate: 0,
    defaultRate: 0,
    creatorKeepsRange: '100%',
    notes: 'Donation flows remain fee-free at the platform transaction layer.',
    creatorPlanFloorRate: 0,
    buyerFeeWaivedByPatron: true
  }
};

export const CREATOR_PLAN_LOOKUP: Record<CreatorPlanId, CreatorPlan> = Object.fromEntries(
  CREATOR_PLANS.map((plan) => [plan.id, plan])
) as Record<CreatorPlanId, CreatorPlan>;

export const MEMBER_PLAN_LOOKUP: Record<MemberPlanId, MemberPlan> = Object.fromEntries(
  MEMBER_PLANS.map((plan) => [plan.id, plan])
) as Record<MemberPlanId, MemberPlan>;

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getPillarFeePolicy(pillar: MonetizationPillarId) {
  return PILLAR_FEE_POLICIES[pillar];
}

export function getEffectiveCreatorFeeRate(pillar: MonetizationPillarId, creatorPlanId: CreatorPlanId = 'free') {
  const policy = getPillarFeePolicy(pillar);
  const discount = (CREATOR_PLAN_LOOKUP[creatorPlanId]?.feeRateDiscountBps ?? 0) / 10000;
  const discountedRate = Math.max(policy.defaultRate - discount, policy.creatorPlanFloorRate ?? policy.minRate);
  return roundCurrency(discountedRate);
}

export function calculateTransactionQuote({
  pillar,
  subtotal,
  creatorPlanId = 'free',
  memberPlanId = 'free',
  shippingFee = 0,
  escrowProtected = false,
  includePhysicalProtection = false
}: TransactionQuoteInput): TransactionQuote {
  const safeSubtotal = Math.max(0, subtotal);
  const policy = getPillarFeePolicy(pillar);
  const effectiveCreatorRate = getEffectiveCreatorFeeRate(pillar, creatorPlanId);
  const platformFee = roundCurrency(safeSubtotal * effectiveCreatorRate);
  const creatorNet = roundCurrency(safeSubtotal - platformFee);

  const patronWaivesBuyerFees = memberPlanId === 'patron' && policy.buyerFeeWaivedByPatron;
  const buyerServiceFee = patronWaivesBuyerFees
    ? 0
    : includePhysicalProtection && pillar === 'physical-items' && safeSubtotal > 0
      ? roundCurrency(Math.max(8, safeSubtotal * 0.03))
      : 0;
  const escrowFee = patronWaivesBuyerFees
    ? 0
    : escrowProtected && safeSubtotal > 0
      ? roundCurrency(safeSubtotal * 0.01)
      : 0;

  return {
    subtotal: roundCurrency(safeSubtotal),
    shippingFee: roundCurrency(shippingFee),
    buyerServiceFee,
    escrowFee,
    buyerTotal: roundCurrency(safeSubtotal + shippingFee + buyerServiceFee + escrowFee),
    platformFee,
    creatorNet,
    effectiveCreatorRate,
    creatorKeepsPercent: roundCurrency((1 - effectiveCreatorRate) * 100),
    policy
  };
}

export function formatMoney(value: number, currency: 'USD' | 'INDI' = 'USD') {
  const rounded = roundCurrency(value);
  return currency === 'INDI' ? `${rounded.toLocaleString()} INDI` : `$${rounded.toLocaleString()}`;
}

export function getAnnualSavings(monthlyPrice: number, annualPrice: number) {
  if (!monthlyPrice || !annualPrice) return 0;
  return roundCurrency(monthlyPrice * 12 - annualPrice);
}

