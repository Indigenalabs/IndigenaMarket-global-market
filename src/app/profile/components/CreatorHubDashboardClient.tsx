
'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Globe,
  Heart,
  Languages,
  LifeBuoy,
  MessageSquare,
  Mic,
  Package,
  Palette,
  Plane,
  Plus,
  Scale,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  Truck,
  TrendingUp,
  Upload,
  Wallet,
  WifiOff,
  Wrench
} from 'lucide-react';
import type {
  CreatorMessageThread,
  CreatorProfileRecord,
  ProfileBundle,
  CreatorShippingSettings,
  ProfileConnection,
  ProfilePresentationSettings,
  ProfilePillarId
} from '@/app/profile/data/profileShowcase';
import {
  createProfileSupportRequest,
  fetchCreatorDashboard,
  fetchMarketingCampaigns,
  fetchProfileThreads,
  fetchSubscriptionEntitlements,
  fetchVerificationPurchases,
  reserveMarketingCampaign,
  saveProfileBundle,
  sendProfileMessage,
  startVerificationCheckout,
  type VerificationPurchaseRecord,
  updateMarketingCampaign,
  updateProfileOffering,
  uploadProfileMedia,
  updateProfileBasics,
  updateProfileCollectionsBulk,
  updateProfileNotifications,
  updateProfileOfferingsBulk,
  updateProfilePresentation,
  updateProfileShipping,
  updateProfileVerification
} from '@/app/lib/profileApi';
import {
  createEnterpriseInquiry,
  fetchEnterpriseInquiries,
  fetchEnterpriseContractAccessUrl,
  fetchEnterprisePipelineSettings,
  updateEnterpriseInquiryRecord,
  uploadEnterpriseContract,
  type EnterpriseInquiryRecord
} from '@/app/lib/enterpriseApi';
import { calculateEnterpriseForecast } from '@/app/lib/enterpriseForecast';
import { DEFAULT_ENTERPRISE_STAGE_WEIGHTS, type EnterpriseStageWeightMap } from '@/app/lib/enterpriseForecastConfig';
import { ENTERPRISE_OWNER_OPTIONS } from '@/app/lib/enterpriseTeam';
import { getEffectiveCreatorFeeRate, getPillarFeePolicy } from '@/app/lib/monetization';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import QuickCreateClient from '@/app/profile/components/QuickCreateClient';
import { getCreatorHubEditHref, getNativeCreatorEditorHref } from '@/app/profile/lib/creatorHubEditing';
import {
  applyLaunchWindowState,
  getOfferingCtaLabel,
  getOfferingImage,
  getOfferingLaunchBadge
} from '@/app/profile/lib/offeringMerchandising';
import {
  type MarketingCampaignRun,
  MARKETING_PACKAGES,
  MARKETING_PLACEMENTS,
  MARKETING_SCOPES,
  TOTAL_PLATFORM_PILLARS,
  TOTAL_PILLAR_MARKETING_PLACEMENTS,
  TOTAL_SELF_SERVE_PILLARS,
  type MarketingPlacementScope
} from '@/app/profile/data/marketingInventory';
import { VERIFICATION_PRODUCTS, type VerificationProductId } from '@/app/lib/verificationRevenue';
import { fetchPlatformAccounts } from '@/app/lib/platformAccountsApi';
import type { PlatformAccountRecord } from '@/app/lib/platformAccounts';
import {
  getCommunityStorefrontState,
  isCommunityStorefrontAccount
} from '@/app/lib/communityStorefrontState';
import {
  fetchCommunityStorefrontAnalytics,
  type CommunityStorefrontAnalyticsSnapshot
} from '@/app/lib/communityMarketplaceApi';
import { fetchHybridFundingAccount } from '@/app/lib/hybridFundingApi';
import type { HybridFundingReceiptRecord, HybridFundingSummary } from '@/app/lib/phase8HybridFunding';
import { fetchLaunchpadCampaignsForAccount, updateLaunchpadCampaignStatusApi } from '@/app/lib/launchpadApi';
import type { LaunchpadCampaign, LaunchpadCampaignStatus } from '@/app/lib/launchpad';
import {
  PlacementPill,
  placementHighlightedSurfaceCardClass,
  placementPricePillClass,
  placementStatusPillClass,
  placementSurfaceCardClass
} from '@/app/components/placements/PremiumPlacement';

type DashboardTab =
  | 'overview'
  | 'create'
  | 'listings'
  | 'ads'
  | 'partnerships'
  | 'shipping'
  | 'earnings'
  | 'profile'
  | 'collections'
  | 'analytics'
  | 'inbox'
  | 'notifications'
  | 'verification'
  | 'help';

type WorkspaceMode = 'simple' | 'pro';
type ListingFilter = 'all' | Exclude<ProfilePillarId, 'seva'>;
type CreatorPriority =
  | { title: string; detail: string; cta: string; targetTab: DashboardTab }
  | { title: string; detail: string; cta: string; href: string };
type ProWorkspaceAction =
  | { title: string; detail: string; cta: string; icon: typeof Sparkles; tone?: 'highlight' | 'default'; targetTab: DashboardTab }
  | { title: string; detail: string; cta: string; icon: typeof Sparkles; tone?: 'highlight' | 'default'; href: string };
type ProWorkspaceLane = {
  title: string;
  detail: string;
  actions: Array<{ label: string; href: string }>;
};

const TAB_ORDER: Array<{ id: DashboardTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'create', label: 'Add / Edit' },
  { id: 'listings', label: 'My Items' },
  { id: 'ads', label: 'Advertising' },
  { id: 'partnerships', label: 'Partnerships' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'profile', label: 'Profile' },
  { id: 'collections', label: 'Collections' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'verification', label: 'Verification' },
  { id: 'help', label: 'Help' }
];

const SIMPLE_TABS: DashboardTab[] = ['overview', 'create', 'listings', 'earnings', 'inbox', 'help'];
const SIMPLE_NAV_ITEMS: Array<{ id: DashboardTab; label: string; icon: typeof Sparkles }> = [
  { id: 'overview', label: 'Start', icon: Sparkles },
  { id: 'create', label: 'Add my work', icon: Plus },
  { id: 'listings', label: 'My items', icon: Package },
  { id: 'earnings', label: 'Money', icon: Wallet },
  { id: 'inbox', label: 'Messages', icon: MessageSquare },
  { id: 'help', label: 'Help', icon: LifeBuoy }
];
const SIMPLE_TAB_LABELS: Record<DashboardTab, string> = {
  overview: 'Start',
  create: 'Add my work',
  listings: 'My items',
  ads: 'Promote',
  partnerships: 'Partnerships',
  shipping: 'Shipping',
  earnings: 'Money',
  profile: 'My page',
  collections: 'Packages',
  analytics: 'Stats',
  inbox: 'Messages',
  notifications: 'Alerts',
  verification: 'Verification',
  help: 'Help'
};
const BUNDLE_CTA_TYPES: Array<{ value: NonNullable<ProfileBundle['ctaType']>; label: string }> = [
  { value: 'shop', label: 'Shop bundle' },
  { value: 'book', label: 'Book bundle' },
  { value: 'enroll', label: 'Enroll bundle' },
  { value: 'message', label: 'Message creator' },
  { value: 'quote', label: 'Request quote' }
];
const BUNDLE_AUDIENCES: Array<{ value: NonNullable<ProfileBundle['leadAudience']>; label: string }> = [
  { value: 'collectors', label: 'Collectors' },
  { value: 'learners', label: 'Learners' },
  { value: 'clients', label: 'Clients' },
  { value: 'travelers', label: 'Travelers' },
  { value: 'wholesale-buyers', label: 'Wholesale buyers' },
  { value: 'community-buyers', label: 'Community buyers' }
];
const STOREFRONT_STATE_ACTIONS: Array<{
  id: 'set-available' | 'set-limited' | 'set-waitlist' | 'set-bookable' | 'set-enrolling';
  label: string;
}> = [
  { id: 'set-available', label: 'Available now' },
  { id: 'set-limited', label: 'Limited' },
  { id: 'set-waitlist', label: 'Waitlist' },
  { id: 'set-bookable', label: 'Bookable' },
  { id: 'set-enrolling', label: 'Enrolling' }
];

const PILLAR_FILTERS: Array<{ id: ListingFilter; label: string }> = [
  { id: 'all', label: 'All Items' },
  { id: 'digital-arts', label: 'Digital' },
  { id: 'physical-items', label: 'Physical' },
  { id: 'courses', label: 'Courses' },
  { id: 'freelancing', label: 'Freelancing' },
  { id: 'cultural-tourism', label: 'Tourism' },
  { id: 'language-heritage', label: 'Language' },
  { id: 'land-food', label: 'Land & Food' },
  { id: 'advocacy-legal', label: 'Advocacy' },
  { id: 'materials-tools', label: 'Materials' }
];

const CREATE_LAUNCHERS = [
  { title: 'Digital Art', detail: 'Mint or publish visual releases, editions, and story-led drops.', href: '/digital-arts/add?returnTo=/creator-hub', icon: Sparkles },
  { title: 'Physical Item', detail: 'List one-of-one objects, inventory, and authenticated works.', href: '/physical-items/add?returnTo=/creator-hub', icon: Package },
  { title: 'Course', detail: 'Launch self-paced or live learning experiences with materials.', href: '/courses/create?returnTo=/creator-hub', icon: BookOpen },
  { title: 'Freelance Service', detail: 'Offer consulting, custom commissions, or cultural services.', href: '/creator-hub/new/freelancing', icon: Briefcase },
  { title: 'Tourism Experience', detail: 'Manage immersive visits, workshops, and protocol-aware bookings.', href: '/cultural-tourism/operator?focus=create&returnTo=/creator-hub', icon: Plane },
  { title: 'Language Resource', detail: 'Contribute archives, learning resources, or heritage media.', href: '/creator-hub/new/language-heritage', icon: Languages },
  { title: 'Land & Food', detail: 'Publish regenerative goods, stewardship offers, and producer runs.', href: '/creator-hub/new/land-food', icon: Sprout },
  { title: 'Advocacy Service', detail: 'Offer rights support, legal resources, or community advocacy.', href: '/creator-hub/new/advocacy-legal', icon: Scale },
  { title: 'Materials & Tools', detail: 'List supply lots, tool-library access, or sourcing services.', href: '/creator-hub/new/materials-tools', icon: Wrench },
  { title: 'Request Seva Project', detail: 'Propose a platform-reviewed Sacred Fund project for approval.', href: '/seva?focus=request&returnTo=/creator-hub', icon: Heart }
] as const;

const PAYMENT_METHODS = [
  'Bank account (2-3 days)',
  'PayPal (instant)',
  'Mobile money (1 day)',
  'INDI token (0.5% fee)'
];

const MESSAGE_INTENTS = [
  { id: 'general', label: 'General' },
  { id: 'commission', label: 'Commission' },
  { id: 'booking', label: 'Booking' },
  { id: 'licensing', label: 'Licensing' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'collaboration', label: 'Collaboration' }
] as const;

const EMBEDDED_CREATE_PILLARS = ['freelancing', 'language-heritage', 'land-food', 'advocacy-legal', 'materials-tools'] as const;
const NATIVE_CREATE_PILLARS = ['digital-arts', 'physical-items', 'courses', 'cultural-tourism'] as const;

export default function CreatorHubDashboardClient({ profile: initialProfile, slug }: { profile: CreatorProfileRecord; slug: string; }) {
  const searchParams = useSearchParams();
  const requestedAccountSlug = searchParams.get('accountSlug') || '';
  const [profile, setProfile] = useState(initialProfile);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('simple');
  const [followers, setFollowers] = useState<ProfileConnection[]>([]);
  const [following, setFollowing] = useState<ProfileConnection[]>([]);
  const [threads, setThreads] = useState<CreatorMessageThread[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [listingFilter, setListingFilter] = useState<ListingFilter>('all');
  const [listingSort, setListingSort] = useState<'date' | 'sales' | 'price'>('date');
  const [selectedThreadId, setSelectedThreadId] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [replyIntent, setReplyIntent] = useState<(typeof MESSAGE_INTENTS)[number]['id']>('general');
  const [replyFeedback, setReplyFeedback] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [presentationDraft, setPresentationDraft] = useState<ProfilePresentationSettings>(initialProfile.presentation);
  const [presentationFeedback, setPresentationFeedback] = useState('');
  const [isSavingPresentation, setIsSavingPresentation] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    displayName: initialProfile.displayName,
    username: initialProfile.username,
    location: initialProfile.location,
    nation: initialProfile.nation,
    bioShort: initialProfile.bioShort,
    bioLong: initialProfile.bioLong,
    website: initialProfile.website,
    languages: initialProfile.languages.join(', '),
    avatar: initialProfile.avatar,
    cover: initialProfile.cover
  });
  const [profileFeedback, setProfileFeedback] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [shippingDraft, setShippingDraft] = useState<CreatorShippingSettings>(initialProfile.shippingSettings);
  const [shippingFeedback, setShippingFeedback] = useState('');
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [notificationDraft, setNotificationDraft] = useState(initialProfile.notifications);
  const [notificationFeedback, setNotificationFeedback] = useState('');
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [selectedCreateLauncher, setSelectedCreateLauncher] = useState<(typeof CREATE_LAUNCHERS)[number]['title']>(CREATE_LAUNCHERS[0].title);
  const [selectedOfferingIds, setSelectedOfferingIds] = useState<string[]>([]);
  const [bulkFeedback, setBulkFeedback] = useState('');
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);
  const [uploadingMediaKind, setUploadingMediaKind] = useState<'avatar' | 'cover' | null>(null);
  const [mediaFeedback, setMediaFeedback] = useState('');
  const [marketingScope, setMarketingScope] = useState<'all' | MarketingPlacementScope>('all');
  const [selectedPlacementId, setSelectedPlacementId] = useState(MARKETING_PLACEMENTS[0]?.id ?? '');
  const [selectedPromotionOfferId, setSelectedPromotionOfferId] = useState(initialProfile.offerings[0]?.id ?? '');
  const [promotionWeek, setPromotionWeek] = useState('Next Monday');
  const [campaigns, setCampaigns] = useState<MarketingCampaignRun[]>([]);
  const [campaignFeedback, setCampaignFeedback] = useState('');
  const [isReservingCampaign, setIsReservingCampaign] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [campaignCreativeDraft, setCampaignCreativeDraft] = useState({
    headline: initialProfile.offerings[0]?.title ?? '',
    subheadline: initialProfile.offerings[0]?.blurb ?? '',
    cta: 'View Offer',
    image: initialProfile.offerings[0]?.image ?? ''
  });
  const [isUpdatingCampaign, setIsUpdatingCampaign] = useState(false);
  const [sponsorshipInquiry, setSponsorshipInquiry] = useState({
    name: '',
    email: '',
    organization: '',
    scope: '',
    budget: '',
    detail: ''
  });
  const [sponsorshipFeedback, setSponsorshipFeedback] = useState('');
  const [isSubmittingSponsorship, setIsSubmittingSponsorship] = useState(false);
  const [enterpriseInquiries, setEnterpriseInquiries] = useState<EnterpriseInquiryRecord[]>([]);
  const [enterpriseFeedback, setEnterpriseFeedback] = useState('');
  const [isUpdatingEnterpriseInquiry, setIsUpdatingEnterpriseInquiry] = useState<string | null>(null);
  const [uploadingEnterpriseContractTarget, setUploadingEnterpriseContractTarget] = useState<string | null>(null);
  const [enterpriseDrafts, setEnterpriseDrafts] = useState<Record<string, {
    estimatedValue: string;
    pipelineOwner: string;
    pipelineOwnerRole: EnterpriseInquiryRecord['pipelineOwnerRole'];
    nextStep: string;
    expectedCloseDate: string;
    contractLifecycleState: EnterpriseInquiryRecord['contractLifecycleState'];
    contractStoragePath: string;
    contractAttachmentUrl: string;
    contractAttachmentName: string;
    contractStage: EnterpriseInquiryRecord['contractStage'];
    status: EnterpriseInquiryRecord['status'];
  }>>({});
  const [enterpriseStageWeights, setEnterpriseStageWeights] = useState<EnterpriseStageWeightMap>(DEFAULT_ENTERPRISE_STAGE_WEIGHTS);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [collectionsFeedback, setCollectionsFeedback] = useState('');
  const [isApplyingCollectionBulk, setIsApplyingCollectionBulk] = useState(false);
  const [bundleDraft, setBundleDraft] = useState({
    id: initialProfile.bundles[0]?.id ?? `bundle-${Date.now()}`,
    name: initialProfile.bundles[0]?.name ?? '',
    summary: initialProfile.bundles[0]?.summary ?? '',
    cover: initialProfile.bundles[0]?.cover ?? '',
    itemIds: initialProfile.bundles[0]?.itemIds ?? [],
    priceLabel: initialProfile.bundles[0]?.priceLabel ?? '',
    savingsLabel: initialProfile.bundles[0]?.savingsLabel ?? '',
    ctaLabel: initialProfile.bundles[0]?.ctaLabel ?? 'View bundle',
    ctaType: initialProfile.bundles[0]?.ctaType ?? 'shop',
    leadAudience: initialProfile.bundles[0]?.leadAudience ?? 'collectors',
    visibility: initialProfile.bundles[0]?.visibility ?? 'public'
  });
  const [bundleFeedback, setBundleFeedback] = useState('');
  const [isSavingBundle, setIsSavingBundle] = useState(false);
  const [selectedStudioOfferingId, setSelectedStudioOfferingId] = useState(initialProfile.offerings[0]?.id ?? '');
