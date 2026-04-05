import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import type { PlatformAccountMemberRecord, PlatformAccountRecord, RevenueSplitRuleRecord } from '@/app/lib/platformAccounts';
import { applyLaunchWindowState, getOfferingCtaLabel, getOfferingImage, shouldShowOfferingInStorefront } from '@/app/profile/lib/offeringMerchandising';
import { creatorProfiles, type ProfileOffering } from '@/app/profile/data/profileShowcase';

export interface CommunityStorefrontItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  priceLabel: string;
  image: string;
  pillarLabel: string;
  splitLabel: string;
  splitRuleId?: string;
  ctaLabel: string;
  href: string;
  sourceHref?: string;
  ownerProfileSlug?: string;
  status?: string;
  availabilityLabel?: string;
}

export interface CommunitySupportGoal {
  id: string;
  title: string;
  summary: string;
  currentAmount: number;
  targetAmount: number;
  image: string;
  ctaHref: string;
  ctaLabel: string;
}

export interface CommunityRepresentativeProfile {
  actorId: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  focusAreas: string[];
}

export interface CommunityEntityPresentation {
  banner: string;
  avatar: string;
  storefrontItems: CommunityStorefrontItem[];
  supportGoals: CommunitySupportGoal[];
  representativeProfiles: CommunityRepresentativeProfile[];
  activePillars: string[];
}

const MEDIA_OVERRIDES: Record<string, { banner: string; avatar: string }> = {
  'riverstone-arts-council': {
    banner: '/communities/riverstone-banner.svg',
    avatar: '/communities/riverstone-avatar.svg'
  },
  'ngarra-learning-circle': {
    banner: '/communities/ngarra-banner.svg',
    avatar: '/communities/ngarra-avatar.svg'
  },
  'aiyana-redbird': {
    banner: '/launchpad/artist-tour.svg',
    avatar: '/communities/reps/aiyana-redbird.svg'
  },
  'talia-riverstone-champion': {
    banner: '/launchpad/champion-fund.svg',
    avatar: '/communities/reps/talia-riverstone.svg'
  }
};

const REPRESENTATIVE_COPY: Record<string, Omit<CommunityRepresentativeProfile, 'role'>> = {
  'actor-riverstone-steward': {
    actorId: 'actor-riverstone-steward',
    name: 'Talia Riverstone',
    image: '/communities/reps/talia-riverstone.svg',
    bio: 'Coordinates treasury-facing launches, seller onboarding, and regional support so the community page behaves like a working storefront, not a dormant profile.',
    focusAreas: ['Treasury routing', 'Seller onboarding', 'Launch coordination']
  },
  'actor-aiyana': {
    actorId: 'actor-aiyana',
    name: 'Aiyana Redbird',
    image: '/communities/reps/aiyana-redbird.svg',
    bio: 'Leads creator collaborations, merchandising direction, and cultural product presentation across the community storefront.',
    focusAreas: ['Merchandising', 'Creator editing', 'Campaign storytelling']
  },
  'actor-ngarra-chair': {
    actorId: 'actor-ngarra-chair',
    name: 'Marra Ngarra',
    image: '/communities/reps/marra-ngarra.svg',
    bio: 'Oversees community-controlled education income, restricted funds, and the governance standards attached to archive and course access.',
    focusAreas: ['Restricted funds', 'Education programs', 'Treasury oversight']
  },
  'actor-elder-lila': {
    actorId: 'actor-elder-lila',
    name: 'Elder Lila',
    image: '/communities/reps/elder-lila.svg',
    bio: 'Guides protocol, teaching approval, and the cultural boundaries around what can be published, sold, or shared through the entity page.',
    focusAreas: ['Protocol review', 'Language stewardship', 'Cultural approvals']
  }
};

