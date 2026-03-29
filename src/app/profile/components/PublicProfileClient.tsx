'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  ExternalLink,
  Layers3,
  MapPin,
  MessageSquare,
  X,
  Package,
  Plane,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Sprout,
  TrendingUp,
  UserPlus,
  Wrench
} from 'lucide-react';
import type { CreatorProfileRecord, ProfileBundle, ProfileCollection, ProfileOffering, ProfilePillarId } from '@/app/profile/data/profileShowcase';
import { fetchPublicProfile, sendProfileMessage, toggleProfileFollow, trackProfileAnalyticsEvent } from '@/app/lib/profileApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import {
  getOfferingCtaLabel,
  getOfferingImage,
  getOfferingLaunchBadge,
  getOfferingLaunchState,
  getOfferingLeadLabel,
  getOfferingMerchandisingScore,
  shouldShowOfferingInStorefront
} from '@/app/profile/lib/offeringMerchandising';
import { StorefrontHeroFrame, StorefrontTabBar } from '@/app/components/storefront/StorefrontSurface';
import StorefrontOfferCard from '@/app/components/storefront/StorefrontOfferCard';

type PublicTab =
  | 'shop'
  | 'about'
  | 'bundles'
  | 'collections'
  | 'activity'
  | ProfilePillarId;

const PILLAR_META: Record<
  Exclude<ProfilePillarId, 'seva'>,
  { label: string; icon: string; href: string; iconNode: ReactNode }
> = {
  'digital-arts': { label: 'Digital Art', icon: '🖼️', href: '/digital-arts', iconNode: <Sparkles size={15} /> },
  'physical-items': { label: 'Physical', icon: '🪑', href: '/?pillar=physical-items', iconNode: <Package size={15} /> },
  courses: { label: 'Courses', icon: '🎓', href: '/courses', iconNode: <BookOpen size={15} /> },
  freelancing: { label: 'Freelancing', icon: '🤝', href: '/freelancing', iconNode: <Briefcase size={15} /> },
  'cultural-tourism': { label: 'Tourism', icon: '✈️', href: '/cultural-tourism', iconNode: <Plane size={15} /> },
  'language-heritage': { label: 'Language', icon: '📖', href: '/language-heritage', iconNode: <BookOpen size={15} /> },
  'land-food': { label: 'Land & Food', icon: '🌳', href: '/land-food', iconNode: <Sprout size={15} /> },
  'advocacy-legal': { label: 'Advocacy', icon: '⚖️', href: '/advocacy-legal', iconNode: <Scale size={15} /> },
  'materials-tools': { label: 'Materials', icon: '🛠️', href: '/materials-tools', iconNode: <Wrench size={15} /> }
};

const MESSAGE_INTENTS = [
  { id: 'general', label: 'General' },
  { id: 'commission', label: 'Commission' },
  { id: 'booking', label: 'Booking' },
  { id: 'licensing', label: 'Licensing' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'collaboration', label: 'Collaboration' }
] as const;

const SHOP_FILTERS: Array<{ id: 'all' | ProfilePillarId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'digital-arts', label: 'Digital' },
  { id: 'physical-items', label: 'Physical' },
  { id: 'courses', label: 'Courses' },
  { id: 'freelancing', label: 'Services' },
  { id: 'cultural-tourism', label: 'Tourism' },
  { id: 'materials-tools', label: 'Materials' }
];

const SHOP_STATES = [
  { id: 'all', label: 'All states' },
  { id: 'available', label: 'Available now' },
  { id: 'limited', label: 'Limited / urgent' },
  { id: 'bookable', label: 'Bookable' },
  { id: 'enrolling', label: 'Enrolling' }
] as const;