const [studioOfferingDraft, setStudioOfferingDraft] = useState({
  title: initialProfile.offerings[0]?.title ?? '',
  blurb: initialProfile.offerings[0]?.blurb ?? '',
  priceLabel: initialProfile.offerings[0]?.priceLabel ?? '',
  status: initialProfile.offerings[0]?.status ?? 'Active',
  coverImage: initialProfile.offerings[0]?.coverImage ?? initialProfile.offerings[0]?.image ?? '',
  ctaMode: initialProfile.offerings[0]?.ctaMode ?? 'view',
  ctaPreset: initialProfile.offerings[0]?.ctaPreset ?? 'collect-now',
  merchandisingRank: initialProfile.offerings[0]?.merchandisingRank ?? 0,
  galleryOrder: initialProfile.offerings[0]?.galleryOrder ?? [],
  launchWindowStartsAt: initialProfile.offerings[0]?.launchWindowStartsAt ?? '',
  launchWindowEndsAt: initialProfile.offerings[0]?.launchWindowEndsAt ?? '',
  availabilityLabel: initialProfile.offerings[0]?.availabilityLabel ?? 'Available now',
  availabilityTone: initialProfile.offerings[0]?.availabilityTone ?? 'success',
  featured: initialProfile.offerings[0]?.featured ?? false
  });
  const [studioFeedback, setStudioFeedback] = useState('');
  const [isSavingStudioOffering, setIsSavingStudioOffering] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [isUpdatingVerification, setIsUpdatingVerification] = useState(false);
  const [verificationPurchases, setVerificationPurchases] = useState<VerificationPurchaseRecord[]>([]);
  const [isStartingVerificationCheckout, setIsStartingVerificationCheckout] = useState<VerificationProductId | null>(null);
  const [supportFeedback, setSupportFeedback] = useState('');
  const [isCreatingSupportRequest, setIsCreatingSupportRequest] = useState(false);
  const [creatorPlanId, setCreatorPlanId] = useState<'free' | 'creator' | 'studio'>('free');
  const [platformAccounts, setPlatformAccounts] = useState<PlatformAccountRecord[]>([]);
  const [activeAccountSlug, setActiveAccountSlug] = useState(slug);
  const [accountFeedback, setAccountFeedback] = useState('');
  const [communityAnalytics, setCommunityAnalytics] = useState<CommunityStorefrontAnalyticsSnapshot | null>(null);
  const [communityAnalyticsLoading, setCommunityAnalyticsLoading] = useState(false);
  const [launchpadCampaigns, setLaunchpadCampaigns] = useState<LaunchpadCampaign[]>([]);
  const [hybridFundingSummary, setHybridFundingSummary] = useState<HybridFundingSummary | null>(null);
  const [hybridFundingReceipts, setHybridFundingReceipts] = useState<HybridFundingReceiptRecord[]>([]);
  const [launchpadFeedback, setLaunchpadFeedback] = useState('');
  const [isUpdatingLaunchpadCampaignSlug, setIsUpdatingLaunchpadCampaignSlug] = useState('');

  useEffect(() => {
    const syncOnline = () => setIsOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    syncOnline();
    window.addEventListener('online', syncOnline);
    window.addEventListener('offline', syncOnline);
    return () => {
      window.removeEventListener('online', syncOnline);
      window.removeEventListener('offline', syncOnline);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedMode = window.localStorage.getItem('creator-hub-mode');
    if (savedMode === 'simple' || savedMode === 'pro') setWorkspaceMode(savedMode);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('creator-hub-mode', workspaceMode);
  }, [workspaceMode]);

  useEffect(() => {
    let cancelled = false;
    fetchCreatorDashboard(slug)
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
        setFollowers(data.followers);
        setFollowing(data.following);
        setThreads(data.messageThreads);
        setPresentationDraft(data.profile.presentation);
        setProfileDraft({
          displayName: data.profile.displayName,
          username: data.profile.username,
          location: data.profile.location,
          nation: data.profile.nation,
          bioShort: data.profile.bioShort,
          bioLong: data.profile.bioLong,
          website: data.profile.website,
          languages: data.profile.languages.join(', '),
          avatar: data.profile.avatar,
          cover: data.profile.cover
        });
        setShippingDraft(data.profile.shippingSettings);
        setNotificationDraft(data.profile.notifications);
        setBundleDraft((current) => ({
          id: data.profile.bundles[0]?.id ?? current.id,
          name: data.profile.bundles[0]?.name ?? current.name,
          summary: data.profile.bundles[0]?.summary ?? current.summary,
          cover: data.profile.bundles[0]?.cover ?? current.cover,
          itemIds: data.profile.bundles[0]?.itemIds ?? current.itemIds,
          priceLabel: data.profile.bundles[0]?.priceLabel ?? current.priceLabel,
          savingsLabel: data.profile.bundles[0]?.savingsLabel ?? current.savingsLabel,
          ctaLabel: data.profile.bundles[0]?.ctaLabel ?? current.ctaLabel,
          ctaType: data.profile.bundles[0]?.ctaType ?? current.ctaType,
          leadAudience: data.profile.bundles[0]?.leadAudience ?? current.leadAudience,
          visibility: data.profile.bundles[0]?.visibility ?? current.visibility
        }));
        if (data.messageThreads[0]) setSelectedThreadId(data.messageThreads[0].counterpartActorId);
      })
      .catch(() => undefined);
    fetchSubscriptionEntitlements()
      .then((entitlements) => {
        if (cancelled) return;
        if (
          entitlements.creatorPlanId === 'free' ||
          entitlements.creatorPlanId === 'creator' ||
          entitlements.creatorPlanId === 'studio'
        ) {
          setCreatorPlanId(entitlements.creatorPlanId);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    fetchPlatformAccounts({ accountTypes: ['community', 'tribe', 'collective'], mine: true })
      .then((data) => {
        if (cancelled) return;
        setPlatformAccounts(data);
        if (activeAccountSlug !== slug && !data.some((entry) => entry.slug === activeAccountSlug)) {
          setActiveAccountSlug(slug);
        }
      })
      .catch((error) => {
        if (!cancelled) setAccountFeedback(error instanceof Error ? error.message : 'Unable to load account switcher.');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!requestedAccountSlug) return;
    if (requestedAccountSlug === slug) {
      setActiveAccountSlug(slug);
      return;
    }
    if (platformAccounts.some((entry) => entry.slug === requestedAccountSlug)) {
      setActiveAccountSlug(requestedAccountSlug);
    }
  }, [platformAccounts, requestedAccountSlug, slug]);

  useEffect(() => {
    if (!activeAccountSlug) {
      setLaunchpadCampaigns([]);
      setHybridFundingSummary(null);
      setHybridFundingReceipts([]);
      return;
    }
    let cancelled = false;
    fetchLaunchpadCampaignsForAccount(activeAccountSlug)
      .then((data) => {
        if (!cancelled) {
          setLaunchpadCampaigns(data);
          setLaunchpadFeedback('');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLaunchpadFeedback(error instanceof Error ? error.message : 'Unable to load Launchpad campaigns.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeAccountSlug]);

  useEffect(() => {
    if (!activeAccountSlug) return;
    let cancelled = false;
    fetchHybridFundingAccount(activeAccountSlug)
      .then((data) => {
        if (cancelled) return;
        setHybridFundingSummary(data.summary);
        setHybridFundingReceipts(data.receipts);
      })
      .catch(() => {
        if (cancelled) return;
        setHybridFundingSummary(null);
        setHybridFundingReceipts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [activeAccountSlug]);

  useEffect(() => {
    let cancelled = false;
    fetchMarketingCampaigns(slug)
      .then((data) => {
        if (cancelled) return;
        setCampaigns(data.campaigns);
      })
      .catch(() => undefined);
    fetchVerificationPurchases(slug)
      .then((data) => {
        if (cancelled) return;
        setVerificationPurchases(data.purchases);
      })
      .catch(() => undefined);
    fetchEnterpriseInquiries()
      .then((data) => {
        if (cancelled) return;
        setEnterpriseInquiries(data.inquiries);
        setEnterpriseDrafts(
          Object.fromEntries(
            data.inquiries.map((inquiry) => [
              inquiry.id,
              {
                estimatedValue: inquiry.estimatedValue ? String(inquiry.estimatedValue) : '',
                pipelineOwner: inquiry.pipelineOwner || '',
                pipelineOwnerRole: inquiry.pipelineOwnerRole || '',
                nextStep: inquiry.nextStep || '',
                expectedCloseDate: inquiry.expectedCloseDate ? inquiry.expectedCloseDate.slice(0, 10) : '',
                contractLifecycleState: inquiry.contractLifecycleState || 'draft',
                contractStoragePath: inquiry.contractStoragePath || '',
                contractAttachmentUrl: inquiry.contractAttachmentUrl || '',
                contractAttachmentName: inquiry.contractAttachmentName || '',
                contractStage: inquiry.contractStage,
                status: inquiry.status
              }
            ])
          )
        );
      })
      .catch(() => undefined);
    fetchEnterprisePipelineSettings()
      .then((settings) => {
        if (cancelled) return;
        setEnterpriseStageWeights(settings.stageWeights || DEFAULT_ENTERPRISE_STAGE_WEIGHTS);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const selectedThread = threads.find((thread) => thread.counterpartActorId === selectedThreadId) ?? threads[0] ?? null;
  const selectedStudioOffering =
    profile.offerings.find((offering) => offering.id === selectedStudioOfferingId) ?? profile.offerings[0] ?? null;
  const studioPreviewOffering = useMemo(
    () =>
      selectedStudioOffering
        ? applyLaunchWindowState({
            ...selectedStudioOffering,
            ...studioOfferingDraft
          })
        : null,
    [selectedStudioOffering, studioOfferingDraft]
  );

  const filteredListings = useMemo(() => {
    let items = profile.offerings.filter((item) => item.pillar !== 'seva');
    if (listingFilter !== 'all') items = items.filter((item) => item.pillar === listingFilter);
    if (listingSort === 'price') items = [...items].sort((a, b) => parsePriceValue(b.priceLabel) - parsePriceValue(a.priceLabel));
    if (listingSort === 'sales') items = [...items].reverse();
    return items;
  }, [listingFilter, listingSort, profile.offerings]);

  const selectedCreateConfig = CREATE_LAUNCHERS.find((entry) => entry.title === selectedCreateLauncher) ?? CREATE_LAUNCHERS[0];
  const withSimpleMode = (href: string) => {
    if (workspaceMode !== 'simple') {
      return href;
    }
    return href.includes('?') ? `${href}&simple=1` : `${href}?simple=1`;
  };
  const featuredOfferings = useMemo(
    () =>
      profile.offerings.filter((entry) =>
        (presentationDraft.featuredOfferingIds ?? []).includes(entry.id)
      ),
    [presentationDraft.featuredOfferingIds, profile.offerings]
  );
  const marketingPlacements = useMemo(
    () => MARKETING_PLACEMENTS.filter((placement) => marketingScope === 'all' || placement.scope === marketingScope),
    [marketingScope]
  );
  const marketingPlacementGroups = useMemo(() => {
    const orderedScopes: MarketingPlacementScope[] = [
      'homepage',
      'trending',
      'community',
      'digital-arts',
      'physical-items',
      'courses',
      'freelancing',
      'cultural-tourism',
      'language-heritage',
      'land-food',
      'advocacy-legal',
      'materials-tools'
    ];
    return orderedScopes
      .map((scope) => ({
        scope,
        items: marketingPlacements.filter((placement) => placement.scope === scope)
      }))
      .filter((group) => group.items.length > 0);
  }, [marketingPlacements]);
  const selectedPromotionOffer =
    profile.offerings.find((entry) => entry.id === selectedPromotionOfferId) ?? profile.offerings[0] ?? null;
  const selectedPlacement =
    MARKETING_PLACEMENTS.find((placement) => placement.id === selectedPlacementId) ?? MARKETING_PLACEMENTS[0] ?? null;
  const soloStorefrontAccount = useMemo(
    () =>
      ({
        id: `solo-${profile.slug}`,
        slug,
        displayName: profile.displayName,
        description: profile.bioShort,
        accountType: 'artist',
        location: profile.location,
        nation: profile.nation,
        storefrontHeadline: profile.bioShort,
        verificationStatus: 'approved',
        treasuryLabel: 'Direct creator payouts',
        supportUrl: `/profile/${slug}`,
        payoutWallet: '',
        avatar: profile.avatar,
        banner: profile.cover,
        story: profile.bioLong || profile.bioShort,
        featuredOfferingIds: profile.offerings.slice(0, 3).map((offering) => offering.id),
        representativeActorIds: [],
        createdAt: '',
        updatedAt: ''
      }) satisfies PlatformAccountRecord,
    [profile.avatar, profile.bioLong, profile.bioShort, profile.cover, profile.displayName, profile.location, profile.nation, profile.offerings, profile.slug, slug]
  );
  const nationStorefrontAccounts = useMemo(
    () => platformAccounts.filter((entry) => ['community', 'tribe', 'collective'].includes(entry.accountType)),
    [platformAccounts]
  );
  const activePlatformAccount = useMemo(
    () => {
      if (activeAccountSlug === slug) return soloStorefrontAccount;
      return nationStorefrontAccounts.find((entry) => entry.slug === activeAccountSlug) || soloStorefrontAccount;
    },
    [activeAccountSlug, nationStorefrontAccounts, slug, soloStorefrontAccount]
  );
  const communityStorefrontCards = useMemo(
    () =>
      nationStorefrontAccounts.map((account) => ({
        ...account,
        reviewLabel:
          account.verificationStatus === 'approved'
            ? 'Verified community seller'
            : account.verificationStatus === 'pending'
              ? 'Waiting on governance review'
              : account.verificationStatus === 'rejected'
                ? 'Needs follow-up before selling'
                : 'Draft review state'
      })),
    [nationStorefrontAccounts]
  );
  const communityPublishingAccountSlug =
    activePlatformAccount && ['community', 'tribe', 'collective'].includes(activePlatformAccount.accountType)
      ? activePlatformAccount.slug
      : '';
  const activeCommunityStorefrontState = useMemo(
    () =>
      isCommunityStorefrontAccount(activePlatformAccount)
        ? getCommunityStorefrontState(activePlatformAccount.verificationStatus)
        : null,
    [activePlatformAccount]
  );
  useEffect(() => {
    if (!activePlatformAccount || !isCommunityStorefrontAccount(activePlatformAccount)) {
      setCommunityAnalytics(null);
      setCommunityAnalyticsLoading(false);
      return;
    }
    let cancelled = false;
    setCommunityAnalyticsLoading(true);
    fetchCommunityStorefrontAnalytics(activePlatformAccount.slug)
      .then((data) => {
        if (!cancelled) {
          setCommunityAnalytics(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCommunityAnalytics(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCommunityAnalyticsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activePlatformAccount]);
  const topCommunityRoutes = useMemo(() => communityAnalytics?.rollups.slice(0, 3) ?? [], [communityAnalytics]);
  const topCommunityPillars = useMemo(() => communityAnalytics?.pillarPerformance.slice(0, 3) ?? [], [communityAnalytics]);
  const withStorefrontContext = (href: string) => {
    if (!communityPublishingAccountSlug) {
      return withSimpleMode(href);
    }
    const [pathname, rawQuery = ''] = href.split('?');
    const params = new URLSearchParams(rawQuery);
    params.set('accountSlug', communityPublishingAccountSlug);
    const returnTo = params.get('returnTo');
    if (returnTo) {
      const [returnPath, returnQuery = ''] = returnTo.split('?');
      const returnParams = new URLSearchParams(returnQuery);
      returnParams.set('accountSlug', communityPublishingAccountSlug);
      params.set('returnTo', `${returnPath}${returnParams.toString() ? `?${returnParams.toString()}` : ''}`);
    }
    const scopedHref = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    return withSimpleMode(scopedHref);
  };
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null;
  const launchpadBuilderHref = useMemo(() => {
    const params = new URLSearchParams();
    const inferredAccountSlug = activePlatformAccount?.slug || activeAccountSlug || slug;
    const inferredMode = activePlatformAccount
      ? ['community', 'tribe', 'collective'].includes(activePlatformAccount.accountType)
        ? 'nation'
        : 'solo'
      : inferredAccountSlug === slug
        ? 'solo'
        : 'nation';
    params.set('accountSlug', inferredAccountSlug);
    params.set('mode', inferredMode);
    const href = `/launchpad/create${params.toString() ? `?${params.toString()}` : ''}`;
    return withSimpleMode(href);
  }, [activeAccountSlug, activePlatformAccount, slug, workspaceMode]);
  const launchpadCampaignGroups = useMemo(
    () => ({
      draft: launchpadCampaigns.filter((campaign) => (campaign.status ?? 'published') === 'draft'),
      pendingReview: launchpadCampaigns.filter((campaign) => (campaign.status ?? 'published') === 'pending_review'),
      published: launchpadCampaigns.filter((campaign) => (campaign.status ?? 'published') === 'published')
    }),
    [launchpadCampaigns]
  );
  const unreadThreadCount = useMemo(() => threads.reduce((sum, thread) => sum + thread.unreadCount, 0), [threads]);
  const storefrontContextLabel = activePlatformAccount
    ? activePlatformAccount.accountType === 'artist'
      ? 'Solo storefront'
      : 'Nation storefront'
    : 'Solo storefront';
  const creatorPriorities = useMemo<CreatorPriority[]>(
    () => [
      {
        title: 'Publish or update inventory',
        detail:
          profile.offerings.length === 0
            ? 'You do not have anything live yet. Start by publishing one offer in the active storefront.'
            : `${profile.dashboardStats.activeListings} offers are active. Open your items if something needs a quick change.`,
        cta: profile.offerings.length === 0 ? 'Add my work' : 'See my items',
        targetTab: profile.offerings.length === 0 ? ('create' as DashboardTab) : ('listings' as DashboardTab)
      },
      {
        title: 'Check storefront money flow',
        detail: `${profile.dashboardStats.availablePayout} is ready to move. Use wallet services for withdrawals, payout setup, and transaction checks.`,
        cta: 'Open payouts',
        href: '/wallet/services?view=payouts'
      },
      {
        title: 'Watch campaign momentum',
        detail:
          launchpadCampaigns.length > 0
            ? `${launchpadCampaignGroups.published.length} live, ${launchpadCampaignGroups.pendingReview.length} in review, ${launchpadCampaignGroups.draft.length} in draft for ${activePlatformAccount?.displayName || profile.displayName}.`
            : `No Launchpad campaign is live for ${activePlatformAccount?.displayName || profile.displayName} yet.`,
        cta: launchpadCampaigns.length > 0 ? 'Manage campaigns' : 'Start Launchpad',
        href: launchpadCampaigns.length > 0 ? '/launchpad' : launchpadBuilderHref
      }
    ],
    [
      activePlatformAccount,
      launchpadBuilderHref,
      launchpadCampaignGroups.draft.length,
      launchpadCampaignGroups.pendingReview.length,
      launchpadCampaignGroups.published.length,
      launchpadCampaigns.length,
      profile.dashboardStats.activeListings,
      profile.dashboardStats.availablePayout,
      profile.displayName,
      profile.offerings.length
    ]
  );
  const proWorkspaceActions = useMemo<ProWorkspaceAction[]>(
    () => [
      {
        title: 'Open listing studio',
        detail: 'Edit live inventory, pricing, cover media, and launch states without leaving Creator Hub.',
        cta: 'Go to studio',
        icon: Settings2,
        targetTab: 'create'
      },
      {
        title: 'Check live inventory',
        detail: `${profile.dashboardStats.activeListings} active offers are attached to the current storefront context.`,
        cta: 'Review listings',
        icon: Package,
        targetTab: 'listings'
      },
      {
        title: 'Check payouts and fees',
        detail: `${profile.dashboardStats.availablePayout} is ready. Confirm wallet setup, payout routing, and transaction history.`,
        cta: 'Open wallet services',
        icon: Wallet,
        href: '/wallet/services?view=payouts'
      },
      {
        title: launchpadCampaigns.length > 0 ? 'Run fundraising' : 'Start fundraising',
        detail:
          launchpadCampaigns.length > 0
            ? `${launchpadCampaignGroups.published.length} live, ${launchpadCampaignGroups.pendingReview.length} in review, ${launchpadCampaignGroups.draft.length} in draft.`
            : 'Launch a campaign that inherits your current solo or nation storefront context.',
        cta: launchpadCampaigns.length > 0 ? 'Manage Launchpad' : 'Start Launchpad',
        icon: Heart,
        tone: 'highlight',
        href: launchpadCampaigns.length > 0 ? '/launchpad' : launchpadBuilderHref
      }
    ],
    [
      launchpadBuilderHref,
      launchpadCampaignGroups.draft.length,
      launchpadCampaignGroups.pendingReview.length,
      launchpadCampaignGroups.published.length,
      launchpadCampaigns.length,
      profile.dashboardStats.activeListings,
      profile.dashboardStats.availablePayout
    ]
  );
  const proWorkspaceLanes = useMemo<ProWorkspaceLane[]>(
    () => [
      {
        title: 'Commerce lanes',
        detail: 'Best for storefront inventory and products that need pricing, stock, or merchandising.',
        actions: [
          { label: 'Digital art', href: withStorefrontContext('/digital-arts/add?returnTo=/creator-hub') },
          { label: 'Physical items', href: withStorefrontContext('/physical-items/add?returnTo=/creator-hub') },
          { label: 'Materials & tools', href: withStorefrontContext('/creator-hub/new/materials-tools') }
        ]
      },
      {
        title: 'Service lanes',
        detail: 'Use these for bookings, consulting, and professional or cultural service work.',
        actions: [
          { label: 'Freelancing', href: withStorefrontContext('/creator-hub/new/freelancing') },
          { label: 'Tourism', href: withStorefrontContext('/cultural-tourism/operator?focus=create&returnTo=/creator-hub') },
          { label: 'Advocacy', href: withStorefrontContext('/creator-hub/new/advocacy-legal') }
        ]
      },
      {
        title: 'Learning and heritage',
        detail: 'For curriculum, archives, language resources, and stewardship-based publishing.',
        actions: [
          { label: 'Courses', href: withStorefrontContext('/courses/create?returnTo=/creator-hub') },
          { label: 'Language', href: withStorefrontContext('/creator-hub/new/language-heritage') },
          { label: 'Land & food', href: withStorefrontContext('/creator-hub/new/land-food') }
        ]
      },
      {
        title: 'Community funds',
        detail: 'Use Launchpad for direct fundraising and Seva for platform-reviewed sacred fund requests.',
        actions: [
          { label: 'Launchpad', href: launchpadBuilderHref },
          { label: 'Seva request', href: withStorefrontContext('/seva?focus=request&returnTo=/creator-hub') }
        ]
      }
    ],
    [launchpadBuilderHref, withStorefrontContext]
  );
  const marketingCampaignGroups = useMemo(
    () => ({
      live: campaigns.filter((campaign) => campaign.status === 'live'),
      scheduled: campaigns.filter((campaign) => campaign.status === 'scheduled'),
      completed: campaigns.filter((campaign) => campaign.status === 'completed')
    }),
    [campaigns]
  );
  const enterpriseRollups = useMemo(
    () => ({
      proposalValue: enterpriseInquiries
        .filter((entry) => entry.contractStage === 'proposal')
        .reduce((total, entry) => total + Number(entry.estimatedValue || 0), 0),
      negotiationValue: enterpriseInquiries
        .filter((entry) => entry.contractStage === 'negotiation')
        .reduce((total, entry) => total + Number(entry.estimatedValue || 0), 0),
      wonValue: enterpriseInquiries
        .filter((entry) => entry.contractStage === 'won')
        .reduce((total, entry) => total + Number(entry.estimatedValue || 0), 0)
    }),
    [enterpriseInquiries]
  );
  const enterpriseForecast = useMemo(
    () => calculateEnterpriseForecast(enterpriseInquiries, enterpriseStageWeights),
    [enterpriseInquiries, enterpriseStageWeights]
  );

  const recentTransactions = useMemo(() => profile.transactionHistory.slice(0, 6), [profile.transactionHistory]);
  const creatorFeeSavings = useMemo(
    () =>
      profile.transactionHistory
        .filter((entry) => entry.type === 'sale')
        .reduce((total, entry) => {
          const gross = parsePriceValue(entry.amount);
          if (!gross) return total;
          const defaultRate = getPillarFeePolicy(entry.pillar).defaultRate;
          const currentRate = getEffectiveCreatorFeeRate(entry.pillar, creatorPlanId);
          return total + gross * Math.max(0, defaultRate - currentRate);
        }, 0),
    [creatorPlanId, profile.transactionHistory]
  );
  const visibleTabs = useMemo(
    () => TAB_ORDER.filter((tab) => workspaceMode === 'pro' || SIMPLE_TABS.includes(tab.id)),
    [workspaceMode]
  );
  const bundleOfferings = useMemo(
    () => profile.offerings.filter((entry) => bundleDraft.itemIds.includes(entry.id)),
    [bundleDraft.itemIds, profile.offerings]
  );

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('overview');
    }
  }, [activeTab, visibleTabs]);

  useEffect(() => {
    if (!selectedCampaignId && campaigns[0]) setSelectedCampaignId(campaigns[0].id);
  }, [campaigns, selectedCampaignId]);

  useEffect(() => {
    if (selectedCampaign) {
      setCampaignCreativeDraft({
        headline: selectedCampaign.creative?.headline || selectedCampaign.offerTitle,
        subheadline: selectedCampaign.creative?.subheadline || selectedCampaign.result,
        cta: selectedCampaign.creative?.cta || 'View Offer',
        image: selectedCampaign.creative?.image || ''
      });
      return;
    }
    if (selectedPromotionOffer) {
      setCampaignCreativeDraft({
        headline: selectedPromotionOffer.title,
        subheadline: selectedPromotionOffer.blurb,
        cta: 'View Offer',
        image: selectedPromotionOffer.image
      });
    }
  }, [selectedCampaign, selectedPromotionOffer]);

  useEffect(() => {
    if (!selectedStudioOffering && profile.offerings[0]) {
      setSelectedStudioOfferingId(profile.offerings[0].id);
      return;
    }
    if (!selectedStudioOffering) return;
    setStudioOfferingDraft({
      title: selectedStudioOffering.title,
      blurb: selectedStudioOffering.blurb,
      priceLabel: selectedStudioOffering.priceLabel,
          status: selectedStudioOffering.status ?? 'Active',
          coverImage: selectedStudioOffering.coverImage ?? selectedStudioOffering.image ?? '',
          ctaMode: selectedStudioOffering.ctaMode ?? 'view',
          ctaPreset: selectedStudioOffering.ctaPreset ?? 'collect-now',
          merchandisingRank: selectedStudioOffering.merchandisingRank ?? 0,
          galleryOrder: selectedStudioOffering.galleryOrder ?? [],
          launchWindowStartsAt: selectedStudioOffering.launchWindowStartsAt ?? '',
          launchWindowEndsAt: selectedStudioOffering.launchWindowEndsAt ?? '',
          availabilityLabel: selectedStudioOffering.availabilityLabel ?? 'Available now',
          availabilityTone: selectedStudioOffering.availabilityTone ?? 'success',
          featured: selectedStudioOffering.featured ?? false
    });
  }, [selectedStudioOffering, profile.offerings]);

  async function refreshThreads() {
    const data = await fetchProfileThreads(slug);
    setThreads(data.threads);
    if (!selectedThreadId && data.threads[0]) setSelectedThreadId(data.threads[0].counterpartActorId);
  }

  async function handleReply() {
    if (!selectedThread || !replyDraft.trim()) {
      setReplyFeedback('Write a reply before sending.');
      return;
    }
    try {
      setIsReplying(true);
      setReplyFeedback('');
      await requireWalletAction('reply to a creator message');
      await sendProfileMessage({
        profileSlug: slug,
        recipientActorId: selectedThread.counterpartActorId,
        subject: `${replyIntent === 'general' ? 'Re' : MESSAGE_INTENTS.find((intent) => intent.id === replyIntent)?.label}: ${selectedThread.latestSubject}`,
        body: replyDraft,
        pillar: selectedThread.pillar,
        intent: replyIntent
      });
      setReplyDraft('');
      setReplyIntent('general');
      setReplyFeedback('Reply sent. Refreshing thread...');
      await refreshThreads();
    } catch (error) {
      setReplyFeedback(error instanceof Error ? error.message : 'Unable to send reply right now.');
    } finally {
      setIsReplying(false);
    }
  }

  async function handleSavePresentation() {
    try {
      setIsSavingPresentation(true);
      setPresentationFeedback('');
      await requireWalletAction('save creator profile presentation');
      const result = await updateProfilePresentation({ slug, ...presentationDraft });
      setProfile((current) => ({ ...current, presentation: result.presentation }));
      setPresentationFeedback('Profile presentation saved. Your public storefront will reflect this order.');
    } catch (error) {
      setPresentationFeedback(error instanceof Error ? error.message : 'Unable to save presentation settings.');
    } finally {
      setIsSavingPresentation(false);
    }
  }

  async function handleSaveProfileBasics() {
    try {
      setIsSavingProfile(true);
      setProfileFeedback('');
      await requireWalletAction('save creator profile basics');
      const result = await updateProfileBasics({
        slug,
        displayName: profileDraft.displayName,
        username: profileDraft.username,
        location: profileDraft.location,
        nation: profileDraft.nation,
        bioShort: profileDraft.bioShort,
        bioLong: profileDraft.bioLong,
        website: profileDraft.website,
        languages: profileDraft.languages.split(',').map((entry) => entry.trim()).filter(Boolean),
        avatar: profileDraft.avatar,
        cover: profileDraft.cover
      });
      setProfile(result.profile);
      setProfileDraft({
        displayName: result.profile.displayName,
        username: result.profile.username,
        location: result.profile.location,
        nation: result.profile.nation,
        bioShort: result.profile.bioShort,
        bioLong: result.profile.bioLong,
        website: result.profile.website,
        languages: result.profile.languages.join(', '),
        avatar: result.profile.avatar,
        cover: result.profile.cover
      });
      setProfileFeedback('Profile basics saved. Your storefront header is updated.');
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : 'Unable to save profile basics right now.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveShipping() {
    try {
      setIsSavingShipping(true);
      setShippingFeedback('');
      await requireWalletAction('save creator shipping settings');
      const result = await updateProfileShipping({ slug, shippingSettings: shippingDraft });
      setProfile((current) => ({ ...current, shippingSettings: result.shippingSettings }));
      setShippingDraft(result.shippingSettings);
      setShippingFeedback('Shipping settings saved. These defaults now anchor your physical-item checkout flows.');
    } catch (error) {
      setShippingFeedback(error instanceof Error ? error.message : 'Unable to save shipping settings right now.');
    } finally {
      setIsSavingShipping(false);
    }
  }

  async function handleSaveNotifications() {
    try {
      setIsSavingNotifications(true);
      setNotificationFeedback('');
      await requireWalletAction('save creator notification settings');
      const result = await updateProfileNotifications({ slug, notifications: notificationDraft });
      setProfile((current) => ({ ...current, notifications: result.notifications }));
      setNotificationDraft(result.notifications);
      setNotificationFeedback('Notification settings saved.');
    } catch (error) {
      setNotificationFeedback(error instanceof Error ? error.message : 'Unable to save notification settings right now.');
    } finally {
      setIsSavingNotifications(false);
    }
  }

  async function handleUploadProfileMedia(kind: 'avatar' | 'cover', file: File) {
    try {
      setUploadingMediaKind(kind);
      setMediaFeedback('');
      await requireWalletAction(`upload your ${kind} image`);
      const result = await uploadProfileMedia({ slug, kind, file });
      setProfileDraft((current) => ({ ...current, [kind]: result.url }));
      setMediaFeedback(`${kind === 'avatar' ? 'Avatar' : 'Cover image'} uploaded. Save profile basics to publish it.`);
    } catch (error) {
      setMediaFeedback(error instanceof Error ? error.message : 'Unable to upload profile image right now.');
    } finally {
      setUploadingMediaKind(null);
    }
  }

  function toggleListingSelection(offeringId: string) {
    setSelectedOfferingIds((current) =>
      current.includes(offeringId) ? current.filter((id) => id !== offeringId) : [...current, offeringId]
    );
  }

  function toggleSelectVisibleListings() {
    const visibleIds = filteredListings.map((entry) => entry.id);
    const allVisibleSelected = visibleIds.every((id) => selectedOfferingIds.includes(id));
    setSelectedOfferingIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  }

  async function handleBulkListingAction(
    operation:
      | 'activate'
      | 'pause'
      | 'archive'
      | 'feature'
      | 'unfeature'
      | 'set-available'
      | 'set-limited'
      | 'set-waitlist'
      | 'set-bookable'
      | 'set-enrolling'
  ) {
    if (!selectedOfferingIds.length) {
      setBulkFeedback('Select at least one listing first.');
      return;
    }
    try {
      setIsApplyingBulk(true);
      setBulkFeedback('');
      await requireWalletAction('apply bulk listing changes');
      const result = await updateProfileOfferingsBulk({
        slug,
        accountSlug: communityPublishingAccountSlug || undefined,
        offeringIds: selectedOfferingIds,
        operation
      });
      setProfile(result.profile);
      setPresentationDraft(result.profile.presentation);
      setSelectedOfferingIds([]);
      setBulkFeedback(
        operation === 'feature'
          ? 'Featured storefront placements updated.'
          : operation === 'unfeature'
            ? 'Featured pins removed from the selected listings.'
            : 'Listing states updated successfully.'
      );
    } catch (error) {
      setBulkFeedback(error instanceof Error ? error.message : 'Unable to apply bulk listing update.');
    } finally {
      setIsApplyingBulk(false);
    }
  }

  async function handleSaveStudioOffering() {
    if (!selectedStudioOffering) {
      setStudioFeedback('Choose a listing first.');
      return;
    }
    try {
      setIsSavingStudioOffering(true);
      setStudioFeedback('');
      await requireWalletAction('save in-hub listing changes');
      const result = await updateProfileOffering({
        slug,
        accountSlug: communityPublishingAccountSlug || undefined,
        offeringId: selectedStudioOffering.id,
        ...studioOfferingDraft
      });
      setProfile(result.profile);
      setPresentationDraft(result.profile.presentation);
      setStudioFeedback('Listing saved. In-hub merchandising and storefront details are updated.');
    } catch (error) {
      setStudioFeedback(error instanceof Error ? error.message : 'Unable to save listing changes.');
    } finally {
      setIsSavingStudioOffering(false);
    }
  }

  function toggleCollectionSelection(collectionId: string) {
    setSelectedCollectionIds((current) =>
      current.includes(collectionId) ? current.filter((id) => id !== collectionId) : [...current, collectionId]
    );
  }

  async function handleCollectionBulkAction(operation: 'publish' | 'hide') {
    if (!selectedCollectionIds.length) {
      setCollectionsFeedback('Select at least one collection first.');
      return;
    }
    try {
      setIsApplyingCollectionBulk(true);
      setCollectionsFeedback('');
      await requireWalletAction('update collection visibility');
      const result = await updateProfileCollectionsBulk({
        slug,
        collectionIds: selectedCollectionIds,
        operation
      });
      setProfile(result.profile);
      setSelectedCollectionIds([]);
      setCollectionsFeedback(
        operation === 'publish'
          ? 'Selected collections are now visible on your public profile.'
          : 'Selected collections are now hidden from the public profile.'
      );
    } catch (error) {
      setCollectionsFeedback(error instanceof Error ? error.message : 'Unable to update collection visibility.');
    } finally {
      setIsApplyingCollectionBulk(false);
    }
  }

  async function handleFeatureBundle(bundleId?: string) {
    try {
      setIsApplyingCollectionBulk(true);
      setCollectionsFeedback('');
      await requireWalletAction(bundleId ? 'feature a storefront bundle' : 'clear the featured bundle');
      const result = await updateProfileCollectionsBulk({
        slug,
        bundleId,
        operation: bundleId ? 'feature-bundle' : 'clear-featured-bundle'
      });
      setProfile(result.profile);
      setPresentationDraft(result.profile.presentation);
      setCollectionsFeedback(
        bundleId ? 'Lead bundle updated for your public bundles page.' : 'Lead bundle cleared.'
      );
    } catch (error) {
      setCollectionsFeedback(error instanceof Error ? error.message : 'Unable to update the lead bundle.');
    } finally {
      setIsApplyingCollectionBulk(false);
    }
  }

  async function handleVerificationAction(
    workflowId: string,
    action: 'submit' | 'request-info' | 'approve'
  ) {
    try {
      setIsUpdatingVerification(true);
      setVerificationFeedback('');
      await requireWalletAction('update verification workflow');
      const result = await updateProfileVerification({ slug, workflowId, action });
      setProfile(result.profile);
      setVerificationFeedback(
        action === 'approve'
          ? 'Verification step marked approved.'
          : action === 'request-info'
            ? 'Verification step moved back for more information.'
            : 'Verification step submitted for review.'
      );
    } catch (error) {
      setVerificationFeedback(error instanceof Error ? error.message : 'Unable to update verification workflow.');
    } finally {
      setIsUpdatingVerification(false);
    }
  }

  async function handleSupportRequest(
    title: string,
    detail: string,
    channel: 'chat' | 'callback' | 'tutorial' | 'compliance'
  ) {
    try {
      setIsCreatingSupportRequest(true);
      setSupportFeedback('');
      await requireWalletAction('create a support request');
      const result = await createProfileSupportRequest({ slug, title, detail, channel });
      setProfile(result.profile);
      setSupportFeedback('Support request created. The new request is now tracked in your Pro hub.');
    } catch (error) {
      setSupportFeedback(error instanceof Error ? error.message : 'Unable to create support request.');
    } finally {
      setIsCreatingSupportRequest(false);
    }
  }

  async function handleVerificationCheckout(productId: VerificationProductId) {
    try {
      setIsStartingVerificationCheckout(productId);
      setVerificationFeedback('');
      await requireWalletAction('purchase a verification service');
      const result = await startVerificationCheckout({ slug, productId });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      setVerificationFeedback(error instanceof Error ? error.message : 'Unable to start verification checkout.');
    } finally {
      setIsStartingVerificationCheckout(null);
    }
  }

  async function handleReservePlacement() {
    if (!selectedPromotionOffer || !selectedPlacement) {
      setCampaignFeedback('Choose an offer and placement first.');
      return;
    }
    try {
      setIsReservingCampaign(true);
      setCampaignFeedback('');
      await requireWalletAction('reserve a marketing placement');
      const result = await reserveMarketingCampaign({
        slug,
        offeringId: selectedPromotionOffer.id,
        placementId: selectedPlacement.id,
        launchWeek: promotionWeek,
        creative: campaignCreativeDraft
      });
      setCampaigns((current) => [result.campaign, ...current.filter((entry) => entry.id !== result.campaign.id)]);
      setSelectedCampaignId(result.campaign.id);
      setCampaignFeedback(
        'Placement reserved. Complete checkout and submit creative for approval.'
      );
    } catch (error) {
      setCampaignFeedback(error instanceof Error ? error.message : 'Unable to reserve placement right now.');
    } finally {
      setIsReservingCampaign(false);
    }
  }

  async function handleCampaignAction(
    action:
      | 'start-checkout'
      | 'complete-checkout'
      | 'pause'
      | 'resume'
      | 'update-creative'
      | 'submit-creative',
    campaignId = selectedCampaignId
  ) {
    if (!campaignId) {
      setCampaignFeedback('Select a campaign first.');
      return;
    }
    try {
      setIsUpdatingCampaign(true);
      setCampaignFeedback('');
      await requireWalletAction('update a marketing campaign');
      const result = await updateMarketingCampaign({
        campaignId,
        action,
        creative: action === 'update-creative' || action === 'submit-creative' ? campaignCreativeDraft : undefined
      });
      setCampaigns((current) => [result.campaign, ...current.filter((entry) => entry.id !== result.campaign.id)]);
      setSelectedCampaignId(result.campaign.id);
      setCampaignFeedback(
        action === 'start-checkout'
          ? 'Checkout started.'
          : action === 'complete-checkout'
            ? 'Payment settled.'
            : action === 'pause'
              ? 'Campaign paused.'
              : action === 'resume'
                ? 'Campaign resumed.'
                : action === 'submit-creative'
                  ? 'Creative submitted for approval.'
                  : 'Creative updated.'
      );
      if (action === 'start-checkout' && result.checkoutUrl && typeof window !== 'undefined') {
        window.location.href = result.checkoutUrl;
        return;
      }
    } catch (error) {
      setCampaignFeedback(error instanceof Error ? error.message : 'Unable to update campaign right now.');
    } finally {
      setIsUpdatingCampaign(false);
    }
  }

  async function handleSponsorshipInquiry() {
    try {
      setIsSubmittingSponsorship(true);
      setSponsorshipFeedback('');
      const result = await createEnterpriseInquiry({
        channel: 'sponsorship',
        name: sponsorshipInquiry.name,
        email: sponsorshipInquiry.email,
        organization: sponsorshipInquiry.organization,
        scope: sponsorshipInquiry.scope,
        budget: sponsorshipInquiry.budget,
        detail: sponsorshipInquiry.detail
      });
      if (result?.inquiry) {
        setEnterpriseInquiries((current) => [result.inquiry as EnterpriseInquiryRecord, ...current]);
      }
      setSponsorshipInquiry({
        name: '',
        email: '',
        organization: '',
        scope: '',
        budget: '',
        detail: ''
      });
      setSponsorshipFeedback('Sponsorship inquiry submitted to the partnerships team.');
    } catch (error) {
      setSponsorshipFeedback(error instanceof Error ? error.message : 'Unable to submit sponsorship inquiry.');
    } finally {
      setIsSubmittingSponsorship(false);
    }
  }

  async function handleEnterpriseContractUpload(targetId: string, file: File | null) {
    if (!file) return;
    try {
      setUploadingEnterpriseContractTarget(targetId);
      setEnterpriseFeedback('');
      const uploaded = await uploadEnterpriseContract(file);
      if (targetId === 'new') {
        setSponsorshipInquiry((current) => ({
          ...current,
          detail: current.detail,
          scope: current.scope,
          budget: current.budget
        }));
      } else {
        setEnterpriseDrafts((current) => ({
          ...current,
          [targetId]: {
            ...(current[targetId] ?? {
              estimatedValue: '',
              pipelineOwner: '',
              pipelineOwnerRole: '',
              nextStep: '',
              expectedCloseDate: '',
              contractLifecycleState: 'draft',
              contractStoragePath: '',
              contractAttachmentUrl: '',
              contractAttachmentName: '',
              contractStage: 'lead',
              status: 'new'
            }),
            contractStoragePath: uploaded.storagePath || '',
            contractAttachmentUrl: uploaded.url || '',
            contractAttachmentName: uploaded.fileName
          }
        }));
      }
      setEnterpriseFeedback(`Uploaded ${uploaded.fileName}.`);
    } catch (error) {
      setEnterpriseFeedback(error instanceof Error ? error.message : 'Unable to upload contract attachment.');
    } finally {
      setUploadingEnterpriseContractTarget(null);
    }
  }

  async function handleEnterpriseInquiryUpdate(
    inquiryId: string,
    updates: Partial<Pick<EnterpriseInquiryRecord, 'status' | 'contractStage' | 'contractLifecycleState' | 'estimatedValue' | 'pipelineOwner' | 'pipelineOwnerRole' | 'nextStep' | 'expectedCloseDate' | 'contractStoragePath' | 'contractAttachmentUrl' | 'contractAttachmentName'>>
  ) {
    try {
      setIsUpdatingEnterpriseInquiry(inquiryId);
      setEnterpriseFeedback('');
      const inquiry = await updateEnterpriseInquiryRecord({
        id: inquiryId,
        ...updates
      });
      setEnterpriseInquiries((current) => [inquiry, ...current.filter((entry) => entry.id !== inquiry.id)]);
      setEnterpriseDrafts((current) => ({
        ...current,
        [inquiry.id]: {
          estimatedValue: inquiry.estimatedValue ? String(inquiry.estimatedValue) : '',
          pipelineOwner: inquiry.pipelineOwner || '',
          pipelineOwnerRole: inquiry.pipelineOwnerRole || '',
          nextStep: inquiry.nextStep || '',
          expectedCloseDate: inquiry.expectedCloseDate ? inquiry.expectedCloseDate.slice(0, 10) : '',
          contractLifecycleState: inquiry.contractLifecycleState || 'draft',
          contractStoragePath: inquiry.contractStoragePath || '',
          contractAttachmentUrl: inquiry.contractAttachmentUrl || '',
          contractAttachmentName: inquiry.contractAttachmentName || '',
          contractStage: inquiry.contractStage,
          status: inquiry.status
        }
      }));
      setEnterpriseFeedback(`Updated ${inquiry.organization || inquiry.name}.`);
    } catch (error) {
      setEnterpriseFeedback(error instanceof Error ? error.message : 'Unable to update enterprise inquiry.');
    } finally {
      setIsUpdatingEnterpriseInquiry(null);
    }
  }

  async function openEnterpriseContractForDraft(draft: {
    contractStoragePath: string;
    contractAttachmentUrl: string;
  }) {
    try {
      const url = draft.contractStoragePath
        ? await fetchEnterpriseContractAccessUrl(draft.contractStoragePath)
        : draft.contractAttachmentUrl;
      if (url && typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setEnterpriseFeedback(error instanceof Error ? error.message : 'Unable to open contract attachment.');
    }
  }

  function loadBundleDraft(bundle?: ProfileBundle) {
    if (!bundle) {
      setBundleDraft({
        id: `bundle-${Date.now()}`,
        name: '',
        summary: '',
        cover: '',
        itemIds: [],
        priceLabel: '',
        savingsLabel: '',
        ctaLabel: 'View bundle',
        ctaType: 'shop',
        leadAudience: 'collectors',
        visibility: 'public'
      });
      setBundleFeedback('Ready to create a new bundle.');
      return;
    }
    setBundleDraft({
      id: bundle.id,
      name: bundle.name,
      summary: bundle.summary,
      cover: bundle.cover,
      itemIds: bundle.itemIds,
      priceLabel: bundle.priceLabel,
      savingsLabel: bundle.savingsLabel,
      ctaLabel: bundle.ctaLabel,
      ctaType: bundle.ctaType ?? 'shop',
      leadAudience: bundle.leadAudience ?? 'collectors',
      visibility: bundle.visibility ?? 'public'
    });
    setBundleFeedback(`Editing ${bundle.name}.`);
  }

  async function handleSaveBundle() {
    if (!bundleDraft.name.trim() || bundleDraft.itemIds.length === 0) {
      setBundleFeedback('Give the bundle a name and choose at least one item.');
      return;
    }
    try {
      setIsSavingBundle(true);
      setBundleFeedback('');
      await requireWalletAction('save a storefront bundle');
      const bundlePillars = bundleOfferings.reduce<ProfileBundle['pillarBreakdown']>((acc, offering) => {
        const existing = acc.find((entry) => entry.pillar === offering.pillar);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ pillar: offering.pillar, icon: offering.icon, count: 1 });
        }
        return acc;
      }, []);
      const result = await saveProfileBundle({
        slug,
        bundle: {
          id: bundleDraft.id,
          name: bundleDraft.name,
          summary: bundleDraft.summary,
          cover: bundleDraft.cover || bundleOfferings[0]?.image || '',
          itemIds: bundleDraft.itemIds,
          pillarBreakdown: bundlePillars,
          priceLabel: bundleDraft.priceLabel,
          savingsLabel: bundleDraft.savingsLabel,
          ctaLabel: bundleDraft.ctaLabel,
          ctaType: bundleDraft.ctaType,
          leadAudience: bundleDraft.leadAudience,
          visibility: bundleDraft.visibility
        }
      });
      setProfile(result.profile);
      setBundleFeedback('Bundle saved. Your storefront can feature it immediately.');
    } catch (error) {
      setBundleFeedback(error instanceof Error ? error.message : 'Unable to save bundle right now.');
    } finally {
      setIsSavingBundle(false);
    }
  }

  async function handleLaunchpadStatusUpdate(campaignSlug: string, status: LaunchpadCampaignStatus) {
    try {
      setIsUpdatingLaunchpadCampaignSlug(campaignSlug);
      setLaunchpadFeedback('');
      const updated = await updateLaunchpadCampaignStatusApi({ campaignSlug, status });
      if (!updated) {
        throw new Error('Unable to update Launchpad campaign.');
      }
      setLaunchpadCampaigns((current) => [updated, ...current.filter((entry) => entry.slug !== updated.slug)]);
      setLaunchpadFeedback(
        status === 'draft'
          ? 'Campaign moved back to draft.'
          : status === 'pending_review'
            ? 'Campaign submitted for review.'
            : 'Campaign published to Launchpad.'
      );
    } catch (error) {
      setLaunchpadFeedback(error instanceof Error ? error.message : 'Unable to update Launchpad campaign.');
    } finally {
      setIsUpdatingLaunchpadCampaignSlug('');
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {isOffline && (
        <div className="rounded-[24px] border border-[#d4af37]/25 bg-[#d4af37]/10 px-5 py-4 text-sm text-[#f3deb1]">
          <div className="flex items-center gap-3">
            <WifiOff size={16} className="text-[#d4af37]" />
            You're offline. Your work is saved and will upload when connected.
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(140deg,#111111_0%,#191919_58%,#0d0d0d_100%)] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(181,29,25,0.14),transparent_30%)]" />
        <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr,0.75fr] lg:p-8">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#f3d780]">
                  <Sparkles size={12} />
                  Creator Hub
                </div>
                <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Welcome back, {profile.displayName.split(' ')[0]}.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300">
                  {workspaceMode === 'simple'
                    ? 'Simple mode keeps the next step narrow: publish something, manage what is live, or check what you have earned.'
                    : 'Pro mode gives you the full cross-pillar studio for publishing, merchandising, campaigns, shipping, analytics, and compliance.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <div className="inline-flex rounded-full border border-white/10 bg-black/30 p-1">
                  <button
                    onClick={() => setWorkspaceMode('simple')}
                    className={`rounded-full px-4 py-2 text-sm ${workspaceMode === 'simple' ? 'bg-[#d4af37] text-black' : 'text-gray-300 hover:text-white'}`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setWorkspaceMode('pro')}
                    className={`rounded-full px-4 py-2 text-sm ${workspaceMode === 'pro' ? 'bg-[#d4af37] text-black' : 'text-gray-300 hover:text-white'}`}
                  >
                    Pro
                  </button>
                </div>
                <Link href={`/profile/${profile.slug}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35 hover:text-[#f3d780]">
                  <Store size={15} />
                  View Store
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <StatCard label="Sales (MTD)" value={profile.dashboardStats.salesMtd} />
              <StatCard label="Listings" value={String(profile.dashboardStats.activeListings)} />
              <StatCard label="Followers" value={profile.dashboardStats.followers.toLocaleString()} />
              <StatCard label="Earnings available" value={profile.dashboardStats.availablePayout} />
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(0,0,0,0.24),rgba(18,18,18,0.78))] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Storefront mode</p>
                  <p className="mt-2 text-sm text-gray-300">Toggle between your solo storefront and any nation storefronts you are allowed to operate. Both use Creator Hub. Social Community stays separate.</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link href="/communities" className="rounded-full border border-white/10 px-4 py-2 text-white hover:border-[#d4af37]/35">Nations & Communities</Link>
                  <Link href="/communities/create" className="rounded-full bg-[#d4af37] px-4 py-2 font-semibold text-black">Create nation/community page</Link>
                </div>
              </div>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-[#0f0f0f] p-2">
                <div className="flex flex-wrap gap-2">
                {soloStorefrontAccount ? (
                  <button
                    onClick={() => setActiveAccountSlug(soloStorefrontAccount.slug)}
                    className={`min-w-[220px] flex-1 rounded-[18px] border px-4 py-3 text-left transition-all ${
                      activePlatformAccount?.id === soloStorefrontAccount.id
                        ? 'border-[#d4af37]/45 bg-[#d4af37]/12'
                        : 'border-white/10 bg-black/25 hover:border-[#d4af37]/25'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Solo storefront</p>
                    <p className="mt-1 text-sm font-semibold text-white">{soloStorefrontAccount.displayName}</p>
                    <p className="mt-1 text-xs text-gray-400">Use your individual creator store across the active pillars.</p>
                  </button>
                ) : null}
                {nationStorefrontAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => setActiveAccountSlug(account.slug)}
                    className={`min-w-[220px] flex-1 rounded-[18px] border px-4 py-3 text-left transition-all ${
                      activePlatformAccount?.id === account.id
                        ? 'border-[#d4af37]/45 bg-[#d4af37]/12'
                        : 'border-white/10 bg-black/25 hover:border-[#d4af37]/25'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Nation storefront</p>
                    <p className="mt-1 text-sm font-semibold text-white">{account.displayName}</p>
                    <p className="mt-1 text-xs text-gray-400">{account.nation || 'No nation label yet'} | treasury-aware selling</p>
                  </button>
                ))}
                </div>
              </div>
              {activePlatformAccount ? (
                <div className="mt-4 rounded-[22px] border border-[#d4af37]/20 bg-[#d4af37]/10 p-4 text-sm text-[#f3deb1]">
                  Active storefront mode: <span className="font-semibold text-white">{activePlatformAccount.displayName}</span>. Anything you publish from Creator Hub now follows this store context, payout route, and split logic.
                </div>
              ) : null}
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Current mode</p>
                  <p className="mt-2 text-sm font-medium text-white">{storefrontContextLabel}</p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Split rules</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {activePlatformAccount && ['community', 'tribe', 'collective'].includes(activePlatformAccount.accountType)
                      ? 'Treasury-aware and split-aware routing'
                      : 'Standard creator payout routing'}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Launchpad context</p>
                  <p className="mt-2 text-sm font-medium text-white">{activePlatformAccount?.displayName || profile.displayName}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link href={activePlatformAccount?.accountType === 'artist' ? `/profile/${slug}` : activePlatformAccount ? `/communities/${activePlatformAccount.slug}` : `/profile/${slug}`} className="rounded-full border border-white/10 px-4 py-2 text-white hover:border-[#d4af37]/35">
                  View active storefront
                </Link>
                <Link href="/launchpad" className="rounded-full border border-white/10 px-4 py-2 text-white hover:border-[#d4af37]/35">Launchpad</Link>
                <Link href={launchpadBuilderHref} className="rounded-full bg-[#d4af37] px-4 py-2 font-semibold text-black hover:bg-[#f4d370]">
                  Start Launchpad campaign
                </Link>
                {activePlatformAccount && ['community', 'tribe', 'collective'].includes(activePlatformAccount.accountType) ? (
                  <>
                    <Link href={`/communities/${activePlatformAccount.slug}/store`} className="rounded-full border border-white/10 px-4 py-2 text-white hover:border-[#d4af37]/35">Nation store</Link>
                    <Link href={`/communities/${activePlatformAccount.slug}/treasury`} className="rounded-full border border-white/10 px-4 py-2 text-white hover:border-[#d4af37]/35">Nation treasury</Link>
                  </>
                ) : null}
              </div>
              {accountFeedback ? <p className="mt-3 text-sm text-[#f3deb1]">{accountFeedback}</p> : null}
              <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Your represented community storefronts</p>
                    <p className="mt-2 text-sm text-gray-300">
                      These are the nation and community pages you can currently operate from Creator Hub.
                    </p>
                  </div>
                  <Link href="/communities/create" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35">
                    Add another community page
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {communityStorefrontCards.length > 0 ? (
                    communityStorefrontCards.map((account) => (
                      <div key={account.id} className="rounded-[20px] border border-white/10 bg-[#111111] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{account.displayName}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              {account.accountType} | {account.nation || 'No nation label yet'}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#d4af37]">
                            {account.verificationStatus}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-300">{account.reviewLabel}</p>
                        <p className="mt-2 text-sm text-white/70">{account.treasuryLabel}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-sm">
                          <button
                            onClick={() => setActiveAccountSlug(account.slug)}
                            className="rounded-full bg-[#d4af37] px-4 py-2 font-semibold text-black hover:bg-[#f4d370]"
                          >
                            Work in this storefront
                          </button>
                          <Link href={`/communities/${account.slug}`} className="rounded-full border border-white/10 px-4 py-2 text-white hover:border-[#d4af37]/35">
                            Open page
                          </Link>
                          <Link href={`/communities/${account.slug}/verification`} className="rounded-full border border-white/10 px-4 py-2 text-white hover:border-[#d4af37]/35">
                            Verification
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-white/10 bg-[#111111] p-4 text-sm text-gray-400 md:col-span-2">
                      No community storefronts are linked to your current identity yet. Create one when you are ready to operate on behalf of a nation, tribe, or collective.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(212,175,55,0.14),rgba(14,14,14,0.92))] p-5 shadow-[0_22px_48px_rgba(212,175,55,0.08)]">
            <div className="flex items-center gap-2 text-[#d4af37]">
              <Wallet size={16} />
              <p className="text-xs uppercase tracking-[0.24em]">Payouts</p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{profile.dashboardStats.availablePayout}</p>
            <p className="mt-2 text-sm text-[#d8d2c5]">Ready to withdraw across your live pillars.</p>
            <div className="mt-5 space-y-3 text-sm text-gray-300">
              <SimpleStat label="Followers gained this week" value={`+${Math.max(followers.length, 3)}`} />
              <SimpleStat label="Unread conversations" value={String(unreadThreadCount)} />
              <SimpleStat label="Following" value={String(following.length)} />
            </div>
            <Link href="/wallet/services?view=payouts" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370]">
              Open wallet services
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#101010] p-4 md:p-5">
        {workspaceMode === 'simple' ? (
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {SIMPLE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`rounded-[22px] border p-4 text-left transition-all ${
                    activeTab === item.id
                      ? 'border-[#d4af37]/35 bg-[#d4af37]/10'
                      : 'border-white/10 bg-black/20 hover:border-[#d4af37]/30'
                  }`}
                >
                  <Icon size={18} className="text-[#d4af37]" />
                  <p className="mt-3 text-sm font-medium text-white">{SIMPLE_TAB_LABELS[item.id]}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${activeTab === tab.id ? 'bg-[#d4af37] text-black' : 'border border-white/10 bg-black/20 text-gray-300 hover:border-[#d4af37]/35 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {activePlatformAccount && isCommunityStorefrontAccount(activePlatformAccount) ? (
            <section className="rounded-[30px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.08),rgba(17,17,17,0.92))] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Community storefront performance</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{activePlatformAccount.displayName}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-300">
                    Represented-community analytics stay inside Creator Hub so we can judge listing depth, treasury routing intent, and actual treasury capture without jumping out to the public storefront.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/72">
                  {communityAnalyticsLoading ? 'Refreshing storefront analytics...' : activeCommunityStorefrontState?.detail || 'Community storefront analytics'}
                </div>
              </div>
              {communityAnalytics ? (
                <>
                  <div className="mt-5 grid gap-4 md:grid-cols-4">
                    <StatCard label="Live offers" value={communityAnalytics.summary.liveOfferCount.toString()} />
                    <StatCard label="Projected gross" value={`$${communityAnalytics.summary.projectedGrossValue.toLocaleString()}`} />
                    <StatCard label="Realized flow" value={`$${communityAnalytics.summary.realizedGrossValue.toLocaleString()}`} />
                    <StatCard label="Treasury capture" value={`$${communityAnalytics.summary.realizedTreasuryValue.toLocaleString()}`} />
                  </div>
                  <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
                    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Top split routes</p>
                      <div className="mt-4 space-y-3">
                        {topCommunityRoutes.map((route) => (
                          <div key={route.routingKey} className="rounded-[20px] border border-white/10 bg-[#111111] p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-medium text-white">{route.label}</p>
                                <p className="mt-1 text-xs text-gray-400">{route.liveOfferCount} live offers | {route.realizedOrderCount} realized orders</p>
                              </div>
                              <span className="text-sm font-semibold text-[#d4af37]">{route.sellThroughRate}% sell-through</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Best-performing pillars</p>
                      <div className="mt-4 space-y-3">
                        {topCommunityPillars.map((pillar) => (
                          <div key={pillar.pillarLabel} className="rounded-[20px] border border-white/10 bg-[#111111] p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-medium text-white">{pillar.pillarLabel}</p>
                                <p className="mt-1 text-xs text-gray-400">{pillar.liveOfferCount} live offers | ${pillar.projectedGrossValue.toLocaleString()} projected</p>
                              </div>
                              <span className="text-sm font-semibold text-[#d4af37]">{pillar.treasuryCaptureRate}% capture</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-gray-300">
                  {communityAnalyticsLoading
                    ? 'Loading community storefront analytics.'
                    : 'This storefront does not have treasury performance data yet. Publish community-owned listings and let routing activity build the analytics surface.'}
                </div>
              )}
            </section>
          ) : null}
          {workspaceMode === 'simple' && (
            <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
              <Panel title="Start here" eyebrow="Recommended flow" icon={Sparkles}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => setActiveTab('create')}
                    className="rounded-[28px] border border-[#d4af37]/25 bg-[linear-gradient(180deg,rgba(212,175,55,0.14),rgba(0,0,0,0.18))] p-6 text-left hover:border-[#d4af37]/45"
                  >
                    <Plus size={22} className="text-[#d4af37]" />
                    <p className="mt-4 text-xl font-medium text-white">Add my work</p>
                    <p className="mt-2 text-sm leading-7 text-gray-300">Start a new art piece, class, service, trip, or product.</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-left hover:border-[#d4af37]/30"
                  >
                    <Package size={22} className="text-[#d4af37]" />
                    <p className="mt-4 text-xl font-medium text-white">See my items</p>
                    <p className="mt-2 text-sm leading-7 text-gray-300">Check what is live, change status, or fix something quickly.</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('earnings')}
                    className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-left hover:border-[#d4af37]/30"
                  >
                    <Wallet size={22} className="text-[#d4af37]" />
                    <p className="mt-4 text-xl font-medium text-white">See my money</p>
                    <p className="mt-2 text-sm leading-7 text-gray-300">Check what is ready to withdraw and what is still pending.</p>
                  </button>
                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Secondary actions</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab('help')}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/30"
                      >
                        <LifeBuoy size={16} className="text-[#d4af37]" />
                        Get help
                      </button>
                      <Link
                        href={launchpadBuilderHref}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/30"
                      >
                        <Heart size={16} className="text-[#d4af37]" />
                        Raise funds
                      </Link>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-gray-300">Start with one of the three main actions above. Help and fundraising stay here when you need them, but they do not compete with your first step.</p>
                  </div>
                </div>
                <div className="mt-5 rounded-[24px] border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-4 text-sm text-[#f3deb1]">
                  Best first-run path: publish one thing, confirm it is live, then check the money tab after the first order or booking.
                </div>
              </Panel>

              <Panel title="Today at a glance" eyebrow="Only the essentials" icon={Bell}>
                <div className="space-y-3">
                  {creatorPriorities.map((item) => (
                    <div key={item.title} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">{item.detail}</p>
                      {'href' in item ? (
                        <Link href={item.href} className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/30 hover:text-[#f4d370]">
                          {item.cta}
                        </Link>
                      ) : (
                        <button
                          onClick={() => setActiveTab(item.targetTab)}
                          className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/30 hover:text-[#f4d370]"
                        >
                          {item.cta}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-medium text-white">Need help right now?</p>
                  <p className="mt-2 text-sm leading-7 text-gray-300">Use the Help tab or ask a Digital Champion to guide you step by step.</p>
                  <button
                    onClick={() => setActiveTab('help')}
                    className="mt-4 rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]"
                  >
                    Open help
                  </button>
                </div>
              </Panel>
            </section>
          )}

          {workspaceMode === 'pro' && (
          <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <Panel title="Operate now" eyebrow="Focused pro workflow" icon={Plus}>
              <div className="grid gap-4 sm:grid-cols-2">
                {proWorkspaceActions.map((action) => {
                  const Icon = action.icon;
                  const className =
                    action.tone === 'highlight'
                      ? 'border-[#d4af37]/30 bg-[linear-gradient(180deg,rgba(212,175,55,0.14),rgba(0,0,0,0.18))] hover:border-[#d4af37]/45'
                      : 'border-white/10 bg-black/20 hover:border-[#d4af37]/30';

                  return 'href' in action ? (
                    <Link key={action.title} href={action.href} className={`rounded-[24px] border p-5 ${className}`}>
                      <Icon size={20} className="text-[#d4af37]" />
                      <p className="mt-4 text-base font-medium text-white">{action.title}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">{action.detail}</p>
                      <span className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-white">
                        {action.cta}
                      </span>
                    </Link>
                  ) : (
                    <button key={action.title} onClick={() => setActiveTab(action.targetTab)} className={`rounded-[24px] border p-5 text-left ${className}`}>
                      <Icon size={20} className="text-[#d4af37]" />
                      <p className="mt-4 text-base font-medium text-white">{action.title}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">{action.detail}</p>
                      <span className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-white">
                        {action.cta}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <SimpleStat label="Unread conversations" value={String(unreadThreadCount)} />
                <SimpleStat
                  label="Launchpad review queue"
                  value={String(launchpadCampaignGroups.draft.length + launchpadCampaignGroups.pendingReview.length)}
                />
                <SimpleStat label="Live campaigns" value={String(launchpadCampaignGroups.published.length)} />
              </div>
              <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-white">Publishing lanes</p>
                <p className="mt-2 text-sm leading-7 text-gray-300">We trimmed pro mode to the main operating lanes. Choose the lane you need instead of scanning every creation surface at once.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {proWorkspaceLanes.map((lane) => (
                    <div key={lane.title} className="rounded-[20px] border border-white/10 bg-black/15 p-4">
                      <p className="text-sm font-medium text-white">{lane.title}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-400">{lane.detail}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {lane.actions.map((action) => (
                          <Link key={action.label} href={action.href} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white hover:border-[#d4af37]/30 hover:text-[#f4d370]">
                            {action.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="Storefront pulse" eyebrow="Live studio signal" icon={Bell}>
              <div className="space-y-3">
                {profile.activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-gray-400">{item.detail}</p>
                      </div>
                      <span className="rounded-full border border-[#d4af37]/20 px-3 py-1 text-xs text-[#d4af37]">{item.ago}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[24px] border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-4 text-sm text-[#f3deb1]">
                Current storefront context: {activePlatformAccount?.displayName || profile.displayName}. Anything you publish, promote, or fundraise from here follows that context until you switch.
              </div>
            </Panel>
          </section>
          )}

          {workspaceMode === 'pro' && (
          <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <Panel title="My Listings" eyebrow="Latest five" icon={Palette} action={<button onClick={() => setActiveTab('listings')} className="text-sm text-[#d4af37] hover:text-[#f4d370]">View all</button>}>
              <div className="space-y-3">
                {profile.offerings.slice(0, 5).map((offering) => (
                  <div key={offering.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{offering.title}</p>
                      <p className="mt-1 text-xs text-gray-400">{offering.pillarLabel} | {offering.status ?? 'Active'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#d4af37]">{offering.priceLabel}</p>
                      <Link href={getCreatorHubEditHref(offering.id)} className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white">Edit <ChevronRight size={12} /></Link>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Need Help?" eyebrow="Digital Champion" icon={LifeBuoy}>
              <div className="rounded-[24px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(212,175,55,0.12),rgba(0,0,0,0.08))] p-5">
                <p className="text-base font-medium text-white">Talk to a Digital Champion</p>
                <p className="mt-2 text-sm leading-7 text-gray-300">Get guided help with listings, media uploads, pricing, or profile setup. Designed for elders, first-time sellers, and creators working from mobile.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => setActiveTab('help')} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Start chat</button>
                  <button
                    onClick={() => void handleSupportRequest('Digital Champion callback', 'Please arrange a callback for listing, pricing, or storefront help.', 'callback')}
                    className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
                  >
                    Request callback
                  </button>
                </div>
              </div>
            </Panel>
          </section>
          )}

          <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <Panel title="Launchpad Review Queue" eyebrow="Active storefront fundraising" icon={Heart} action={<Link href={launchpadBuilderHref} className="text-sm text-[#d4af37] hover:text-[#f4d370]">New campaign</Link>}>
              <div className="space-y-3">
                {launchpadFeedback ? (
                  <div className="rounded-[22px] border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">
                    {launchpadFeedback}
                  </div>
                ) : null}
                {launchpadCampaignGroups.draft.map((campaign) => (
                  <div key={campaign.slug} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{campaign.title}</p>
                        <p className="mt-1 text-xs text-gray-400">{campaign.beneficiaryName} | Draft</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">Draft</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-300">{campaign.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/launchpad/${campaign.slug}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/30">
                        Preview
                      </Link>
                      <button
                        onClick={() => void handleLaunchpadStatusUpdate(campaign.slug, 'pending_review')}
                        disabled={isUpdatingLaunchpadCampaignSlug === campaign.slug}
                        className="rounded-full border border-[#d4af37]/25 px-4 py-2 text-sm text-[#f3deb1] disabled:opacity-60"
                      >
                        {isUpdatingLaunchpadCampaignSlug === campaign.slug ? 'Submitting...' : 'Submit for review'}
                      </button>
                      <button
                        onClick={() => void handleLaunchpadStatusUpdate(campaign.slug, 'published')}
                        disabled={isUpdatingLaunchpadCampaignSlug === campaign.slug}
                        className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60"
                      >
                        {isUpdatingLaunchpadCampaignSlug === campaign.slug ? 'Publishing...' : 'Publish now'}
                      </button>
                    </div>
                  </div>
                ))}
                {launchpadCampaignGroups.pendingReview.map((campaign) => (
                  <div key={campaign.slug} className="rounded-[22px] border border-[#d4af37]/18 bg-[linear-gradient(180deg,rgba(212,175,55,0.10),rgba(0,0,0,0.18))] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{campaign.title}</p>
                        <p className="mt-1 text-xs text-gray-400">{campaign.beneficiaryName} | Pending review</p>
                      </div>
                      <span className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#f3deb1]">Review</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-300">Ready for a final pass. You can send it back to draft or push it live immediately.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => void handleLaunchpadStatusUpdate(campaign.slug, 'draft')}
                        disabled={isUpdatingLaunchpadCampaignSlug === campaign.slug}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/30 disabled:opacity-60"
                      >
                        {isUpdatingLaunchpadCampaignSlug === campaign.slug ? 'Updating...' : 'Move to draft'}
                      </button>
                      <button
                        onClick={() => void handleLaunchpadStatusUpdate(campaign.slug, 'published')}
                        disabled={isUpdatingLaunchpadCampaignSlug === campaign.slug}
                        className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60"
                      >
                        {isUpdatingLaunchpadCampaignSlug === campaign.slug ? 'Publishing...' : 'Approve and publish'}
                      </button>
                    </div>
                  </div>
                ))}
                {launchpadCampaignGroups.draft.length === 0 && launchpadCampaignGroups.pendingReview.length === 0 ? (
                  <p className="text-sm text-gray-400">No draft or pending-review Launchpad campaigns for the active storefront yet.</p>
                ) : null}
              </div>
            </Panel>

            <Panel title="Live Launchpad Campaigns" eyebrow="Published now" icon={TrendingUp}>
              <div className="space-y-3">
                {launchpadCampaignGroups.published.map((campaign) => (
                  <div key={campaign.slug} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{campaign.title}</p>
                        <p className="mt-1 text-xs text-gray-400">{campaign.sponsorCount.toLocaleString()} backers | ${campaign.raisedAmount.toLocaleString()} raised</p>
                      </div>
                      <span className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs text-emerald-300">Live</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#f3dfb1,#d7a04d,#bf7a1f)]"
                        style={{ width: `${Math.min(100, Math.round((campaign.raisedAmount / Math.max(campaign.goalAmount, 1)) * 100))}%` }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/launchpad/${campaign.slug}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/30">
                        View live page
                      </Link>
                      <button
                        onClick={() => void handleLaunchpadStatusUpdate(campaign.slug, 'draft')}
                        disabled={isUpdatingLaunchpadCampaignSlug === campaign.slug}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/30 disabled:opacity-60"
                      >
                        {isUpdatingLaunchpadCampaignSlug === campaign.slug ? 'Updating...' : 'Move to draft'}
                      </button>
                    </div>
                  </div>
                ))}
                {launchpadCampaignGroups.published.length === 0 ? (
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <p className="text-sm font-medium text-white">Nothing live for {activePlatformAccount?.displayName || 'this storefront'} yet.</p>
                    <p className="mt-2 text-sm leading-6 text-gray-400">Start one from Creator Hub and it will inherit the current solo or nation storefront context automatically.</p>
                  </div>
                ) : null}
              </div>
            </Panel>

            <Panel title="Hybrid Funding Visibility" eyebrow="Phase 8" icon={Heart}>
              {hybridFundingSummary ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <StatCard label="Receipts" value={String(hybridFundingSummary.totalReceipts)} />
                    <StatCard label="Gross" value={`$${Math.round(hybridFundingSummary.totalGrossAmount).toLocaleString()}`} />
                    <StatCard label="Service layer" value={`$${Math.round(hybridFundingSummary.totalServiceFees).toLocaleString()}`} />
                    <StatCard label="Net routed" value={`$${Math.round(hybridFundingSummary.totalNetAmount).toLocaleString()}`} />
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      {hybridFundingSummary.bySource.filter((entry) => entry.count > 0).map((entry) => (
                        <div key={entry.key} className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                          <p className="text-sm font-medium text-white">{entry.label}</p>
                          <p className="mt-1 text-xs text-gray-400">{entry.count} receipts</p>
                          <p className="mt-2 text-sm text-[#d4af37]">${Math.round(entry.netAmount).toLocaleString()} net</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {hybridFundingReceipts.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-white">{entry.campaignTitle || entry.sevaProjectTitle || entry.beneficiaryLabel}</p>
                            <p className="mt-1 text-xs text-gray-400">{entry.source === 'launchpad' ? entry.laneLabel : `Seva | ${entry.laneLabel}`}</p>
                          </div>
                          <span className="rounded-full border border-[#d4af37]/20 px-3 py-1 text-xs text-[#f3deb1]">${Math.round(entry.amountGross).toLocaleString()}</span>
                        </div>
                        <p className="mt-3 text-sm text-gray-300">{entry.supporterName} supported this route and ${Math.round(entry.beneficiaryNet).toLocaleString()} was recorded as net onward value.</p>
                      </div>
                    ))}
                    {hybridFundingReceipts.length === 0 ? (
                      <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-white">No hybrid funding receipts for this storefront yet.</p>
                        <p className="mt-2 text-sm leading-6 text-gray-400">Launchpad and Seva receipts will show up here as soon as this storefront starts raising or receiving support.</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-medium text-white">Hybrid funding visibility is empty for this storefront right now.</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">Once Launchpad or Seva receipts are recorded for the active storefront, Creator Hub will summarize them here.</p>
                </div>
              )}
            </Panel>
          </section>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="space-y-6">
          <Panel title={workspaceMode === 'simple' ? 'What are you sharing today?' : 'What are you selling?'} eyebrow="Unified listing workflow" icon={Mic}>
            {profile.creatorPlanCapabilities?.maxListings !== null ? (
              <div className="mb-4 rounded-[24px] border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-4 text-sm text-[#f3deb1]">
                Creator Free supports up to {profile.creatorPlanCapabilities?.maxListings ?? 0} active listings. You currently have {profile.offerings.length}. Upgrade to Creator or Studio for unlimited publishing and advanced analytics.
              </div>
            ) : null}
            {activeCommunityStorefrontState && activePlatformAccount ? (
              <div className="mb-4 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Publishing as {activePlatformAccount.displayName}</p>
                    <p className="mt-2 text-sm font-medium text-white">{activeCommunityStorefrontState.title}</p>
                    <p className="mt-2 text-sm leading-7 text-gray-400">{activeCommunityStorefrontState.detail}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${activeCommunityStorefrontState.badgeClassName}`}>
                    {activeCommunityStorefrontState.badgeLabel}
                  </span>
                </div>
              </div>
            ) : null}
            {workspaceMode === 'simple' ? (
              <div className="space-y-4">
                <div className="rounded-[24px] border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-4 text-sm text-[#f3deb1]">
                  Step 1: choose the kind of thing you want to share. Step 2: we open the right path and keep your return route back here.
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {CREATE_LAUNCHERS.map((launcher) => {
                    const Icon = launcher.icon;
                    const isSelected = launcher.title === selectedCreateLauncher;
                    return (
                      <button
                        key={launcher.title}
                        onClick={() => setSelectedCreateLauncher(launcher.title)}
                        className={`rounded-[28px] border p-6 text-left transition-all ${
                          isSelected ? 'border-[#d4af37]/45 bg-[#d4af37]/10' : 'border-white/10 bg-black/20 hover:border-[#d4af37]/30'
                        }`}
                      >
                        <Icon size={24} className="text-[#d4af37]" />
                        <p className="mt-4 text-xl font-medium text-white">{launcher.title}</p>
                        <p className="mt-2 text-sm leading-7 text-gray-300">{launcher.detail}</p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 px-3 py-1 text-xs text-[#d4af37]">
                          {isSelected ? 'Chosen' : 'Choose this'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {CREATE_LAUNCHERS.map((launcher) => {
                  const Icon = launcher.icon;
                  const isSelected = launcher.title === selectedCreateLauncher;
                  return (
                    <button
                      key={launcher.title}
                      onClick={() => setSelectedCreateLauncher(launcher.title)}
                      className={`rounded-[26px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.2))] p-5 text-left transition-all ${
                        isSelected ? 'border-[#d4af37]/45 bg-[#d4af37]/10' : 'border-white/10 hover:border-[#d4af37]/30'
                      }`}
                    >
                      <Icon size={22} className="text-[#d4af37]" />
                      <p className="mt-4 text-lg font-medium text-white">{launcher.title}</p>
                      <p className="mt-2 text-sm leading-7 text-gray-400">{launcher.detail}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#d4af37]">
                        {isSelected ? 'Selected workflow' : 'Select workflow'} <ChevronRight size={14} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title={selectedCreateConfig.title} eyebrow="Create from inside Creator Hub" icon={selectedCreateConfig.icon}>
            {workspaceMode === 'simple' && (
              <div className="mb-4 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-gray-300">
                Step 2: finish this one path before doing anything else.
              </div>
            )}
            {selectedCreateConfig.title === 'Request Seva Project' ? (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <p className="text-sm leading-7 text-gray-300">
                  Seva stays platform-governed. Start the request from Creator Hub, then the platform review team decides whether it becomes a live Sacred Fund project.
                </p>
                <Link href={withStorefrontContext(selectedCreateConfig.href)} className="mt-5 inline-flex rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                  Open Seva request flow
                </Link>
              </div>
            ) : EMBEDDED_CREATE_PILLARS.includes(resolveLauncherPillar(selectedCreateConfig.title) as (typeof EMBEDDED_CREATE_PILLARS)[number]) ? (
              <QuickCreateClient pillar={resolveLauncherPillar(selectedCreateConfig.title)} embedded simpleMode={workspaceMode === 'simple'} accountSlug={communityPublishingAccountSlug || undefined} />
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <p className="text-sm leading-7 text-gray-300">
                  This pillar already has a dedicated full publishing workflow. We keep you in Creator Hub long enough to choose the right lane, then open the advanced editor with the return path preserved.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <StatusRow title="Full pillar editor" detail="Opens the native publishing experience with Creator Hub return routing." actionLabel="Ready" />
                  <StatusRow title="Creator-first path" detail="Best for deeper media uploads, scheduling, pricing, and pillar-specific settings." actionLabel={activeCommunityStorefrontState ? activeCommunityStorefrontState.badgeLabel : 'Advanced'} />
                </div>
                <Link href={withStorefrontContext(selectedCreateConfig.href)} className="mt-5 inline-flex rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                  {workspaceMode === 'simple' ? 'Keep going on the full page' : 'Open full workflow'}
                </Link>
              </div>
            )}
          </Panel>

          {workspaceMode === 'pro' && (
            <>
              <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
                <Panel title="Unified Listing Studio" eyebrow="Edit without leaving Pro mode" icon={Settings2}>
                  <div className="space-y-3">
                    {profile.offerings.filter((entry) => entry.pillar !== 'seva').slice(0, 8).map((offering) => {
                      const active = offering.id === selectedStudioOfferingId;
                      return (
                        <button
                          key={offering.id}
                          onClick={() => setSelectedStudioOfferingId(offering.id)}
                          className={`w-full rounded-[22px] border p-4 text-left ${
                            active ? 'border-[#d4af37]/35 bg-[#d4af37]/10' : 'border-white/10 bg-black/20 hover:border-[#d4af37]/25'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-white">{offering.title}</p>
                              <p className="mt-1 text-xs text-gray-400">{offering.pillarLabel} | {offering.priceLabel}</p>
                            </div>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-gray-300">
                              {offering.status ?? 'Active'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Panel>

                <Panel title={selectedStudioOffering ? selectedStudioOffering.title : 'Listing editor'} eyebrow="In-hub merchandising" icon={Palette}>
                  {selectedStudioOffering ? (
                    <div className="space-y-4">
                      {activeCommunityStorefrontState && activePlatformAccount ? (
                        <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Storefront publish state</p>
                              <p className="mt-2 text-sm font-medium text-white">{activePlatformAccount.displayName}</p>
                              <p className="mt-2 text-sm leading-7 text-gray-400">{activeCommunityStorefrontState.detail}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${activeCommunityStorefrontState.badgeClassName}`}>
                              {activeCommunityStorefrontState.badgeLabel}
                            </span>
                          </div>
                        </div>
                      ) : null}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldInput label="Title" value={studioOfferingDraft.title} onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, title: value }))} />
                        <FieldInput label="Price label" value={studioOfferingDraft.priceLabel} onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, priceLabel: value }))} />
                        <FieldInput label="Status" value={studioOfferingDraft.status} onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, status: value }))} />
                        <FieldSelect
                          label="Storefront state"
                          value={studioOfferingDraft.availabilityTone}
                          onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, availabilityTone: value as typeof current.availabilityTone }))}
                          options={[
                            { value: 'success', label: 'Ready to buy' },
                            { value: 'warning', label: 'Limited / urgent' },
                            { value: 'default', label: 'Neutral' },
                            { value: 'danger', label: 'Restricted / archived' }
                          ]}
                        />
                      </div>
                      <FieldInput label="Storefront badge" value={studioOfferingDraft.availabilityLabel} onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, availabilityLabel: value }))} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldInput label="Cover image URL" value={studioOfferingDraft.coverImage} onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, coverImage: value }))} />
                        <FieldSelect
                          label="Primary CTA"
                          value={studioOfferingDraft.ctaMode}
                          onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, ctaMode: value as typeof current.ctaMode }))}
                          options={[
                            { value: 'view', label: 'View detail' },
                            { value: 'buy', label: 'Buy now' },
                            { value: 'book', label: 'Book now' },
                            { value: 'enroll', label: 'Enroll now' },
                            { value: 'quote', label: 'Request quote' },
                            { value: 'message', label: 'Message creator' }
                          ]}
                        />
                        <FieldSelect
                          label="Buyer-intent preset"
                          value={studioOfferingDraft.ctaPreset}
                          onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, ctaPreset: value as typeof current.ctaPreset }))}
                          options={[
                            { value: 'collect-now', label: 'Collectors' },
                            { value: 'book-now', label: 'Bookings' },
                            { value: 'enroll-now', label: 'Enrollment' },
                            { value: 'request-quote', label: 'Quotes' },
                            { value: 'message-first', label: 'Conversation first' }
                          ]}
                        />
                        <FieldInput
                          label="Merchandising priority"
                          value={String(studioOfferingDraft.merchandisingRank)}
                          onChange={(value) =>
                            setStudioOfferingDraft((current) => ({
                              ...current,
                              merchandisingRank: Number.isFinite(Number(value)) ? Number(value) : 0
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldInput label="Launch window start" type="datetime-local" value={studioOfferingDraft.launchWindowStartsAt} onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, launchWindowStartsAt: value }))} />
                        <FieldInput label="Launch window end" type="datetime-local" value={studioOfferingDraft.launchWindowEndsAt} onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, launchWindowEndsAt: value }))} />
                      </div>
                      <FieldInput
                        label="Gallery order"
                        value={studioOfferingDraft.galleryOrder.join(', ')}
                        onChange={(value) =>
                          setStudioOfferingDraft((current) => ({
                            ...current,
                            galleryOrder: value.split(',').map((entry) => entry.trim()).filter(Boolean)
                          }))
                        }
                      />
                      <FieldTextArea label="Short storefront story" value={studioOfferingDraft.blurb} onChange={(value) => setStudioOfferingDraft((current) => ({ ...current, blurb: value }))} />
                      <ToggleCard title="Pin this listing to storefront" enabled={studioOfferingDraft.featured} onToggle={() => setStudioOfferingDraft((current) => ({ ...current, featured: !current.featured }))} />
                      {studioPreviewOffering ? (
                        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
                          <div className="h-40">
                            <img src={getOfferingImage(studioPreviewOffering)} alt={studioPreviewOffering.title} className="h-full w-full object-cover" />
                          </div>
                          <div className="space-y-3 p-4">
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-gray-300">{studioPreviewOffering.status || 'Active'}</span>
                              {studioPreviewOffering.availabilityLabel ? <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-gray-300">{studioPreviewOffering.availabilityLabel}</span> : null}
                              {getOfferingLaunchBadge(studioPreviewOffering) ? <span className="rounded-full border border-cyan-400/30 px-3 py-1 text-[11px] text-cyan-100">{getOfferingLaunchBadge(studioPreviewOffering)}</span> : null}
                              <span className="rounded-full border border-[#d4af37]/20 px-3 py-1 text-[11px] text-[#d4af37]">{getOfferingCtaLabel(studioPreviewOffering)}</span>
                            </div>
                            <div>
                              <p className="text-base font-semibold text-white">{studioPreviewOffering.title}</p>
                              <p className="mt-1 text-sm text-gray-400">{studioPreviewOffering.pillarLabel}</p>
                            </div>
                            <p className="text-sm leading-6 text-gray-300">{studioPreviewOffering.blurb}</p>
                            <p className="text-sm font-semibold text-[#d4af37]">{studioPreviewOffering.priceLabel}</p>
                          </div>
                        </div>
                      ) : null}
                      <div className="grid gap-3 md:grid-cols-2">
                        <SimpleStat label="Native editor" value={selectedStudioOffering.pillarLabel} />
                        <SimpleStat label="Current state" value={studioPreviewOffering?.availabilityLabel || studioOfferingDraft.availabilityLabel || 'Available now'} />
                      </div>
                      {studioFeedback && <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{studioFeedback}</div>}
                      <div className="flex flex-wrap gap-3">
                        <button onClick={handleSaveStudioOffering} disabled={isSavingStudioOffering} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60">
                          {isSavingStudioOffering ? 'Saving...' : 'Save in hub'}
                        </button>
                        <Link href={getCreatorHubEditHref(selectedStudioOffering.id, communityPublishingAccountSlug || undefined)} className="rounded-full border border-white/10 px-5 py-3 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
                          Open full hub editor
                        </Link>
                        <Link href={getNativeCreatorEditorHref(selectedStudioOffering, profile.slug, communityPublishingAccountSlug || undefined)} className="rounded-full border border-[#d4af37]/20 px-5 py-3 text-sm text-[#d4af37] hover:border-[#d4af37]/45 hover:text-[#f4d370]">
                          Advanced pillar editor
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Choose a listing to edit it here.</p>
                  )}
                </Panel>
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                <FeatureCard icon={Mic} title="Voice-first description" body="Record your story first. We can transcribe it into the listing so typing is never a blocker." />
                <FeatureCard icon={Camera} title="Media-first publishing" body="Capture photos, video, and supporting audio from the same workflow with large touch targets." />
                <FeatureCard icon={WifiOff} title="Offline-capable drafts" body="Start listing work offline and publish once the connection comes back." />
              </div>
            </>
          )}
        </div>
      )}
      {activeTab === 'listings' && (
        <Panel title={`My Listings (${filteredListings.length})`} eyebrow="Cross-pillar inventory" icon={Package} action={<button onClick={() => setActiveTab('create')} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Add new</button>}>
          <div className="flex flex-wrap gap-2">
            {PILLAR_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setListingFilter(filter.id)}
                className={`rounded-full px-3 py-2 text-sm ${listingFilter === filter.id ? 'bg-[#d4af37] text-black' : 'border border-white/10 bg-black/20 text-gray-300 hover:border-[#d4af37]/30 hover:text-white'}`}
              >
                {filter.label}
              </button>
            ))}
            <select value={listingSort} onChange={(event) => setListingSort(event.target.value as 'date' | 'sales' | 'price')} className="ml-auto rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-gray-300 outline-none focus:border-[#d4af37]/30">
              <option value="date">Date</option>
              <option value="sales">Sales</option>
              <option value="price">Price</option>
            </select>
          </div>
          <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectVisibleListings}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
                >
                  {filteredListings.every((entry) => selectedOfferingIds.includes(entry.id)) ? 'Clear visible' : 'Select visible'}
                </button>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  {selectedOfferingIds.length} selected
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleBulkListingAction('activate')} disabled={isApplyingBulk} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60">Activate</button>
                <button onClick={() => handleBulkListingAction('pause')} disabled={isApplyingBulk} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60">Pause</button>
                <button onClick={() => handleBulkListingAction('archive')} disabled={isApplyingBulk} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#B51D19]/30 hover:text-white disabled:opacity-60">Archive</button>
                {STOREFRONT_STATE_ACTIONS.map((action) => (
                  <button key={action.id} onClick={() => handleBulkListingAction(action.id)} disabled={isApplyingBulk} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60">
                    {action.label}
                  </button>
                ))}
                <button onClick={() => handleBulkListingAction('feature')} disabled={isApplyingBulk} className="rounded-full bg-[#d4af37] px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-60">Pin to storefront</button>
                <button onClick={() => handleBulkListingAction('unfeature')} disabled={isApplyingBulk} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60">Unpin</button>
              </div>
            </div>
            {bulkFeedback && <div className="mt-3 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{bulkFeedback}</div>}
          </div>
          <div className="mt-5 space-y-3">
            {filteredListings.map((offering) => (
              <div key={offering.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOfferingIds.includes(offering.id)}
                      onChange={() => toggleListingSelection(offering.id)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-black/20 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{offering.title}</p>
                      <p className="mt-1 text-xs text-gray-400">{offering.pillarLabel} | {offering.type} | {offering.status ?? 'Active'}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {offering.featured && <span className="rounded-full bg-[#d4af37]/15 px-2.5 py-1 text-[11px] font-medium text-[#f3d780]">Pinned storefront</span>}
                        {offering.availabilityLabel && (
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            offering.availabilityTone === 'success'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : offering.availabilityTone === 'warning'
                                ? 'bg-amber-500/15 text-amber-300'
                                : offering.availabilityTone === 'danger'
                                  ? 'bg-rose-500/15 text-rose-300'
                                  : 'bg-white/10 text-gray-300'
                          }`}>
                            {offering.availabilityLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#d4af37]">{offering.priceLabel}</span>
                    <Link href={getCreatorHubEditHref(offering.id)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white">Edit</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {workspaceMode === 'simple' && (
        <button
          onClick={() => setActiveTab('help')}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black shadow-[0_18px_40px_rgba(212,175,55,0.35)] hover:bg-[#f4d370]"
        >
          <LifeBuoy size={16} />
          Need help now?
        </button>
      )}

      {activeTab === 'ads' && (
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
            <Panel title="Marketing Control Center" eyebrow="Advertising hub" icon={Sparkles}>
              <div className="rounded-[26px] border border-[#d4af37]/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.14),rgba(0,0,0,0.06))] p-5">
                <p className="max-w-2xl text-sm leading-7 text-gray-200">
                  Plan homepage pushes, trending takeovers, community visibility, and pillar-specific campaigns from one place. We keep pricing transparent here so the marketplaces stay clean and the selling side stays in control.
                </p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <SimpleStat label="Platform pillars" value={`${TOTAL_PLATFORM_PILLARS} total`} />
                    <SimpleStat label="Self-serve ad pillars" value={`${TOTAL_SELF_SERVE_PILLARS} pillars | ${TOTAL_PILLAR_MARKETING_PLACEMENTS} slots`} />
                    <SimpleStat label="Platform-wide surfaces" value="7 live lanes" />
                  </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Build a campaign</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <FieldSelect
                      label="Existing campaign"
                      value={selectedCampaignId}
                      onChange={setSelectedCampaignId}
                      options={[
                        { value: '', label: 'Create a new campaign' },
                        ...campaigns.map((campaign) => ({
                          value: campaign.id,
                          label: `${campaign.offerTitle} | ${campaign.placementTitle}`
                        }))
                      ]}
                    />
                    <FieldSelect
                      label="What are you promoting?"
                      value={selectedPromotionOfferId}
                      onChange={setSelectedPromotionOfferId}
                      options={profile.offerings.filter((entry) => entry.pillar !== 'seva').map((entry) => ({
                        value: entry.id,
                        label: `${entry.title} | ${entry.pillarLabel}`
                      }))}
                    />
                    <FieldSelect
                      label="Placement"
                      value={selectedPlacementId}
                      onChange={setSelectedPlacementId}
                      options={marketingPlacements.map((placement) => ({
                        value: placement.id,
                        label: `${placement.title} | ${placement.priceLabel}`
                      }))}
                    />
                    <FieldInput label="Launch week" value={promotionWeek} onChange={setPromotionWeek} />
                    <Field label="Primary goal" value={selectedPlacement?.bestFor ?? ''} />
                    <FieldInput
                      label="Campaign headline"
                      value={campaignCreativeDraft.headline}
                      onChange={(value) => setCampaignCreativeDraft((current) => ({ ...current, headline: value }))}
                    />
                    <FieldInput
                      label="Campaign CTA"
                      value={campaignCreativeDraft.cta}
                      onChange={(value) => setCampaignCreativeDraft((current) => ({ ...current, cta: value }))}
                    />
                  </div>
                  <div className="mt-4">
                    <FieldTextArea
                      label="Campaign subheadline"
                      value={campaignCreativeDraft.subheadline}
                      onChange={(value) => setCampaignCreativeDraft((current) => ({ ...current, subheadline: value }))}
                    />
                  </div>
                  {selectedPromotionOffer && selectedPlacement && (
                    <div className="mt-4 rounded-[22px] border border-[#d4af37]/15 bg-[#d4af37]/10 p-4">
                      <p className="text-sm font-medium text-white">Campaign summary</p>
                      <p className="mt-2 text-sm leading-7 text-gray-300">
                        Promote <span className="text-white">{selectedPromotionOffer.title}</span> through <span className="text-white">{selectedPlacement.title}</span> starting <span className="text-white">{promotionWeek}</span>.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#f3deb1]">
                        <span className={placementStatusPillClass}>{selectedPlacement.priceLabel}</span>
                        <span className={placementStatusPillClass}>{selectedPlacement.inventory}</span>
                        <span className={placementStatusPillClass}>{selectedPromotionOffer.pillarLabel}</span>
                        {selectedCampaign?.paymentStatus && (
                          <span className={placementStatusPillClass}>Payment: {selectedCampaign.paymentStatus}</span>
                        )}
                        {selectedCampaign?.creativeStatus && (
                          <span className={placementStatusPillClass}>Creative: {selectedCampaign.creativeStatus}</span>
                        )}
                      </div>
                      <div className={`${placementSurfaceCardClass} mt-4`}>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Placement preview</p>
                        <p className="mt-3 text-lg font-medium text-white">{campaignCreativeDraft.headline || selectedPromotionOffer.title}</p>
                        <p className="mt-2 text-sm leading-7 text-gray-300">
                          {campaignCreativeDraft.subheadline || selectedPlacement.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={placementStatusPillClass}>Surface: {selectedPlacement.title}</span>
                          <span className={placementStatusPillClass}>CTA: {campaignCreativeDraft.cta || 'View offer'}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={handleReservePlacement}
                          disabled={isReservingCampaign}
                          className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isReservingCampaign ? 'Reserving...' : 'Reserve this placement'}
                        </button>
                        {selectedCampaign && (
                          <>
                            <button
                              onClick={() => handleCampaignAction('update-creative')}
                              disabled={isUpdatingCampaign}
                              className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 hover:border-[#d4af37]/40 hover:text-white disabled:opacity-60"
                            >
                              Save creative
                            </button>
                            <button
                              onClick={() => handleCampaignAction('submit-creative')}
                              disabled={isUpdatingCampaign}
                              className="rounded-full border border-[#d4af37]/30 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10 disabled:opacity-60"
                            >
                              Submit for approval
                            </button>
                          </>
                        )}
                      </div>
                      {campaignFeedback && <p className="mt-3 text-sm text-[#f3deb1]">{campaignFeedback}</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {MARKETING_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className={placementSurfaceCardClass}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-medium text-white">{pkg.title}</p>
                          <p className="mt-2 text-sm leading-6 text-gray-400">{pkg.summary}</p>
                        </div>
                        <span className={placementPricePillClass}>{pkg.priceLabel}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={placementStatusPillClass}>Bundle booking</span>
                        {pkg.includes.map((item) => (
                          <span key={item} className={placementStatusPillClass}>{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                    <div className={placementHighlightedSurfaceCardClass}>
                      <p className="text-sm font-medium text-white">Seva is the 10th pillar, but its placements stay platform-governed</p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        The 63-slot count covers the 9 self-serve creator pillars. Seva uses reviewed, platform-run placement surfaces instead of direct creator ad buying.
                      </p>
                    </div>
                </div>
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
            <Panel title="Surface Filters" eyebrow="Find the right placement" icon={Globe}>
              <div className="flex flex-wrap gap-2">
                {MARKETING_SCOPES.map((scope) => (
                  <button
                    key={scope.id}
                    onClick={() => setMarketingScope(scope.id)}
                    className={`rounded-full px-3 py-2 text-sm ${
                      marketingScope === scope.id
                        ? 'bg-[#d4af37] text-black'
                        : 'border border-white/10 bg-black/20 text-gray-300 hover:border-[#d4af37]/30 hover:text-white'
                    }`}
                  >
                    {scope.label}
                  </button>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                <StatusRow title="Homepage" detail="Best for broad reach, creator-brand growth, and major launches." actionLabel="High reach" />
                <StatusRow title="Trending" detail="Best when you have urgency, momentum, or a limited campaign window." actionLabel="Fast traffic" />
                <StatusRow title="Community" detail="Best for live sessions, gatherings, announcements, and trust-building." actionLabel="High engagement" />
              </div>
            </Panel>

            <Panel title="Placement Inventory" eyebrow="All priced in one place" icon={Palette}>
              <div className="space-y-5">
                {marketingPlacementGroups.map((group) => (
                  <div key={group.scope} className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                        {MARKETING_SCOPES.find((entry) => entry.id === group.scope)?.label ?? group.scope}
                      </p>
                      <p className="text-xs text-gray-500">{group.items.length} placements</p>
                    </div>
                    <div className="grid gap-3">
                      {group.items.map((placement) => (
                        <div key={placement.id} className={placementSurfaceCardClass}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-white">{placement.title}</p>
                              <p className="mt-1 text-sm leading-6 text-gray-400">{placement.summary}</p>
                            </div>
                            <span className={placementPricePillClass}>{placement.priceLabel}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={placementStatusPillClass}>{placement.inventory}</span>
                            <span className={placementStatusPillClass}>{placement.bestFor}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Panel title="Live Now" eyebrow="Active flights" icon={Sparkles}>
              <div className="space-y-3">
                {marketingCampaignGroups.live.length === 0 && <p className="text-sm text-gray-400">No live placements yet. Reserve a campaign to start serving here.</p>}
                {marketingCampaignGroups.live.map((campaign) => (
                  <div key={campaign.id} className={placementHighlightedSurfaceCardClass}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{campaign.offerTitle}</p>
                      <PlacementPill>Live</PlacementPill>
                    </div>
                    <p className="mt-2 text-xs text-gray-300">{campaign.placementTitle}</p>
                    <p className="mt-2 text-xs text-[#f3deb1]">{campaign.flight}</p>
                    <p className="mt-2 text-sm text-gray-300">{campaign.result}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCampaignAction('pause', campaign.id)}
                        disabled={isUpdatingCampaign}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60"
                      >
                        Pause
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Queued" eyebrow="Scheduled launches" icon={Calendar}>
              <div className="space-y-3">
                {marketingCampaignGroups.scheduled.length === 0 && <p className="text-sm text-gray-400">No queued flights yet. Scheduled reservations will appear here.</p>}
                {marketingCampaignGroups.scheduled.map((campaign) => (
                  <div key={campaign.id} className={placementSurfaceCardClass}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{campaign.offerTitle}</p>
                      <span className={placementStatusPillClass}>Scheduled</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">{campaign.placementTitle}</p>
                    <p className="mt-2 text-xs text-[#d4af37]">{campaign.flight}</p>
                    <p className="mt-2 text-sm text-gray-300">{campaign.result}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(campaign.paymentStatus === 'requires-payment' || campaign.paymentStatus === 'processing') && (
                        <>
                          <button
                            onClick={() => handleCampaignAction('start-checkout', campaign.id)}
                            disabled={isUpdatingCampaign}
                            className="rounded-full bg-[#d4af37] px-3 py-1 text-xs font-semibold text-black disabled:opacity-60"
                          >
                            Start checkout
                          </button>
                          <button
                            onClick={() => handleCampaignAction('complete-checkout', campaign.id)}
                            disabled={isUpdatingCampaign}
                            className="rounded-full border border-[#d4af37]/35 px-3 py-1 text-xs text-[#d4af37] disabled:opacity-60"
                          >
                            Complete payment
                          </button>
                        </>
                      )}
                      {campaign.status === 'paused' ? (
                        <button
                          onClick={() => handleCampaignAction('resume', campaign.id)}
                          disabled={isUpdatingCampaign}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60"
                        >
                          Resume
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCampaignAction('pause', campaign.id)}
                          disabled={isUpdatingCampaign}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60"
                        >
                          Pause
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Completed" eyebrow="Recent performance" icon={TrendingUp}>
              <div className="space-y-3">
                {marketingCampaignGroups.completed.length === 0 && <p className="text-sm text-gray-400">Completed flights will appear here once your campaigns finish serving.</p>}
                {marketingCampaignGroups.completed.map((campaign) => (
                  <div key={campaign.id} className={placementSurfaceCardClass}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{campaign.offerTitle}</p>
                      <span className="rounded-full border border-emerald-500/30 px-2.5 py-1 text-[11px] text-emerald-300">Completed</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">{campaign.placementTitle}</p>
                    <p className="mt-2 text-xs text-gray-500">{campaign.flight}</p>
                    <p className="mt-2 text-sm text-gray-300">{campaign.result}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <Panel title="Billing & Review" eyebrow="Pending actions" icon={Wallet}>
              <div className="space-y-3">
                {campaigns
                  .filter((campaign) => ['pending-payment', 'pending-approval', 'changes-requested', 'paused'].includes(campaign.status))
                  .map((campaign) => (
                    <div key={campaign.id} className={placementSurfaceCardClass}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-white">{campaign.offerTitle}</p>
                        <span className={placementStatusPillClass}>{campaign.status}</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">{campaign.placementTitle}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-300">
                        {campaign.paymentStatus && <span className={placementStatusPillClass}>Payment: {campaign.paymentStatus}</span>}
                        {campaign.creativeStatus && <span className={placementStatusPillClass}>Creative: {campaign.creativeStatus}</span>}
                      </div>
                      {campaign.reviewNotes && <p className="mt-3 text-sm text-[#f3deb1]">{campaign.reviewNotes}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(campaign.paymentStatus === 'requires-payment' || campaign.paymentStatus === 'processing') && (
                          <>
                            <button onClick={() => handleCampaignAction('start-checkout', campaign.id)} disabled={isUpdatingCampaign} className="rounded-full bg-[#d4af37] px-3 py-1 text-xs font-semibold text-black disabled:opacity-60">
                              Start checkout
                            </button>
                            <button onClick={() => handleCampaignAction('complete-checkout', campaign.id)} disabled={isUpdatingCampaign} className="rounded-full border border-[#d4af37]/35 px-3 py-1 text-xs text-[#d4af37] disabled:opacity-60">
                              Complete payment
                            </button>
                          </>
                        )}
                        {(campaign.status === 'changes-requested' || campaign.creativeStatus === 'draft') && (
                          <button onClick={() => { setSelectedCampaignId(campaign.id); setActiveTab('ads'); }} className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200 hover:border-[#d4af37]/30 hover:text-white">
                            Edit creative
                          </button>
                        )}
                        {campaign.status === 'paused' && (
                          <button onClick={() => handleCampaignAction('resume', campaign.id)} disabled={isUpdatingCampaign} className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60">
                            Resume
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                {campaigns.filter((campaign) => ['pending-payment', 'pending-approval', 'changes-requested', 'paused'].includes(campaign.status)).length === 0 && (
                  <p className="text-sm text-gray-400">No pending billing or approval actions right now.</p>
                )}
              </div>
            </Panel>

            <Panel title="Checkout Readiness" eyebrow="Billing lane" icon={Send}>
              <div className="space-y-3">
                <StatusRow title="Payment status" detail={selectedCampaign?.paymentStatus ? `Current: ${selectedCampaign.paymentStatus}` : 'Reserve a placement to create checkout.'} actionLabel={selectedCampaign?.checkoutReference || 'No checkout yet'} />
                <StatusRow title="Creative review" detail={selectedCampaign?.creativeStatus ? `Current: ${selectedCampaign.creativeStatus}` : 'Creative starts in draft mode.'} actionLabel={selectedCampaign?.status || 'Draft'} />
                <StatusRow title="Approval notes" detail={selectedCampaign?.reviewNotes || 'No review notes yet.'} actionLabel={selectedCampaign ? 'Admin ready' : 'Waiting'} />
              </div>
            </Panel>
          </section>

        </div>
      )}

      {activeTab === 'partnerships' && (
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
            <Panel title="Partnership Intake" eyebrow="Sponsorships and enterprise deals" icon={Briefcase}>
              <div className="rounded-[26px] border border-[#d4af37]/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.14),rgba(0,0,0,0.06))] p-5">
                <p className="max-w-2xl text-sm leading-7 text-gray-200">
                  Use partnerships for sponsorships, licensing, institutional archive deals, and consulting. This lane is reviewed and negotiated. It is not the self-serve ads system.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <SimpleStat label="Open inquiries" value={`${enterpriseInquiries.filter((entry) => entry.status !== 'closed').length}`} />
                  <SimpleStat label="Weighted forecast" value={`$${Math.round(enterpriseForecast).toLocaleString()}`} />
                  <SimpleStat label="Negotiation + won" value={`$${Math.round(enterpriseRollups.negotiationValue + enterpriseRollups.wonValue).toLocaleString()}`} />
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Sponsorship intake</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Submit reviewed partnership requests for pillar sponsorships, newsletter placements, homepage banners, and event co-branding.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <FieldInput
                    label="Contact name"
                    value={sponsorshipInquiry.name}
                    onChange={(value) => setSponsorshipInquiry((current) => ({ ...current, name: value }))}
                  />
                  <FieldInput
                    label="Work email"
                    value={sponsorshipInquiry.email}
                    onChange={(value) => setSponsorshipInquiry((current) => ({ ...current, email: value }))}
                  />
                  <FieldInput
                    label="Organization"
                    value={sponsorshipInquiry.organization}
                    onChange={(value) => setSponsorshipInquiry((current) => ({ ...current, organization: value }))}
                  />
                  <FieldInput
                    label="Requested surface"
                    value={sponsorshipInquiry.scope}
                    onChange={(value) => setSponsorshipInquiry((current) => ({ ...current, scope: value }))}
                  />
                  <FieldInput
                    label="Budget"
                    value={sponsorshipInquiry.budget}
                    onChange={(value) => setSponsorshipInquiry((current) => ({ ...current, budget: value }))}
                  />
                </div>
                <div className="mt-4">
                  <FieldTextArea
                    label="Partnership brief"
                    value={sponsorshipInquiry.detail}
                    onChange={(value) => setSponsorshipInquiry((current) => ({ ...current, detail: value }))}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleSponsorshipInquiry}
                    disabled={isSubmittingSponsorship || !sponsorshipInquiry.name || !sponsorshipInquiry.email || !sponsorshipInquiry.detail}
                    className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60"
                  >
                    {isSubmittingSponsorship ? 'Submitting...' : 'Submit sponsorship inquiry'}
                  </button>
                </div>
                {sponsorshipFeedback ? <p className="mt-3 text-sm text-[#f3deb1]">{sponsorshipFeedback}</p> : null}
              </div>
            </Panel>

            <Panel title="Partnership Channels" eyebrow="Deal types" icon={Globe}>
              <div className="space-y-3">
                <StatusRow title="Licensing" detail="Digital art usage rights, campaigns, installations, and media." actionLabel={`${enterpriseInquiries.filter((entry) => entry.channel === 'licensing').length} inquiries`} />
                <StatusRow title="Institutional access" detail="Archive seats, governance controls, and research partnerships." actionLabel={`${enterpriseInquiries.filter((entry) => entry.channel === 'institutional-access').length} inquiries`} />
                <StatusRow title="Sponsorships" detail="Pillar sponsors, newsletter placements, events, and homepage brand packages." actionLabel={`${enterpriseInquiries.filter((entry) => entry.channel === 'sponsorship').length} inquiries`} />
                <StatusRow title="Consulting" detail="Cultural consulting and enterprise advisory work." actionLabel={`${enterpriseInquiries.filter((entry) => entry.channel === 'consulting').length} inquiries`} />
              </div>
            </Panel>
          </section>

          <section className="grid gap-6">
            <Panel title="Enterprise Pipeline" eyebrow="B2B review queue" icon={Briefcase}>
              {enterpriseFeedback ? <div className="mb-4 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{enterpriseFeedback}</div> : null}
              <div className="space-y-4">
                {enterpriseInquiries.length === 0 ? (
                  <p className="text-sm text-gray-400">No enterprise inquiries yet. Licensing, institutional access, consulting, and sponsorship requests will appear here.</p>
                ) : (
                  enterpriseInquiries.map((inquiry) => {
                    const draft = enterpriseDrafts[inquiry.id] ?? {
                      estimatedValue: inquiry.estimatedValue ? String(inquiry.estimatedValue) : '',
                      pipelineOwner: inquiry.pipelineOwner || '',
                      pipelineOwnerRole: inquiry.pipelineOwnerRole || '',
                      nextStep: inquiry.nextStep || '',
                      expectedCloseDate: inquiry.expectedCloseDate ? inquiry.expectedCloseDate.slice(0, 10) : '',
                      contractLifecycleState: inquiry.contractLifecycleState || 'draft',
                      contractStoragePath: inquiry.contractStoragePath || '',
                      contractAttachmentUrl: inquiry.contractAttachmentUrl || '',
                      contractAttachmentName: inquiry.contractAttachmentName || '',
                      contractStage: inquiry.contractStage,
                      status: inquiry.status
                    };
                    return (
                      <div key={inquiry.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-medium text-white">{inquiry.organization || inquiry.name}</p>
                              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-gray-300">{inquiry.channel}</span>
                              <span className="rounded-full border border-[#d4af37]/25 px-2.5 py-1 text-[11px] text-[#f3deb1]">{draft.contractStage}</span>
                              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-gray-300">{draft.status}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-300">{inquiry.name} | {inquiry.email}</p>
                            <p className="mt-1 text-sm text-gray-400">{inquiry.scope || 'No scope provided'}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-300">{inquiry.detail}</p>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <p>{new Date(inquiry.createdAt).toLocaleDateString('en-AU')}</p>
                            <p className="mt-1">{inquiry.budget || 'Budget pending'}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                          <FieldSelect
                            label="Stage"
                            value={draft.contractStage}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, contractStage: value as EnterpriseInquiryRecord['contractStage'] } }))}
                            options={[
                              { value: 'lead', label: 'Lead' },
                              { value: 'discovery', label: 'Discovery' },
                              { value: 'proposal', label: 'Proposal' },
                              { value: 'negotiation', label: 'Negotiation' },
                              { value: 'won', label: 'Won' },
                              { value: 'lost', label: 'Lost' }
                            ]}
                          />
                          <FieldSelect
                            label="Status"
                            value={draft.status}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, status: value as EnterpriseInquiryRecord['status'] } }))}
                            options={[
                              { value: 'new', label: 'New' },
                              { value: 'reviewing', label: 'Reviewing' },
                              { value: 'qualified', label: 'Qualified' },
                              { value: 'closed', label: 'Closed' }
                            ]}
                          />
                          <FieldSelect
                            label="Contract lifecycle"
                            value={draft.contractLifecycleState}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, contractLifecycleState: value as EnterpriseInquiryRecord['contractLifecycleState'] } }))}
                            options={[
                              { value: 'draft', label: 'Draft' },
                              { value: 'sent', label: 'Sent' },
                              { value: 'signed', label: 'Signed' },
                              { value: 'active', label: 'Active' },
                              { value: 'completed', label: 'Completed' },
                              { value: 'terminated', label: 'Terminated' }
                            ]}
                          />
                          <FieldInput
                            label="Est. value"
                            value={draft.estimatedValue}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, estimatedValue: value } }))}
                          />
                          <FieldInput
                            label="Owner"
                            value={draft.pipelineOwner}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, pipelineOwner: value } }))}
                          />
                          <FieldSelect
                            label="Owner role"
                            value={draft.pipelineOwnerRole}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, pipelineOwnerRole: value as EnterpriseInquiryRecord['pipelineOwnerRole'] } }))}
                            options={[{ value: '', label: 'Unassigned' }, ...ENTERPRISE_OWNER_OPTIONS.map((entry) => ({ value: entry.id, label: entry.label }))]}
                          />
                          <FieldInput
                            label="Next step"
                            value={draft.nextStep}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, nextStep: value } }))}
                          />
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <FieldInput
                            label="Expected close"
                            type="date"
                            value={draft.expectedCloseDate}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, expectedCloseDate: value } }))}
                          />
                          <FieldInput
                            label="Contract URL"
                            value={draft.contractAttachmentUrl}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, contractAttachmentUrl: value } }))}
                          />
                          <FieldInput
                            label="Attachment label"
                            value={draft.contractAttachmentName}
                            onChange={(value) => setEnterpriseDrafts((current) => ({ ...current, [inquiry.id]: { ...draft, contractAttachmentName: value } }))}
                          />
                        </div>
                        <div className="mt-3">
                          <label className="grid gap-2 text-sm text-gray-300">
                            Upload contract
                            <input
                              type="file"
                              onChange={(event) => void handleEnterpriseContractUpload(inquiry.id, event.target.files?.[0] ?? null)}
                              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
                            />
                          </label>
                          {uploadingEnterpriseContractTarget === inquiry.id ? <p className="mt-2 text-xs text-[#f3deb1]">Uploading contract...</p> : null}
                        </div>
                        {(draft.expectedCloseDate || draft.contractAttachmentUrl || draft.contractStoragePath) ? (
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-300">
                            {draft.expectedCloseDate ? <span className="rounded-full border border-white/10 px-2.5 py-1">Close: {draft.expectedCloseDate}</span> : null}
                            {(draft.contractAttachmentUrl || draft.contractStoragePath) ? (
                              <button
                                onClick={() => void openEnterpriseContractForDraft(draft)}
                                className="rounded-full border border-[#d4af37]/25 px-2.5 py-1 text-[#f3deb1]"
                              >
                                {draft.contractAttachmentName || 'Open contract'}
                              </button>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              handleEnterpriseInquiryUpdate(inquiry.id, {
                                contractStage: draft.contractStage,
                                status: draft.status,
                                contractLifecycleState: draft.contractLifecycleState,
                                estimatedValue: Number(draft.estimatedValue || 0),
                                pipelineOwner: draft.pipelineOwner,
                                pipelineOwnerRole: draft.pipelineOwnerRole,
                                nextStep: draft.nextStep,
                                expectedCloseDate: draft.expectedCloseDate || null,
                                contractStoragePath: draft.contractStoragePath,
                                contractAttachmentUrl: draft.contractAttachmentUrl,
                                contractAttachmentName: draft.contractAttachmentName
                              })
                            }
                            disabled={isUpdatingEnterpriseInquiry === inquiry.id}
                            className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60"
                          >
                            {isUpdatingEnterpriseInquiry === inquiry.id ? 'Saving...' : 'Save pipeline update'}
                          </button>
                          <button
                            onClick={() => handleEnterpriseInquiryUpdate(inquiry.id, { status: 'qualified', contractStage: 'proposal' })}
                            disabled={isUpdatingEnterpriseInquiry === inquiry.id}
                            className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60"
                          >
                            Qualify
                          </button>
                          <button
                            onClick={() => handleEnterpriseInquiryUpdate(inquiry.id, { status: 'closed', contractStage: 'won' })}
                            disabled={isUpdatingEnterpriseInquiry === inquiry.id}
                            className="rounded-full border border-emerald-500/30 px-4 py-2 text-sm text-emerald-300 disabled:opacity-60"
                          >
                            Mark won
                          </button>
                          <button
                            onClick={() => handleEnterpriseInquiryUpdate(inquiry.id, { status: 'closed', contractStage: 'lost' })}
                            disabled={isUpdatingEnterpriseInquiry === inquiry.id}
                            className="rounded-full border border-[#B51D19]/30 px-4 py-2 text-sm text-[#f6b8b4] disabled:opacity-60"
                          >
                            Mark lost
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>
          </section>
        </div>
      )}

      {activeTab === 'shipping' && (
        <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
          <Panel title="Shipping Settings" eyebrow="For physical items" icon={Truck}>
            <div className="space-y-4">
              <FieldInput label="Domestic profile" value={shippingDraft.domesticProfile} onChange={(value) => setShippingDraft((current) => ({ ...current, domesticProfile: value }))} />
              <FieldInput label="International profile" value={shippingDraft.internationalProfile} onChange={(value) => setShippingDraft((current) => ({ ...current, internationalProfile: value }))} />
              <FieldInput label="Default package" value={shippingDraft.defaultPackage} onChange={(value) => setShippingDraft((current) => ({ ...current, defaultPackage: value }))} />
              <FieldInput label="Handling time" value={shippingDraft.handlingTime} onChange={(value) => setShippingDraft((current) => ({ ...current, handlingTime: value }))} />
              {shippingFeedback && <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{shippingFeedback}</div>}
              <button onClick={handleSaveShipping} disabled={isSavingShipping} className="w-full rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-70">{isSavingShipping ? 'Saving...' : 'Save shipping settings'}</button>
            </div>
          </Panel>
          <Panel title="Carrier Integrations" eyebrow="Discounted rates" icon={Package}>
            <div className="space-y-3">
              {shippingDraft.integrations.map((integration, index) => (
                <div key={integration.label} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{integration.label}</p>
                      <p className="mt-1 text-xs text-gray-400">{integration.detail}</p>
                    </div>
                    <button onClick={() => setShippingDraft((current) => ({ ...current, integrations: current.integrations.map((entry, entryIndex) => entryIndex === index ? { ...entry, connected: !entry.connected } : entry) }))} className={`rounded-full px-3 py-1 text-xs ${integration.connected ? 'bg-[#d4af37] text-black' : 'border border-white/10 text-gray-300'}`}>
                      {integration.connected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <Panel title="Earnings" eyebrow="Revenue and payouts" icon={Wallet}>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Available" value={profile.dashboardStats.availablePayout} />
              <StatCard label="Pending" value={profile.financeSummary ? `$${Math.round(profile.financeSummary.pendingPayoutAmount).toLocaleString()}` : profile.transactionHistory.find((entry) => entry.status === 'Pending payout')?.amount ?? '$123'} />
              <StatCard label="Lifetime" value={profile.financeSummary ? `$${Math.round(profile.financeSummary.lifetimeGrossAmount).toLocaleString()}` : profile.transactionHistory.filter((entry) => entry.type !== 'refund').reduce((total, entry) => total + parsePriceValue(entry.amount), 0) > 0 ? `$${Math.round(profile.transactionHistory.filter((entry) => entry.type !== 'refund').reduce((total, entry) => total + parsePriceValue(entry.amount), 0)).toLocaleString()}` : '$0'} />
            </div>
            <div className="mt-5 rounded-[22px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(212,175,55,0.12),rgba(0,0,0,0.18))] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Live plan savings</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {creatorPlanId === 'free' ? 'Creator Free' : creatorPlanId === 'creator' ? 'Creator' : 'Studio / Team'}
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    Estimated Firekeeper fees saved across recorded sales with your current plan.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-[#d4af37]">${Math.round(creatorFeeSavings).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    vs. standard platform rates
                  </p>
                </div>
              </div>
              {profile.subscriptionMetrics ? (
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <SimpleStat label="Active plans" value={String(profile.subscriptionMetrics.activeCount)} />
                  <SimpleStat label="MRR" value={`$${Math.round(profile.subscriptionMetrics.monthlyRecurringRevenue).toLocaleString()}`} />
                  <SimpleStat label="ARR" value={`$${Math.round(profile.subscriptionMetrics.annualRecurringRevenue).toLocaleString()}`} />
                  <SimpleStat label="Churn" value={String(profile.subscriptionMetrics.churnCount)} />
                </div>
              ) : null}
            </div>
            {profile.financeSummary ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-4">
                <StatCard label="Platform fees" value={`$${Math.round(profile.financeSummary.platformFeeRevenueAmount).toLocaleString()}`} />
                <StatCard label="Processor fees" value={`$${Math.round(profile.financeSummary.processorFeeAmount).toLocaleString()}`} />
                <StatCard label="Refunds" value={`$${Math.round(profile.financeSummary.refundAmount).toLocaleString()}`} />
                <StatCard label="Disputes" value={`$${Math.round(profile.financeSummary.disputeAmount).toLocaleString()}`} />
              </div>
            ) : null}
            {profile.financeSummary ? (
              <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <SimpleStat label="Pending refunds" value={String(profile.financeSummary.pendingRefundCount)} />
                  <SimpleStat label="Open disputes" value={String(profile.financeSummary.openDisputeCount)} />
                  <SimpleStat label="Net revenue" value={`$${Math.round(profile.financeSummary.lifetimeNetAmount).toLocaleString()}`} />
                </div>
              </div>
            ) : null}
            <div className="mt-5 space-y-3">
              {profile.payoutMethods.map((method) => (
                <div key={method.id} className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{method.label}</p>
                      <p className="mt-1 text-xs text-gray-400">{method.detail}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                      method.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : method.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-[#B51D19]/15 text-[#f6b8b4]'
                    }`}>
                      {method.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {profile.financeCases?.length ? (
              <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">Refunds & disputes</p>
                    <p className="mt-1 text-xs text-gray-400">Tracked finance cases with review status and resolution notes.</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-gray-300">
                    {profile.financeCases.length} active records
                  </span>
                </div>
                <div className="space-y-3">
                  {profile.financeCases.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="rounded-[18px] border border-white/10 bg-[#050505] px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-white">{entry.item}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {entry.caseType} | {entry.pillar} | ${Math.round(entry.amount).toLocaleString()}
                          </p>
                          <p className="mt-2 text-xs text-gray-300">{entry.reason}</p>
                          {entry.resolutionNotes ? (
                            <p className="mt-2 text-xs text-[#f3deb1]">{entry.resolutionNotes}</p>
                          ) : null}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                          entry.status === 'resolved' || entry.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : entry.status === 'rejected' || entry.status === 'withdrawn'
                              ? 'bg-[#B51D19]/15 text-[#f6b8b4]'
                              : 'bg-amber-500/15 text-amber-300'
                        }`}>
                          {entry.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Panel>
          <Panel title="Transaction History" eyebrow="Settlement ledger" icon={CircleDollarSign}>
            <div className="space-y-3">
              {recentTransactions.map((entry) => (
                <StatusRow key={entry.id} title={entry.item} detail={`${entry.date} | ${entry.status} | ${entry.type}`} actionLabel={entry.amount} />
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
          <Panel title="Public Profile" eyebrow="Creator presentation" icon={Store}>
            <div className="grid gap-4 sm:grid-cols-2">
              <MediaUploadField
                label="Avatar image"
                value={profileDraft.avatar}
                hint="Upload a square portrait or paste an image URL."
                uploading={uploadingMediaKind === 'avatar'}
                onUrlChange={(value) => setProfileDraft((current) => ({ ...current, avatar: value }))}
                onFileSelect={(file) => handleUploadProfileMedia('avatar', file)}
              />
              <MediaUploadField
                label="Cover image"
                value={profileDraft.cover}
                hint="Upload a landscape banner or paste an image URL."
                uploading={uploadingMediaKind === 'cover'}
                onUrlChange={(value) => setProfileDraft((current) => ({ ...current, cover: value }))}
                onFileSelect={(file) => handleUploadProfileMedia('cover', file)}
              />
              <FieldInput label="Display name" value={profileDraft.displayName} onChange={(value) => setProfileDraft((current) => ({ ...current, displayName: value }))} />
              <FieldInput label="Username" value={profileDraft.username} onChange={(value) => setProfileDraft((current) => ({ ...current, username: value }))} />
              <FieldInput label="Location" value={profileDraft.location} onChange={(value) => setProfileDraft((current) => ({ ...current, location: value }))} />
              <FieldInput label="Nation / Community" value={profileDraft.nation} onChange={(value) => setProfileDraft((current) => ({ ...current, nation: value }))} />
              <FieldInput label="Website" value={profileDraft.website} onChange={(value) => setProfileDraft((current) => ({ ...current, website: value }))} />
              <FieldInput label="Languages" value={profileDraft.languages} onChange={(value) => setProfileDraft((current) => ({ ...current, languages: value }))} />
            </div>
            <div className="mt-4 space-y-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Short bio</p>
              <textarea value={profileDraft.bioShort} onChange={(event) => setProfileDraft((current) => ({ ...current, bioShort: event.target.value }))} className="min-h-28 w-full rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200 outline-none focus:border-[#d4af37]/35" />
              <p className="pt-2 text-xs uppercase tracking-[0.18em] text-gray-500">Long profile story</p>
              <textarea value={profileDraft.bioLong} onChange={(event) => setProfileDraft((current) => ({ ...current, bioLong: event.target.value }))} className="min-h-40 w-full rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200 outline-none focus:border-[#d4af37]/35" />
               {mediaFeedback && <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{mediaFeedback}</div>}
               {profileFeedback && <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{profileFeedback}</div>}
               <button onClick={handleSaveProfileBasics} disabled={isSavingProfile} className="w-full rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-70">{isSavingProfile ? 'Saving...' : 'Save profile basics'}</button>
             </div>
           </Panel>

          <Panel title="What shows first on your public profile" eyebrow="Profile merchandising" icon={Settings2}>
            <div className="space-y-4">
              <FieldSelect label="Lead tab" value={presentationDraft.leadTab} onChange={(value) => setPresentationDraft((current) => ({ ...current, leadTab: value as ProfilePresentationSettings['leadTab'] }))} options={[{ value: 'shop', label: 'Shop' }, { value: 'about', label: 'About' }, { value: 'bundles', label: 'Bundles' }, { value: 'collections', label: 'Collections' }, { value: 'activity', label: 'Activity' }]} />
              <FieldSelect label="About emphasis" value={presentationDraft.leadSection} onChange={(value) => setPresentationDraft((current) => ({ ...current, leadSection: value as ProfilePresentationSettings['leadSection'] }))} options={[{ value: 'story', label: 'Profile story first' }, { value: 'reviews', label: 'Trust signals first' }]} />
              <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Featured shop items</p>
                <div className="grid gap-3">
                  {profile.offerings.slice(0, 8).map((offering) => {
                    const enabled = (presentationDraft.featuredOfferingIds ?? []).includes(offering.id);
                    return (
                      <button
                        key={offering.id}
                        onClick={() =>
                          setPresentationDraft((current) => {
                            const existing = current.featuredOfferingIds ?? [];
                            const next = enabled
                              ? existing.filter((id) => id !== offering.id)
                              : [...existing, offering.id].slice(0, 3);
                            return { ...current, featuredOfferingIds: next };
                          })
                        }
                        className={`flex items-center justify-between gap-4 rounded-[20px] border p-3 text-left ${
                          enabled ? 'border-[#d4af37]/35 bg-[#d4af37]/10' : 'border-white/10 bg-black/10'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{offering.title}</p>
                          <p className="mt-1 text-xs text-gray-400">{offering.pillarLabel} | {offering.priceLabel}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs ${enabled ? 'bg-[#d4af37] text-black' : 'border border-white/10 text-gray-300'}`}>
                          {enabled ? 'Pinned' : 'Pin'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleCard title="Show featured reviews" enabled={presentationDraft.showFeaturedReviews} onToggle={() => setPresentationDraft((current) => ({ ...current, showFeaturedReviews: !current.showFeaturedReviews }))} />
                <ToggleCard title="Show trust signals" enabled={presentationDraft.showTrustSignals} onToggle={() => setPresentationDraft((current) => ({ ...current, showTrustSignals: !current.showTrustSignals }))} />
              </div>
              {presentationFeedback && <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{presentationFeedback}</div>}
              <button onClick={handleSavePresentation} disabled={isSavingPresentation} className="w-full rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-70">{isSavingPresentation ? 'Saving...' : 'Save changes'}</button>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
          <Panel title="Collections" eyebrow="Cross-pillar curation" icon={Sparkles}>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCollectionBulkAction('publish')}
                    disabled={isApplyingCollectionBulk}
                    className="rounded-full bg-[#d4af37] px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-60"
                  >
                    Make public
                  </button>
                  <button
                    onClick={() => handleCollectionBulkAction('hide')}
                    disabled={isApplyingCollectionBulk}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60"
                  >
                    Hide selected
                  </button>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{selectedCollectionIds.length} selected</p>
              </div>
              {collectionsFeedback && (
                <div className="mt-3 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">
                  {collectionsFeedback}
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {profile.collections.map((collection) => (
                <div key={collection.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCollectionIds.includes(collection.id)}
                        onChange={() => toggleCollectionSelection(collection.id)}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-black/20 text-[#d4af37] focus:ring-[#d4af37]"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{collection.name}</p>
                        <p className="mt-1 text-sm leading-6 text-gray-400">{collection.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${collection.visibility === 'public' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-gray-300'}`}>
                            {collection.visibility === 'public' ? 'Public profile' : 'Private draft'}
                          </span>
                          {collection.pillarBreakdown.map((entry) => (
                            <span key={`${collection.id}-${entry.pillar}`} className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-gray-300">
                              {entry.count} {entry.pillar}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Link href={`/profile/${profile.slug}`} className="rounded-full border border-[#d4af37]/20 px-3 py-1 text-xs text-[#d4af37] hover:border-[#d4af37]/45 hover:text-[#f4d370]">
                      Preview
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Bundle Management" eyebrow="Merchandise deeper paths" icon={Package}>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-300">Create bundles, choose the CTA, and decide which one should lead on the public bundles page.</p>
                <button
                  onClick={() => loadBundleDraft(undefined)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
                >
                  New bundle
                </button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FieldInput label="Bundle name" value={bundleDraft.name} onChange={(value) => setBundleDraft((current) => ({ ...current, name: value }))} />
                <FieldInput label="Cover image URL" value={bundleDraft.cover} onChange={(value) => setBundleDraft((current) => ({ ...current, cover: value }))} />
                <FieldInput label="Bundle value / price label" value={bundleDraft.priceLabel} onChange={(value) => setBundleDraft((current) => ({ ...current, priceLabel: value }))} />
                <FieldInput label="Savings / value note" value={bundleDraft.savingsLabel} onChange={(value) => setBundleDraft((current) => ({ ...current, savingsLabel: value }))} />
                <FieldInput label="CTA label" value={bundleDraft.ctaLabel} onChange={(value) => setBundleDraft((current) => ({ ...current, ctaLabel: value }))} />
                <FieldSelect label="CTA type" value={bundleDraft.ctaType} onChange={(value) => setBundleDraft((current) => ({ ...current, ctaType: value as NonNullable<ProfileBundle['ctaType']> }))} options={BUNDLE_CTA_TYPES.map((entry) => ({ value: entry.value, label: entry.label }))} />
                <FieldSelect label="Lead audience" value={bundleDraft.leadAudience} onChange={(value) => setBundleDraft((current) => ({ ...current, leadAudience: value as NonNullable<ProfileBundle['leadAudience']> }))} options={BUNDLE_AUDIENCES.map((entry) => ({ value: entry.value, label: entry.label }))} />
                <FieldSelect label="Visibility" value={bundleDraft.visibility} onChange={(value) => setBundleDraft((current) => ({ ...current, visibility: value as 'public' | 'private' }))} options={[{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }]} />
              </div>
              <div className="mt-4">
                <FieldTextArea label="Bundle summary" value={bundleDraft.summary} onChange={(value) => setBundleDraft((current) => ({ ...current, summary: value }))} />
              </div>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-[#0d0d0d] p-4">
                <p className="text-sm font-medium text-white">Bundle items</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {profile.offerings.filter((entry) => entry.pillar !== 'seva').map((offering) => {
                    const selected = bundleDraft.itemIds.includes(offering.id);
                    return (
                      <button
                        key={offering.id}
                        onClick={() =>
                          setBundleDraft((current) => ({
                            ...current,
                            itemIds: selected
                              ? current.itemIds.filter((id) => id !== offering.id)
                              : [...current.itemIds, offering.id]
                          }))
                        }
                        className={`rounded-[20px] border p-4 text-left ${selected ? 'border-[#d4af37]/35 bg-[#d4af37]/10' : 'border-white/10 bg-black/20'}`}
                      >
                        <p className="text-sm font-medium text-white">{offering.title}</p>
                        <p className="mt-1 text-xs text-gray-400">{offering.pillarLabel} | {offering.priceLabel}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              {bundleFeedback && <div className="mt-4 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{bundleFeedback}</div>}
              <button onClick={handleSaveBundle} disabled={isSavingBundle} className="mt-4 w-full rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-70">
                {isSavingBundle ? 'Saving bundle...' : 'Save bundle'}
              </button>
            </div>
            <div className="space-y-3">
              {profile.bundles.map((bundle) => (
                <div key={bundle.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{bundle.name}</p>
                      <p className="mt-1 text-xs leading-6 text-gray-400">{bundle.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${presentationDraft.featuredBundleId === bundle.id ? 'bg-[#d4af37]/15 text-[#f3d780]' : 'bg-white/10 text-gray-300'}`}>
                        {presentationDraft.featuredBundleId === bundle.id ? 'Lead bundle' : 'Bundle ready'}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-gray-300">{bundle.leadAudience ?? 'collectors'}</span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-gray-300">{bundle.ctaType ?? 'shop'}</span>
                        {bundle.visibility === 'private' && (
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-gray-300">Private</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => loadBundleDraft(bundle)}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleFeatureBundle(bundle.id)}
                        disabled={isApplyingCollectionBulk}
                        className="rounded-full bg-[#d4af37] px-3 py-1 text-xs font-semibold text-black disabled:opacity-60"
                      >
                        Lead bundles page
                      </button>
                      <Link href={`/profile/${profile.slug}/bundles/${bundle.id}`} className="rounded-full border border-[#d4af37]/20 px-3 py-1 text-xs text-[#d4af37] hover:border-[#d4af37]/45 hover:text-[#f4d370]">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => handleFeatureBundle(undefined)}
                disabled={isApplyingCollectionBulk}
                className="w-full rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60"
              >
                Clear lead bundle
              </button>
            </div>
          </Panel>
        </div>
      )}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {profile.funnelMetrics.map((metric) => (
              <StatCard key={metric.id} label={metric.label} value={metric.value} />
            ))}
          </div>
          {communityAnalytics ? (
            <Panel title="Community storefront analytics" eyebrow="Treasury-aware performance" icon={Store}>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Live offers" value={communityAnalytics.summary.liveOfferCount.toString()} />
                <StatCard label="Projected gross" value={`$${communityAnalytics.summary.projectedGrossValue.toLocaleString()}`} />
                <StatCard label="Realized flow" value={`$${communityAnalytics.summary.realizedGrossValue.toLocaleString()}`} />
                <StatCard label="Treasury share" value={`$${communityAnalytics.summary.realizedTreasuryValue.toLocaleString()}`} />
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="space-y-3">
                  {communityAnalytics.rollups.slice(0, 4).map((route) => (
                    <div key={route.routingKey} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-white">{route.label}</span>
                        <span className="text-sm font-semibold text-[#d4af37]">{route.sellThroughRate}%</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">${route.realizedTreasuryValue.toLocaleString()} treasury share | {route.realizedOrderCount} orders</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {communityAnalytics.pillarPerformance.slice(0, 4).map((pillar) => (
                    <div key={pillar.pillarLabel} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-white">{pillar.pillarLabel}</span>
                        <span className="text-sm font-semibold text-[#d4af37]">{pillar.treasuryCaptureRate}%</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">{pillar.liveOfferCount} offers | ${pillar.realizedGrossValue.toLocaleString()} realized flow</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          ) : null}
          <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <Panel title="Sales by Pillar" eyebrow="Revenue mix" icon={Sparkles}>
            <div className="space-y-3">
              {profile.earningsByPillar.map((entry) => (
                <div key={entry.label} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-white">{entry.label}</span>
                    <span className="text-sm font-semibold text-[#d4af37]">{entry.value}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/5">
                    <div className="h-2 rounded-full" style={{ width: `${entry.value}%`, backgroundColor: entry.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Traffic & Growth" eyebrow="Discovery sources" icon={Globe}>
            <div className="space-y-3">
              {profile.trafficSources.map((source) => (
                <StatusRow key={source.label} title={source.label} detail="How buyers are finding your storefront." actionLabel={source.value} />
              ))}
            </div>
          </Panel>
        </div>
          <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
            <Panel title="Item Performance" eyebrow="Offer-level decisions" icon={Package}>
              <div className="space-y-3">
                {profile.itemInsights.map((item) => (
                  <div key={item.offeringId} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-gray-400">{item.pillar} | {item.views.toLocaleString()} views | {item.conversions} conversions</p>
                      </div>
                      <span className="text-sm font-semibold text-[#d4af37]">{item.revenueLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Campaign Performance" eyebrow="Campaign outcomes" icon={TrendingUp}>
              <div className="space-y-3">
                {profile.campaignInsights.map((campaign) => (
                  <div key={campaign.campaignId} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{campaign.placementLabel}</p>
                        <p className="mt-1 text-xs text-gray-400">{campaign.impressions.toLocaleString()} impressions | {campaign.clicks.toLocaleString()} clicks</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#d4af37]">{campaign.ctrLabel}</p>
                        <p className="mt-1 text-xs text-gray-400">{campaign.spendLabel} | {campaign.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {activeTab === 'inbox' && (
        <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
          <Panel title="Inbox" eyebrow="Buyer and collaborator messages" icon={MessageSquare} action={<button onClick={refreshThreads} className="text-sm text-[#d4af37] hover:text-[#f4d370]">Refresh</button>}>
            <div className="space-y-3">
              {threads.map((thread) => (
                <button key={thread.counterpartActorId} onClick={() => setSelectedThreadId(thread.counterpartActorId)} className={`w-full rounded-[22px] border p-4 text-left ${selectedThreadId === thread.counterpartActorId ? 'border-[#d4af37]/35 bg-[#d4af37]/10' : 'border-white/10 bg-black/20 hover:border-[#d4af37]/25'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{thread.counterpartLabel}</p>
                      <p className="mt-1 text-xs text-gray-400">{thread.latestSubject}</p>
                    </div>
                    {thread.unreadCount > 0 && <span className="rounded-full bg-[#B51D19] px-2 py-0.5 text-[11px] text-white">{thread.unreadCount}</span>}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{thread.latestPreview}</p>
                  <p className="mt-3 text-xs text-gray-500">{thread.latestAt}</p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title={selectedThread ? `Conversation with ${selectedThread.counterpartLabel}` : 'Conversation'} eyebrow="Threaded replies" icon={Send}>
            {selectedThread ? (
              <>
                <div className="space-y-3">
                  {selectedThread.messages.map((message) => (
                    <div key={message.id} className={`rounded-[22px] border p-4 ${message.direction === 'outbound' ? 'border-[#d4af37]/25 bg-[#d4af37]/10' : 'border-white/10 bg-black/20'}`}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-white">{message.fromLabel}</p>
                        <p className="text-xs text-gray-500">{message.createdAt}</p>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#d4af37]">{message.subject}</p>
                      <p className="mt-3 text-sm leading-7 text-gray-300">{message.body}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                  <div className="flex flex-wrap gap-2">
                    {MESSAGE_INTENTS.map((intent) => (
                      <button key={intent.id} onClick={() => setReplyIntent(intent.id)} className={`rounded-full px-3 py-1.5 text-xs ${replyIntent === intent.id ? 'bg-[#d4af37] text-black' : 'border border-white/10 bg-black/20 text-gray-300 hover:border-[#d4af37]/30 hover:text-white'}`}>
                        {intent.label}
                      </button>
                    ))}
                  </div>
                  <textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder="Send a reply, quote, booking clarification, or next step." className="min-h-28 w-full rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35" />
                  {replyFeedback && <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{replyFeedback}</div>}
                  <button onClick={handleReply} disabled={isReplying} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-70">{isReplying ? 'Sending...' : 'Send reply'}</button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No conversation selected yet.</p>
            )}
          </Panel>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Panel title="Notification Settings" eyebrow="Email and in-app" icon={Bell}>
          <div className="grid gap-3">
            {notificationDraft.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.channel}</p>
                </div>
                <button onClick={() => setNotificationDraft((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, enabled: !entry.enabled } : entry))} className={`rounded-full px-3 py-1 text-xs ${item.enabled ? 'bg-[#d4af37] text-black' : 'border border-white/10 text-gray-400'}`}>{item.enabled ? 'On' : 'Off'}</button>
              </div>
            ))}
            {notificationFeedback && <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{notificationFeedback}</div>}
            <button onClick={handleSaveNotifications} disabled={isSavingNotifications} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-70">{isSavingNotifications ? 'Saving...' : 'Save notification settings'}</button>
          </div>
        </Panel>
      )}

      {activeTab === 'verification' && (
        <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
          <Panel title="Verification & Compliance" eyebrow="Trust and permissions" icon={ShieldCheck}>
            <div className="space-y-3">
              <StatusRow title="Current status" detail={profile.verificationLabel} actionLabel="Active" />
              {profile.verificationWorkflow.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-6 text-gray-400">{item.detail}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                      item.status === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : item.status === 'needs-info'
                          ? 'bg-amber-500/15 text-amber-300'
                          : item.status === 'submitted'
                            ? 'bg-[#d4af37]/15 text-[#f3d780]'
                            : 'bg-white/10 text-gray-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => handleVerificationAction(item.id, 'submit')} disabled={isUpdatingVerification} className="rounded-full bg-[#d4af37] px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-60">Submit</button>
                    <button onClick={() => handleVerificationAction(item.id, 'request-info')} disabled={isUpdatingVerification} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60">Needs info</button>
                    <button onClick={() => handleVerificationAction(item.id, 'approve')} disabled={isUpdatingVerification} className="rounded-full border border-emerald-500/25 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-60">Mark approved</button>
                  </div>
                </div>
              ))}
              {verificationFeedback && <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{verificationFeedback}</div>}
            </div>
          </Panel>
          <div className="space-y-6">
            <Panel title="Seller Verification" eyebrow="Indigenous trust gate" icon={ShieldCheck}>
              <p className="text-sm leading-7 text-gray-300">
                Selling rights are now tied to a dedicated verification application. Use it to submit your nation or
                community context, explain your role, and track the permissions unlocked for selling, payouts, and
                verified campaigns.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/verification/apply?profileSlug=${encodeURIComponent(slug)}`}
                  className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]"
                >
                  Apply for seller verification
                </Link>
                <Link
                  href={`/verification/status?profileSlug=${encodeURIComponent(slug)}`}
                  className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
                >
                  View verification status
                </Link>
              </div>
            </Panel>
            <Panel title="Verification Services" eyebrow="Paid products" icon={CircleDollarSign}>
              <div className="space-y-3">
                {VERIFICATION_PRODUCTS.map((product) => {
                  const latestPurchase = verificationPurchases.find((entry) => entry.productId === product.id);
                  return (
                    <div key={product.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-white">{product.name}</p>
                          <p className="mt-1 text-xs leading-6 text-gray-400">{product.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#d4af37]">${product.amount.toFixed(2)}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-gray-500">{product.audience}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-gray-500">
                          {latestPurchase
                            ? `Latest: ${latestPurchase.status} on ${latestPurchase.createdAt.slice(0, 10)}`
                            : 'No purchase record yet.'}
                        </div>
                        <button
                          onClick={() => handleVerificationCheckout(product.id)}
                          disabled={isStartingVerificationCheckout === product.id}
                          className="rounded-full bg-[#d4af37] px-4 py-2 text-xs font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60"
                        >
                          {isStartingVerificationCheckout === product.id ? 'Starting checkout...' : 'Purchase'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <Panel title="Need help with compliance?" eyebrow="Supported setup" icon={LifeBuoy}>
              <p className="text-sm leading-7 text-gray-300">We can guide you through identity, community verification, shipping restrictions, rights settings, and premium-placement readiness.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => handleSupportRequest('Compliance support', 'Need help with verification documents, restricted content, or placement readiness.', 'compliance')} disabled={isCreatingSupportRequest} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60">Talk to support</button>
                <button onClick={() => setActiveTab('help')} className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">Watch tutorials</button>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {activeTab === 'help' && (
        <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
          <Panel title="Digital Champion" eyebrow="Human help built in" icon={LifeBuoy}>
            <p className="text-sm leading-7 text-gray-300">A persistent support lane for creators who want guided setup, live screenshare help, or language-aware onboarding.</p>
            <div className="mt-4 space-y-3">
              <button onClick={() => handleSupportRequest('Digital Champion chat', 'Need live listing, pricing, or publishing help from a Digital Champion.', 'chat')} disabled={isCreatingSupportRequest} className="flex w-full items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 p-4 text-left disabled:opacity-60">
                <div><p className="text-sm font-medium text-white">Live chat</p><p className="mt-1 text-xs text-gray-400">Best for listings, pricing, and publishing help.</p></div>
                <span className="text-xs text-[#d4af37]">Open</span>
              </button>
              <button onClick={() => handleSupportRequest('Digital Champion callback', 'Requesting a callback for a guided setup session.', 'callback')} disabled={isCreatingSupportRequest} className="flex w-full items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 p-4 text-left disabled:opacity-60">
                <div><p className="text-sm font-medium text-white">Phone / callback</p><p className="mt-1 text-xs text-gray-400">Best for elders and low-connectivity creators.</p></div>
                <span className="text-xs text-[#d4af37]">Request</span>
              </button>
              <button onClick={() => handleSupportRequest('Voice tutorial request', 'Need a guided tutorial recommendation for the current workflow.', 'tutorial')} disabled={isCreatingSupportRequest} className="flex w-full items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 p-4 text-left disabled:opacity-60">
                <div><p className="text-sm font-medium text-white">Voice tutorials</p><p className="mt-1 text-xs text-gray-400">Short walkthroughs for each pillar workflow.</p></div>
                <span className="text-xs text-[#d4af37]">Queue</span>
              </button>
            </div>
          </Panel>
          <Panel title="Studio help kit" eyebrow="Self-serve support" icon={Upload}>
            <div className="space-y-3">
              {profile.helpResources.map((resource) => (
                <Link key={resource.id} href={resource.href} className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 p-4 hover:border-[#d4af37]/30">
                  <div>
                    <p className="text-sm font-medium text-white">{resource.title}</p>
                    <p className="mt-1 text-xs text-gray-400">{resource.detail}</p>
                  </div>
                  <span className="text-xs text-[#d4af37]">{resource.actionLabel}</span>
                </Link>
              ))}
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-white">Support requests</p>
                <div className="mt-3 space-y-3">
                  {profile.supportRequests.map((request) => (
                    <StatusRow key={request.id} title={request.title} detail={`${request.createdAt} | ${request.channel}`} actionLabel={request.status} />
                  ))}
                </div>
              </div>
              {supportFeedback && <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{supportFeedback}</div>}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function Panel({ title, eyebrow, icon: Icon, children, action }: { title: string; eyebrow: string; icon: typeof Sparkles; children: ReactNode; action?: ReactNode; }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,16,16,0.96),rgba(9,9,9,0.94))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)] md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 p-2 text-[#d4af37]"><Icon size={16} /></div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function parsePriceValue(label: string) {
  const cleaned = label.replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[24px] border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.18em] text-gray-500">{label}</p><p className="mt-3 text-2xl font-semibold text-white">{value}</p></div>;
}

function SimpleStat({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-black/15 px-4 py-3"><span className="text-sm text-gray-300">{label}</span><span className="text-sm font-semibold text-white">{value}</span></div>;
}

function FeatureCard({ icon: Icon, title, body }: { icon: typeof Sparkles; title: string; body: string }) {
  return <div className="rounded-[26px] border border-white/10 bg-[#101010] p-5"><div className="inline-flex rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 p-2 text-[#d4af37]"><Icon size={18} /></div><p className="mt-4 text-lg font-medium text-white">{title}</p><p className="mt-2 text-sm leading-7 text-gray-400">{body}</p></div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <label className="grid gap-2 text-sm text-gray-300">{label}<input value={value} readOnly className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" /></label>;
}

function FieldInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="grid gap-2 text-sm text-gray-300">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" /></label>;
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; }) {
  return <label className="grid gap-2 text-sm text-gray-300">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function FieldTextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm text-gray-300">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" /></label>;
}

function MediaUploadField({
  label,
  value,
  hint,
  uploading,
  onUrlChange,
  onFileSelect
}: {
  label: string;
  value: string;
  hint: string;
  uploading: boolean;
  onUrlChange: (value: string) => void;
  onFileSelect: (file: File) => void;
}) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-gray-300">{label}</p>
      <div
        className="h-28 rounded-[18px] border border-white/10 bg-[#171717] bg-cover bg-center"
        style={value ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.12), rgba(0,0,0,0.12)), url(${value})` } : undefined}
      />
      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 hover:border-[#d4af37]/30 hover:text-white">
        <Upload size={14} />
        {uploading ? 'Uploading...' : 'Upload image'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileSelect(file);
            event.currentTarget.value = '';
          }}
        />
      </label>
      <FieldInput label="Or paste image URL" value={value} onChange={onUrlChange} />
      <p className="text-xs leading-6 text-gray-500">{hint}</p>
    </div>
  );
}

function StatusRow({ title, detail, actionLabel }: { title: string; detail: string; actionLabel: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 p-4"><div><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 text-sm leading-6 text-gray-400">{detail}</p></div><span className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300">{actionLabel}</span></div>;
}

function ToggleCard({ title, enabled, onToggle }: { title: string; enabled: boolean; onToggle: () => void }) {
  return <button onClick={onToggle} className={`rounded-[24px] border p-4 text-left ${enabled ? 'border-[#d4af37]/30 bg-[#d4af37]/10' : 'border-white/10 bg-black/20'}`}><p className="text-sm font-medium text-white">{title}</p><p className="mt-2 text-xs text-gray-400">{enabled ? 'Visible on the public profile.' : 'Hidden from the public profile.'}</p></button>;
}

function resolveLauncherPillar(title: (typeof CREATE_LAUNCHERS)[number]['title']) {
  switch (title) {
    case 'Digital Art':
      return 'digital-arts';
    case 'Physical Item':
      return 'physical-items';
    case 'Course':
      return 'courses';
    case 'Freelance Service':
      return 'freelancing';
    case 'Tourism Experience':
      return 'cultural-tourism';
    case 'Language Resource':
      return 'language-heritage';
    case 'Land & Food':
      return 'land-food';
    case 'Advocacy Service':
      return 'advocacy-legal';
    case 'Materials & Tools':
      return 'materials-tools';
    default:
      return 'seva';
  }
}