const STOREFRONT_ITEMS: Record<string, CommunityStorefrontItem[]> = {
  'riverstone-arts-council': [
    {
      id: 'riverstone-market-bundle',
      title: 'Riverstone Market Bundle',
      subtitle: 'Textiles, prints, and market-day packaging',
      description: 'A community-owned retail set assembled for public market weekends and treasury-backed online drops.',
      priceLabel: '$180',
      image: '/communities/store/riverstone-market-bundle.svg',
      pillarLabel: 'Physical items',
      splitLabel: '70% makers | 30% community treasury',
      ctaLabel: 'Shop the bundle',
      href: '/physical-items?item=3'
    },
    {
      id: 'riverstone-workshop-seat',
      title: 'Weaving Workshop Seat',
      subtitle: 'Guided class with material pack included',
      description: 'A paid workshop seat tied directly to the weaving hall build-out and community teaching calendar.',
      priceLabel: '$95',
      image: '/communities/store/riverstone-workshop-seat.svg',
      pillarLabel: 'Courses + events',
      splitLabel: '60% instructors | 40% hall fund',
      ctaLabel: 'Reserve a seat',
      href: '/courses/1'
    },
    {
      id: 'riverstone-hall-pass',
      title: 'Hall Opening Pass',
      subtitle: 'Founding support pass for the rebuilt market space',
      description: 'A limited pass that backs fit-out costs while guaranteeing access to the first community market and exhibition night.',
      priceLabel: '$140',
      image: '/communities/store/riverstone-hall-pass.svg',
      pillarLabel: 'Community support',
      splitLabel: '100% treasury-backed build goal',
      ctaLabel: 'Back the opening',
      href: '/launchpad/riverstone-weaving-hall-rebuild'
    },
    {
      id: 'riverstone-cultural-tour',
      title: 'Riverstone Market Weekend',
      subtitle: 'Tour, hall visit, and maker showcase',
      description: 'A cross-pillar experience package that combines tourism, community commerce, and live teaching under the entity page.',
      priceLabel: '$220',
      image: '/launchpad/community-hall.svg',
      pillarLabel: 'Cultural tourism',
      splitLabel: 'Host circle + community treasury',
      ctaLabel: 'Reserve the weekend',
      href: '/cultural-tourism/experiences/tour-001'
    },
    {
      id: 'riverstone-language-pack',
      title: 'Riverstone Language Pack',
      subtitle: 'Introductory recordings and guided glossary',
      description: 'A community-issued language pack that routes funds into youth teaching and archive maintenance.',
      priceLabel: '$48',
      image: '/communities/store/ngarra-archive-kit.svg',
      pillarLabel: 'Language & heritage',
      splitLabel: 'Archive stewardship treasury',
      ctaLabel: 'Open the pack',
      href: '/language-heritage/recordings/lh-4'
    }
  ],
  'ngarra-learning-circle': [
    {
      id: 'ngarra-course-pass',
      title: 'Ngarra Course Pass',
      subtitle: 'Language learning with guided weekly instruction',
      description: 'A tribe-owned education pass that routes income into teaching and archive stewardship rather than a single instructor wallet.',
      priceLabel: '$120',
      image: '/communities/store/ngarra-course-pass.svg',
      pillarLabel: 'Courses',
      splitLabel: '85% education treasury | 15% elder honorarium',
      ctaLabel: 'Start learning',
      href: '/courses/1'
    },
    {
      id: 'ngarra-archive-kit',
      title: 'Archive Access Kit',
      subtitle: 'Approved recordings, glossary tools, and study guide',
      description: 'Curated access for learners working within approved protocols and community education pathways.',
      priceLabel: '$68',
      image: '/communities/store/ngarra-archive-kit.svg',
      pillarLabel: 'Language & heritage',
      splitLabel: 'Restricted education fund',
      ctaLabel: 'Open the archive kit',
      href: '/language-heritage/recordings/lh-2'
    },
    {
      id: 'ngarra-teaching-pack',
      title: 'Teaching Pack',
      subtitle: 'Classroom-ready language materials',
      description: 'A teaching bundle for classrooms and community mentors, paired with training support and archive orientation.',
      priceLabel: '$210',
      image: '/communities/store/ngarra-teaching-pack.svg',
      pillarLabel: 'Education resources',
      splitLabel: 'Treasury-backed teaching support',
      ctaLabel: 'Request the pack',
      href: '/materials-tools/product/mt-101'
    },
    {
      id: 'ngarra-mentor-session',
      title: 'Mentor Session',
      subtitle: 'Teacher orientation with archive guidance',
      description: 'A paid guidance session for educators and facilitators entering the Ngarra learning pathway.',
      priceLabel: '$150',
      image: '/communities/store/ngarra-teaching-pack.svg',
      pillarLabel: 'Freelancing + education',
      splitLabel: 'Education treasury + elder honorarium',
      ctaLabel: 'Book a session',
      href: '/freelancing?service=1'
    },
    {
      id: 'ngarra-protocol-notes',
      title: 'Protocol Notes Bundle',
      subtitle: 'Teaching and archive use guidelines',
      description: 'A reference bundle for schools and organizations using approved archive and language resources correctly.',
      priceLabel: '$58',
      image: '/communities/store/ngarra-course-pass.svg',
      pillarLabel: 'Advocacy & legal',
      splitLabel: 'Restricted education fund',
      ctaLabel: 'Get the bundle',
      href: '/advocacy-legal/resource/template-artist-license'
    }
  ]
};