export default function PublicProfileClient({
  profile: initialProfile,
  slug
}: {
  profile: CreatorProfileRecord;
  slug: string;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<PublicTab>('shop');
  const [shopFilter, setShopFilter] = useState<'all' | ProfilePillarId>('all');
  const [shopState, setShopState] = useState<(typeof SHOP_STATES)[number]['id']>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'popular' | 'price-low' | 'price-high'>('featured');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageIntent, setMessageIntent] = useState<(typeof MESSAGE_INTENTS)[number]['id']>('general');
  const [messageFeedback, setMessageFeedback] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicProfile(slug)
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
        setIsFollowing(Boolean(data.isFollowing));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    trackProfileAnalyticsEvent({
      profileSlug: slug,
      eventName: 'storefront_view',
      pageKind: 'profile'
    });
  }, [slug]);

  const pillarCounts = useMemo(() => {
    return Object.keys(PILLAR_META).map((pillar) => {
      const count = profile.offerings.filter((offering) => offering.pillar === pillar && shouldShowOfferingInStorefront(offering)).length;
      return { pillar: pillar as keyof typeof PILLAR_META, count };
    });
  }, [profile.offerings]);

  const visiblePillarTabs = pillarCounts.filter((entry) => entry.count > 0).map((entry) => entry.pillar as ProfilePillarId);

  const sortedShopItems = useMemo(() => {
    let items = profile.offerings
      .filter((offering) => shouldShowOfferingInStorefront(offering))
      .filter((offering) => shopFilter === 'all' || offering.pillar === shopFilter);
    if (shopState !== 'all') {
      items = items.filter((offering) => matchesShopState(offering, shopState));
    }
    if (sortBy === 'featured') items = [...items].sort((a, b) => getOfferingMerchandisingScore(b) - getOfferingMerchandisingScore(a));
    if (sortBy === 'popular') items = [...items].reverse();
    if (sortBy === 'price-low') items = [...items].sort((a, b) => parsePriceValue(a.priceLabel) - parsePriceValue(b.priceLabel));
    if (sortBy === 'price-high') items = [...items].sort((a, b) => parsePriceValue(b.priceLabel) - parsePriceValue(a.priceLabel));
    if (sortBy === 'newest') items = [...items].sort((a, b) => getOfferingMerchandisingScore(b) - getOfferingMerchandisingScore(a));
    return items;
  }, [profile.offerings, shopFilter, shopState, sortBy]);

  const currentTabOfferings = useMemo(() => {
    if (activeTab === 'shop') return sortedShopItems;
    if (activeTab in PILLAR_META) {
      return profile.offerings
        .filter((offering) => shouldShowOfferingInStorefront(offering))
        .filter((offering) => offering.pillar === activeTab)
        .sort((a, b) => getOfferingMerchandisingScore(b) - getOfferingMerchandisingScore(a));
    }
    return [];
  }, [activeTab, profile.offerings, sortedShopItems]);

  const activePillarMeta = activeTab !== 'shop' && activeTab in PILLAR_META
    ? PILLAR_META[activeTab as keyof typeof PILLAR_META]
    : null;
  const featuredOfferings = useMemo(() => {
    const preferred = profile.presentation.featuredOfferingIds ?? [];
    const visible = profile.offerings.filter((offering) => shouldShowOfferingInStorefront(offering));
    const pinned = visible.filter((offering) => preferred.includes(offering.id));
    if (pinned.length > 0) return pinned;
    return visible
      .filter((offering) => offering.featured)
      .sort((a, b) => getOfferingMerchandisingScore(b) - getOfferingMerchandisingScore(a))
      .slice(0, 3);
  }, [profile.offerings, profile.presentation.featuredOfferingIds]);
  const messagePillar = shopFilter === 'all' ? 'digital-arts' : shopFilter;
  const averageReviewRating = useMemo(() => {
    if (profile.featuredReviews.length === 0) return null;
    const total = profile.featuredReviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / profile.featuredReviews.length).toFixed(1);
  }, [profile.featuredReviews]);
  const orderedBundles = useMemo(() => {
    const featuredBundleId = profile.presentation.featuredBundleId;
    if (!featuredBundleId) return profile.bundles;
    return [...profile.bundles].sort((a, b) => Number(b.id === featuredBundleId) - Number(a.id === featuredBundleId));
  }, [profile.bundles, profile.presentation.featuredBundleId]);
  const shopSignals = useMemo(() => {
    const all = profile.offerings.filter((offering) => shouldShowOfferingInStorefront(offering));
    return [
      { id: 'featured', label: 'Featured', value: featuredOfferings.length },
      { id: 'launch-live', label: 'Launch live', value: all.filter((offering) => getOfferingLaunchState(offering) === 'live').length },
      { id: 'limited', label: 'Limited now', value: all.filter((offering) => matchesShopState(offering, 'limited')).length },
      { id: 'bookable', label: 'Bookable', value: all.filter((offering) => matchesShopState(offering, 'bookable')).length },
      { id: 'enrolling', label: 'Enrolling', value: all.filter((offering) => matchesShopState(offering, 'enrolling')).length }
    ].filter((entry) => entry.value > 0);
  }, [featuredOfferings.length, profile.offerings]);
  const merchandisingPresetGroups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const offering of profile.offerings.filter((entry) => shouldShowOfferingInStorefront(entry))) {
      const key = offering.ctaPreset || 'collect-now';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [
      { id: 'collect-now', label: 'Collector picks' },
      { id: 'book-now', label: 'Book now' },
      { id: 'enroll-now', label: 'Learn now' },
      { id: 'request-quote', label: 'Request pricing' },
      { id: 'message-first', label: 'Start a conversation' }
    ].map((entry) => ({ ...entry, value: counts.get(entry.id) ?? 0 })).filter((entry) => entry.value > 0);
  }, [profile.offerings]);
  const jumpToShop = () => {
    setActiveTab('shop');
    const target = document.getElementById('profile-shop');
    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };
  const renderAboutTab = () => (
      <section className="space-y-5">
      <section className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Profile Story</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">What this creator is building</h2>
          <p className="mt-4 text-base leading-8 text-[#d7d1c6]">{profile.bioLong}</p>
        </article>
        <article className="space-y-5">
          {profile.presentation.showTrustSignals && profile.presentation.leadSection === 'reviews' && (
            <div className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#d4af37]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Trust Signals</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Proof that lowers buyer hesitation</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {profile.trustSignals.map((signal) => (
                  <div key={signal.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{signal.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{signal.value}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Profile Details</p>
            <div className="mt-4 space-y-3 text-sm text-gray-300">
              <div><span className="text-gray-500">Languages:</span> {profile.languages.join(', ')}</div>
              <div><span className="text-gray-500">Nation:</span> {profile.nation}</div>
              <div><span className="text-gray-500">Website:</span> <a href={profile.website} className="text-[#d4af37] hover:underline">{profile.website}</a></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-gray-300 hover:border-[#d4af37]/35 hover:text-white"
                >
                  {social.label}
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
          {profile.presentation.showTrustSignals && profile.presentation.leadSection !== 'reviews' && (
            <div className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#d4af37]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Trust Signals</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Proof that lowers buyer hesitation</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {profile.trustSignals.map((signal) => (
                  <div key={signal.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{signal.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{signal.value}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <InfoListCard title="Awards & Recognition" items={profile.awards} />
        <InfoListCard title="Exhibitions" items={profile.exhibitions} />
        <InfoListCard title="Publications" items={profile.publications} />
      </div>
    </section>
  );

  return (
    <div className="space-y-4">
      <StorefrontHeroFrame
        cover={profile.cover}
        coverAlt={profile.displayName}
        badgeLabel="Cross-pillar storefront"
        manageHref="/creator-hub"
        manageLabel="Creator view"
        identity={
          <div className="flex gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-[20px] border-4 border-[#101010] bg-[#1b1b1b] shadow-[0_18px_45px_rgba(0,0,0,0.35)] md:h-24 md:w-24">
                <img src={profile.avatar} alt={profile.displayName} className="h-full w-full object-cover" />
              </div>
              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-white md:text-3xl">{profile.displayName}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#B51D19]/15 px-2.5 py-1 text-xs font-medium text-[#ff7a75]">
                    <BadgeCheck size={13} />
                    {profile.verificationLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#d3cfc6]">{profile.username}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#d4af37]" />
                    {profile.location}
                  </span>
                  <span>{profile.nation}</span>
                  <span>Member since {profile.memberSince}</span>
                </div>
              </div>
            </div>
        }
        actions={
          <div className="flex flex-wrap gap-3">
              <button
                onClick={jumpToShop}
                className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm text-[#f3d780] hover:border-[#d4af37]/55 hover:bg-[#d4af37]/15"
              >
                <Sparkles size={14} />
                See items
              </button>
              <button
                onClick={() => {
                  trackProfileAnalyticsEvent({
                    profileSlug: profile.slug,
                    eventName: 'message_open',
                    pageKind: 'profile'
                  });
                  setShowMessageModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35 hover:bg-[#d4af37]/10"
              >
                <MessageSquare size={14} />
                Message
              </button>
              <button
                onClick={async () => {
                  try {
                    await requireWalletAction(isFollowing ? 'manage follows' : 'follow this creator');
                    const result = await toggleProfileFollow(profile.slug, !isFollowing);
                    setIsFollowing(result.isFollowing);
                    setProfile((prev) => ({ ...prev, followerCount: result.followerCount }));
                  } catch (error) {
                    setMessageFeedback(error instanceof Error ? error.message : 'Unable to update follow state.');
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]"
              >
                <UserPlus size={14} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
        }
        mainContent={
          <>
            <p className="max-w-3xl text-sm leading-6 text-[#d9d4cb] md:text-base">{profile.bioShort}</p>
            <div className="mt-4 flex flex-wrap gap-5 border-t border-white/10 pt-4 text-sm">
              <Link href={`/profile/${profile.slug}/followers`} className="text-left">
                <span className="font-semibold text-white">{profile.followerCount.toLocaleString()}</span>
                <span className="ml-2 text-gray-400">followers</span>
              </Link>
              <Link href={`/profile/${profile.slug}/following`} className="text-left">
                <span className="font-semibold text-white">{profile.followingCount.toLocaleString()}</span>
                <span className="ml-2 text-gray-400">following</span>
              </Link>
              <button className="text-left">
                <span className="font-semibold text-white">{profile.salesCount.toLocaleString()}</span>
                <span className="ml-2 text-gray-400">sales</span>
              </button>
            </div>
          </>
        }
        sideContent={
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(212,175,55,0.12),rgba(20,20,20,0.9))] p-3.5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Active in</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pillarCounts.map(({ pillar, count }) => (
                <Link
                  key={pillar}
                  href={PILLAR_META[pillar].href}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-all ${
                    count > 0
                      ? 'border-[#d4af37]/30 bg-black/30 text-white hover:border-[#d4af37]/55'
                      : 'border-white/10 bg-black/20 text-gray-500'
                  }`}
                >
                  <span className="inline-flex items-center">{PILLAR_META[pillar].iconNode}</span>
                  <span>{PILLAR_META[pillar].label}</span>
                  <span className={count > 0 ? 'text-[#d4af37]' : 'text-gray-600'}>({count})</span>
                </Link>
              ))}
            </div>
          </div>
        }
        quickStrip={
          <div className="rounded-[22px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.12),rgba(0,0,0,0.22))] p-3.5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Quick Shop</p>
                <p className="mt-1 text-sm text-[#ddd6c8]">Jump straight into the strongest entry points.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(featuredOfferings.length > 0 ? featuredOfferings : profile.offerings.slice(0, 3)).map((offering) => (
                  <button
                    key={`jump-${offering.id}`}
                    onClick={jumpToShop}
                    className="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-xs text-gray-200 hover:border-[#d4af37]/35 hover:text-white"
                  >
                    {offering.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />

      <StorefrontTabBar
        tabs={(['shop', 'about', 'bundles', ...visiblePillarTabs, 'collections', 'activity'] as PublicTab[]).map((tab) => ({
          id: tab,
          label:
            tab === 'shop'
              ? 'Shop'
              : tab === 'about'
                ? 'About'
                : tab === 'bundles'
                  ? 'Bundles'
                  : tab === 'collections'
                    ? 'Collections'
                    : tab === 'activity'
                      ? 'Activity'
                      : tab in PILLAR_META
                        ? PILLAR_META[tab as keyof typeof PILLAR_META].label
                        : 'Shop'
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {profile.presentation.showFeaturedReviews && profile.featuredReviews.length > 0 && (
        <section className="rounded-[24px] border border-white/10 bg-[#101010] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Reviews</p>
              <p className="mt-1 text-sm text-gray-300">
                {averageReviewRating ? `${averageReviewRating} average rating` : 'Trusted feedback'} from {profile.featuredReviews.length} highlighted reviews.
              </p>
            </div>
            <Link
              href={`/profile/${profile.slug}/reviews`}
              className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/25 px-3.5 py-1.5 text-sm text-[#f3d780] hover:border-[#d4af37]/45 hover:text-[#f6df98]"
            >
              View all reviews
              <ExternalLink size={14} />
            </Link>
          </div>
        </section>
      )}

      {(activeTab === 'shop' || activeTab in PILLAR_META) && (
        <section id="profile-shop" className="scroll-mt-28 rounded-[24px] border border-white/10 bg-[#101010] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">
                {activeTab === 'shop' ? 'Unified shop' : `${activePillarMeta?.label ?? 'Creator'} storefront`}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {activeTab === 'shop' ? 'Everything this creator offers' : `Browse ${activePillarMeta?.label ?? 'this pillar'}`}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {activeTab === 'shop' && (
                <>
                  <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/20 p-1">
                    {SHOP_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setShopFilter(filter.id)}
                        className={`rounded-full px-3 py-1.5 text-xs ${
                          shopFilter === filter.id ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/20 p-1">
                    {SHOP_STATES.map((state) => (
                      <button
                        key={state.id}
                        onClick={() => setShopState(state.id)}
                        className={`rounded-full px-3 py-1.5 text-xs ${
                          shopState === state.id ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {state.label}
                      </button>
                    ))}
                  </div>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as 'featured' | 'newest' | 'popular' | 'price-low' | 'price-high')}
                    className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-gray-300 outline-none focus:border-[#d4af37]/40"
                  >
                    <option value="featured">Featured first</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {activeTab === 'shop' && (
            <div className="mt-4 space-y-3">
              {shopSignals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {shopSignals.map((signal) => (
                    <span key={signal.id} className="rounded-full border border-[#d4af37]/18 bg-[#d4af37]/8 px-3 py-1 text-xs text-[#f3d780]">
                      {signal.value} {signal.label}
                    </span>
                  ))}
                </div>
              )}
              {merchandisingPresetGroups.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {merchandisingPresetGroups.map((group) => (
                    <span key={group.id} className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-gray-300">
                      {group.label} ({group.value})
                    </span>
                  ))}
                </div>
              )}
              {featuredOfferings.length > 0 && (
                <div className="grid gap-3 lg:grid-cols-3">
                  {featuredOfferings.map((offering) => (
                    <Link
                      key={`shop-lead-${offering.id}`}
                      href={offering.href}
                      className="rounded-[20px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.09),rgba(0,0,0,0.24))] p-4 hover:border-[#d4af37]/35"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">{getOfferingLeadLabel(offering)}</p>
                          <p className="mt-2 text-base font-semibold text-white">{offering.title}</p>
                          <p className="mt-1 text-sm text-gray-400">{offering.type}</p>
                        </div>
                        <span className="rounded-full border border-[#d4af37]/25 bg-black/20 px-2.5 py-1 text-[11px] text-[#f2d27f]">
                          Featured
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-[#d4af37]">{offering.priceLabel}</span>
                        <span className="text-gray-300">{getOfferingCtaLabel(offering)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {currentTabOfferings.map((offering) => (
              <OfferingCard key={offering.id} offering={offering} profileSlug={profile.slug} />
            ))}
          </div>
          {currentTabOfferings.length === 0 && (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-6 text-center">
              <p className="text-sm text-gray-300">Nothing matches the current filter combination.</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#d4af37]">Try another pillar, state, or sort.</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'about' && renderAboutTab()}

      {activeTab === 'bundles' && (
        <section className="space-y-5">
          <div className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Bundles</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Cross-pillar packages built for discovery and conversion</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
              These bundles group works, services, materials, and learning into higher-intent buying paths. They should feel like the easiest way for a collector or buyer to go deeper with this creator.
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {orderedBundles.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle} offerings={profile.offerings} profileSlug={profile.slug} featured={profile.presentation.featuredBundleId === bundle.id} />
            ))}
          </div>
        </section>
      )}

      {activeTab === 'collections' && (
        <section className="grid gap-4">
          {profile.collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} offerings={profile.offerings} />
          ))}
        </section>
      )}

      {activeTab === 'activity' && (
        <section className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
          <div className="flex items-center gap-3">
            <TrendingUp size={18} className="text-[#d4af37]" />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Activity</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Recent public movement</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {profile.activity.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-gray-300">{item.detail}</p>
                  </div>
                  <span className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#d4af37]">{item.ago}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-[#d4af37]/20 bg-[#101010] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Message Creator</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Start a conversation with {profile.displayName}</h3>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="rounded-full border border-white/10 p-2 text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <input
                value={messageSubject}
                onChange={(event) => setMessageSubject(event.target.value)}
                placeholder="Subject"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40"
              />
              <div className="flex flex-wrap gap-2">
                {MESSAGE_INTENTS.map((intent) => (
                  <button
                    key={intent.id}
                    onClick={() => {
                      setMessageIntent(intent.id);
                      if (!messageSubject.trim()) {
                        setMessageSubject(intent.id === 'general' ? 'General inquiry' : `${intent.label} inquiry`);
                      }
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      messageIntent === intent.id
                        ? 'bg-[#d4af37] text-black'
                        : 'border border-white/10 bg-black/20 text-gray-300 hover:border-[#d4af37]/30 hover:text-white'
                    }`}
                  >
                    {intent.label}
                  </button>
                ))}
              </div>
              <textarea
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Tell them what you're looking for: commission, collaboration, licensing, booking, or supply inquiry."
                className="min-h-32 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40"
              />
              {messageFeedback && (
                <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f2ddb0]">
                  {messageFeedback}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-white/20 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!messageSubject.trim() || !messageBody.trim()) {
                      setMessageFeedback('Add a subject and message body so the creator has enough context.');
                      return;
                    }
                    try {
                      setIsSendingMessage(true);
                      setMessageFeedback('');
                      await requireWalletAction('send a creator message');
                      await sendProfileMessage({
                        profileSlug: profile.slug,
                        subject: messageSubject,
                        body: messageBody,
                        pillar: messagePillar,
                        intent: messageIntent
                      });
                      setMessageFeedback('Message sent. It now appears in the creator inbox.');
                      setMessageSubject('');
                      setMessageBody('');
                      setMessageIntent('general');
                    } catch (error) {
                      setMessageFeedback(error instanceof Error ? error.message : 'Unable to send message right now.');
                    } finally {
                      setIsSendingMessage(false);
                    }
                  }}
                  disabled={isSendingMessage}
                  className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OfferingCard({
  offering,
  profileSlug,
  featured = false
}: {
  offering: ProfileOffering;
  profileSlug: string;
  featured?: boolean;
}) {
  const availabilityToneClasses =
    offering.availabilityTone === 'success'
      ? 'rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-200'
      : offering.availabilityTone === 'warning'
        ? 'rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-100'
        : offering.availabilityTone === 'danger'
          ? 'rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-[11px] text-rose-100'
          : 'rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] text-white';

  const badges = [
    ...(featured
      ? [{ id: 'featured', label: 'Pinned by creator', className: 'rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-2.5 py-1 text-[11px] text-[#f2d27f]' }]
      : []),
    ...(getOfferingLaunchBadge(offering)
      ? [{ id: 'launch', label: getOfferingLaunchBadge(offering) as string, className: 'rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-100' }]
      : []),
    ...(offering.availabilityLabel
      ? [{ id: 'availability', label: offering.availabilityLabel, className: availabilityToneClasses }]
      : [])
  ];

  return (
    <StorefrontOfferCard
      href={offering.href}
      image={getOfferingImage(offering)}
      title={offering.title}
      typeLabel={offering.type}
      pillarLabel={offering.pillarLabel}
      pillarIcon={PILLAR_META[offering.pillar as keyof typeof PILLAR_META]?.iconNode}
      priceLabel={offering.priceLabel}
      ctaLabel={getOfferingCtaLabel(offering)}
      blurb={offering.blurb}
      metadata={offering.metadata ?? []}
      badges={badges}
      onClick={() => {
        trackProfileAnalyticsEvent({
          profileSlug,
          eventName: 'offer_open',
          pageKind: 'profile',
          offeringId: offering.id,
          metadata: { pillar: offering.pillar, href: offering.href }
        });
      }}
    />
  );
}

function CollectionCard({
  collection,
  offerings
}: {
  collection: ProfileCollection;
  offerings: ProfileOffering[];
}) {
  const items = offerings.filter((offering) => collection.itemIds.includes(offering.id));

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101010]">
      <div className="relative h-52">
        <img src={collection.cover} alt={collection.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.75))]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Collection</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">{collection.name}</h3>
          <p className="mt-2 max-w-2xl text-sm text-[#e5dfd4]">{collection.summary}</p>
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr,1.1fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            {collection.pillarBreakdown.map((entry) => (
              <span key={entry.pillar} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-gray-300">
                {PILLAR_META[entry.pillar as keyof typeof PILLAR_META]?.label ?? entry.pillar} ({entry.count})
              </span>
            ))}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 px-3 py-1.5 text-xs text-[#d4af37]">
            <Layers3 size={12} />
            {collection.visibility === 'public' ? 'Public collection' : 'Private collection'}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="rounded-[20px] border border-white/10 bg-black/20 p-3 hover:border-[#d4af37]/30">
              <div className="flex items-start gap-3">
                <img src={getOfferingImage(item)} alt={item.title} className="h-16 w-16 rounded-xl object-cover" />
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.pillarLabel}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{getOfferingCtaLabel(item)}</p>
                  <p className="mt-2 text-sm text-[#d4af37]">{item.priceLabel}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

function BundleCard({
  bundle,
  offerings,
  profileSlug,
  featured = false
}: {
  bundle: ProfileBundle;
  offerings: ProfileOffering[];
  profileSlug: string;
  featured?: boolean;
}) {
  const items = offerings.filter((offering) => bundle.itemIds.includes(offering.id));

  return (
    <article className={`overflow-hidden rounded-[30px] border bg-[linear-gradient(180deg,rgba(212,175,55,0.08),rgba(12,12,12,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.32)] ${featured ? 'border-[#d4af37]/35' : 'border-[#d4af37]/15'}`}>
      <div className="relative h-56">
        <img src={bundle.cover} alt={bundle.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.82))]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-black/35 px-3 py-1 text-xs text-[#f3d780]">
            <Layers3 size={12} />
            Bundle
          </div>
          <h3 className="mt-3 text-3xl font-semibold text-white">{bundle.name}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#ece4d5]">{bundle.summary}</p>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr,1.05fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {bundle.pillarBreakdown.map((entry) => (
              <span key={entry.pillar} className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs text-gray-300">
                {PILLAR_META[entry.pillar as keyof typeof PILLAR_META]?.label ?? entry.pillar} ({entry.count})
              </span>
            ))}
          </div>
          <div className="rounded-[22px] border border-[#d4af37]/20 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Bundle Economics</p>
            <p className="mt-3 text-2xl font-semibold text-white">{bundle.priceLabel}</p>
            <p className="mt-2 text-sm leading-6 text-gray-300">{bundle.savingsLabel}</p>
          </div>
          <Link
            href={`/profile/${profileSlug}/bundles/${bundle.id}`}
            className="inline-flex rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]"
          >
            {bundle.ctaLabel}
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="rounded-[20px] border border-white/10 bg-black/20 p-3 hover:border-[#d4af37]/30">
              <div className="flex items-start gap-3">
                <img src={getOfferingImage(item)} alt={item.title} className="h-16 w-16 rounded-xl object-cover" />
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.pillarLabel}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{getOfferingCtaLabel(item)}</p>
                  <p className="mt-2 text-xs text-[#d4af37]">{item.priceLabel}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

function matchesShopState(
  offering: ProfileOffering,
  state: (typeof SHOP_STATES)[number]['id']
) {
  const availability = (offering.availabilityLabel || '').toLowerCase();
  if (state === 'available') {
    return offering.availabilityTone === 'success' || availability.includes('available') || availability.includes('open');
  }
  if (state === 'limited') {
    return offering.availabilityTone === 'warning' || availability.includes('left') || availability.includes('live') || availability.includes('spots');
  }
  if (state === 'bookable') {
    return offering.pillar === 'cultural-tourism' || offering.pillar === 'freelancing';
  }
  if (state === 'enrolling') {
    return offering.pillar === 'courses' || availability.includes('enrollment');
  }
  return true;
}

function parsePriceValue(priceLabel: string) {
  const match = priceLabel.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function InfoListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">{title}</p>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