const SUPPORT_GOALS: Record<string, CommunitySupportGoal[]> = {
  'riverstone-arts-council': [
    {
      id: 'riverstone-hall-rebuild',
      title: 'Weaving hall rebuild',
      summary: 'Community-owned build campaign tied to the treasury and live market programming.',
      currentAmount: 14800,
      targetAmount: 22000,
      image: '/launchpad/community-hall.svg',
      ctaHref: '/launchpad/riverstone-weaving-hall-rebuild',
      ctaLabel: 'Support this goal'
    },
    {
      id: 'riverstone-youth-market-stipends',
      title: 'Youth market stipends',
      summary: 'Starter capital and sales coaching for younger makers joining the first public market season.',
      currentAmount: 4200,
      targetAmount: 8000,
      image: '/launchpad/starter-kits.svg',
      ctaHref: '/communities/riverstone-arts-council/treasury',
      ctaLabel: 'View treasury route'
    }
  ],
  'ngarra-learning-circle': [
    {
      id: 'ngarra-language-scholarships',
      title: 'Language scholarship circle',
      summary: 'Scholarships for teachers and youth mentors entering training and archive pathways.',
      currentAmount: 9300,
      targetAmount: 15000,
      image: '/launchpad/scholarship-circle.svg',
      ctaHref: '/launchpad/ngarra-language-scholarships',
      ctaLabel: 'Back scholarships'
    },
    {
      id: 'ngarra-archive-expansion',
      title: 'Archive stewardship expansion',
      summary: 'Restricted support for archive facilitation, approvals, and community teaching materials.',
      currentAmount: 6100,
      targetAmount: 11000,
      image: '/communities/store/ngarra-archive-kit.svg',
      ctaHref: '/communities/ngarra-learning-circle/treasury',
      ctaLabel: 'View restricted fund'
    }
  ]
};

function metadataValue(metadata: string[] | undefined, prefix: string) {
  const match = (metadata || []).find((entry) => entry.startsWith(prefix));
  return match ? match.replace(prefix, '').trim() : '';
}

function liveOfferingToStorefrontItem(account: PlatformAccountRecord, offering: ProfileOffering, ownerProfileSlug?: string): CommunityStorefrontItem {
  const normalized = applyLaunchWindowState(offering);
  return {
    id: offering.id,
    title: offering.title,
    subtitle: offering.type || normalized.status || 'Community offering',
    description: offering.blurb,
    priceLabel: offering.priceLabel,
    image: getOfferingImage(normalized),
    pillarLabel: offering.pillarLabel,
    splitLabel: metadataValue(offering.metadata, 'Split rule:') || metadataValue(offering.metadata, 'Treasury route:') || 'Community treasury routing',
    splitRuleId: metadataValue(offering.metadata, 'Split rule id:') || undefined,
    ctaLabel: getOfferingCtaLabel(normalized),
    href: `/communities/${account.slug}/store/${offering.id}`,
    sourceHref: offering.href,
    ownerProfileSlug,
    status: normalized.status,
    availabilityLabel: normalized.availabilityLabel
  };
}

function decorateStaticItems(account: PlatformAccountRecord, items: CommunityStorefrontItem[]) {
  return items.map((item) => ({
    ...item,
    href: `/communities/${account.slug}/store/${item.id}`,
    sourceHref: item.href,
    splitRuleId: undefined,
    status: 'Active',
    availabilityLabel: 'Community storefront'
  }));
}

async function listLiveCommunityStorefrontItems(
  account: PlatformAccountRecord
): Promise<CommunityStorefrontItem[]> {
  const storefrontLabel = `Storefront: ${account.displayName}`;

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('creator_profile_offerings')
      .select('*')
      .contains('metadata', [storefrontLabel])
      .order('updated_at', { ascending: false });

    const mapped = ((data || []) as Array<Record<string, unknown>>)
      .map((row) => {
        const offering: ProfileOffering = {
          id: String(row.id || ''),
          title: String(row.title || 'Untitled offering'),
          pillar: String(row.pillar || 'digital-arts') as ProfileOffering['pillar'],
          pillarLabel: String(row.pillar_label || 'Community offer'),
          icon: String(row.icon || ''),
          type: String(row.offering_type || 'Community offering'),
          priceLabel: String(row.price_label || 'Contact'),
          image: String(row.image_url || ''),
          href: String(row.href || ''),
          blurb: String(row.blurb || ''),
          status: String(row.status || 'Draft'),
          coverImage: String(row.cover_image_url || ''),
          ctaMode: String(row.cta_mode || 'view') as ProfileOffering['ctaMode'],
          ctaPreset: String(row.cta_preset || '') as ProfileOffering['ctaPreset'],
          merchandisingRank: Number(row.merchandising_rank || 0),
          galleryOrder: Array.isArray(row.gallery_order) ? (row.gallery_order as string[]) : [],
          launchWindowStartsAt: String(row.launch_window_starts_at || ''),
          launchWindowEndsAt: String(row.launch_window_ends_at || ''),
          availabilityLabel: String(row.availability_label || ''),
          availabilityTone: String(row.availability_tone || 'default') as ProfileOffering['availabilityTone'],
          featured: Boolean(row.featured),
          metadata: Array.isArray(row.metadata) ? (row.metadata as string[]) : []
        };
        return offering;
      })
      .filter((offering) => shouldShowOfferingInStorefront(offering));

    if (mapped.length > 0) {
      return mapped.map((offering) =>
        liveOfferingToStorefrontItem(
          account,
          offering,
          creatorProfiles.find((profile) => profile.offerings.some((entry) => entry.id === offering.id))?.slug
        )
      );
    }
  }

  return creatorProfiles
    .flatMap((profile) =>
      profile.offerings
        .filter((offering) => (offering.metadata || []).includes(storefrontLabel) && shouldShowOfferingInStorefront(offering))
        .map((offering) => liveOfferingToStorefrontItem(account, offering, profile.slug))
    );
}

export async function getCommunityEntityPresentation(
  account: PlatformAccountRecord,
  members: PlatformAccountMemberRecord[],
  splitRules: RevenueSplitRuleRecord[]
): Promise<CommunityEntityPresentation> {
  const media = MEDIA_OVERRIDES[account.slug] || { banner: account.banner, avatar: account.avatar };
  const representativeProfiles: CommunityRepresentativeProfile[] = members.map((member) => {
    const copy = REPRESENTATIVE_COPY[member.actorId];
    return {
      actorId: member.actorId,
      name: copy?.name || member.displayName,
      role: member.role.replace('-', ' '),
      image: copy?.image || media.avatar,
      bio: copy?.bio || 'Representative profile copy is pending for this entity.',
      focusAreas: copy?.focusAreas || member.permissions.slice(0, 3).map((entry) => entry.replace(/_/g, ' '))
    };
  });

  const runtimeFallbackItems = decorateStaticItems(account, STOREFRONT_ITEMS[account.slug] || []);
  const liveItems = await listLiveCommunityStorefrontItems(account);
  const baseItems = liveItems.length > 0 ? liveItems : runtimeFallbackItems;
  const splitAwareItems = baseItems.map((item) => {
    const matchingRule = splitRules.find((rule) => rule.offeringLabel.toLowerCase().includes(item.title.split(' ')[0].toLowerCase()));
    return matchingRule
      ? {
          ...item,
          splitLabel: matchingRule.beneficiaries.map((entry) => `${entry.label} ${entry.percentage}%`).join(' | '),
          splitRuleId: matchingRule.id
        }
      : item;
  });

  return {
    banner: media.banner,
    avatar: media.avatar,
    storefrontItems: splitAwareItems,
    supportGoals: SUPPORT_GOALS[account.slug] || [],
    representativeProfiles,
    activePillars: Array.from(new Set(splitAwareItems.map((item) => item.pillarLabel)))
  };
}
