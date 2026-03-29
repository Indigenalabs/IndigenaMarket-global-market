'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import FeaturedBanner from './FeaturedBanner';
import TourismStickyBanner from './TourismStickyBanner';
import {
  MapPin,
  Search,
  Shield,
  Calendar,
  Users,
  Star,
  Clock,
  Heart,
  Ticket
} from 'lucide-react';
import {
  fetchCulturalTourismPlacements,
  fetchTourismReadiness,
  fetchTourismExperiencesCursor,
  fetchTerritoryOverlays,
  trackTourismEvent,
  type CulturalTourismQuery,
  type ExperienceKind,
  type ExperienceListing,
  type TerritoryOverlay,
  type TourismPlacementSummary
} from '@/app/lib/culturalTourismApi';
import TourismPremiumPlacementCard from './cultural-tourism/TourismPremiumPlacementCard';
import TourismAnnouncementBanner from './cultural-tourism/TourismAnnouncementBanner';
import {
  buildPlacementCreativeMap,
  buildPlacementSummaryMap,
  type PlacementSummaryEntry
} from '@/app/lib/pillarPlacementController';
import { getMarketplaceCardMerchandising } from './marketplaceCardMerchandising';

const categoryOptions: Array<{ id: ExperienceKind | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'lodging', label: 'Lodging' },
  { id: 'guided-tours', label: 'Guided Tours' },
  { id: 'workshops', label: 'Workshops' },
  { id: 'performances', label: 'Performances' },
  { id: 'festivals', label: 'Festivals' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'culinary', label: 'Culinary' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'virtual', label: 'Virtual' },
  { id: 'arts-crafts', label: 'Arts & Crafts' },
  { id: 'voluntourism', label: 'Voluntourism' },
  { id: 'transport', label: 'Transport' },
  { id: 'specialty', label: 'Specialty' }
];

const premiumPlacements = [
  {
    id: 'tour-prem-0',
    label: 'Tourism Sticky Banner',
    price: '',
    description: 'Persistent booking and seasonal urgency banner across tourism pages.'
  },
  {
    id: 'tour-prem-1',
    label: 'Featured Destination Banner',
    price: '',
    description: 'Top hero placement for destination campaigns.'
  },
  {
    id: 'tour-prem-2',
    label: 'Operator Spotlight',
    price: '',
    description: 'Featured operator story with direct booking CTA.'
  },
  {
    id: 'tour-prem-3',
    label: 'Sponsored Experience Card',
    price: '',
    description: 'Sponsored card injected in discovery feed.'
  },
  {
    id: 'tour-prem-4',
    label: 'Region Boost',
    price: '',
    description: 'Regional priority ranking in search results.'
  },
  {
    id: 'tour-prem-5',
    label: 'Newsletter Feature',
    price: '',
    description: 'Direct placement in tourism newsletter.'
  },
  {
    id: 'tour-prem-6',
    label: 'Seasonal Campaign Takeover',
    price: '',
    description: 'Seasonal promotion package for events and tours.'
  }
] as const;

const premiumMocks = {
  'tour-prem-0': {
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=500&fit=crop',
    cta: 'Book Sticky Slot'
  },
  'tour-prem-1': {
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=500&fit=crop',
    cta: 'Reserve Hero Slot'
  },
  'tour-prem-2': {
    image: 'https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b?w=1200&h=500&fit=crop',
    cta: 'Feature Operator'
  },
  'tour-prem-3': {
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=500&fit=crop',
    cta: 'Sponsor Card'
  },
  'tour-prem-4': {
    image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200&h=500&fit=crop',
    cta: 'Boost Region'
  },
  'tour-prem-5': {
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=500&fit=crop',
    cta: 'Book Newsletter'
  },
  'tour-prem-6': {
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=500&fit=crop',
    cta: 'Book Seasonal'
  }
} as const;

function tierClass(tier: ExperienceListing['verificationTier']) {
  switch (tier) {
    case 'Platinum':
      return 'bg-slate-200/20 text-slate-200 border-slate-200/40';
    case 'Gold':
      return 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40';
    case 'Silver':
      return 'bg-gray-300/20 text-gray-200 border-gray-300/40';
    case 'Bronze':
    default:
      return 'bg-amber-700/20 text-amber-300 border-amber-700/40';
  }
}

interface CulturalTourismMarketplaceProps {
  viewAllOnly?: boolean;
}

export default function CulturalTourismMarketplace({ viewAllOnly = false }: CulturalTourismMarketplaceProps) {
  const [query, setQuery] = useState<CulturalTourismQuery>({
    kind: 'all',
    sort: 'featured',
    duration: 'any',
    limit: viewAllOnly ? 24 : 12
  });
  const [searchInput, setSearchInput] = useState('');
  const [items, setItems] = useState<ExperienceListing[]>([]);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [showMapPanel, setShowMapPanel] = useState(false);
  const [territories, setTerritories] = useState<TerritoryOverlay[]>([]);
  const [mapLat, setMapLat] = useState('');
  const [mapLng, setMapLng] = useState('');
  const [mapRadiusKm, setMapRadiusKm] = useState(250);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<ExperienceListing | null>(null);
  const [placementSummary, setPlacementSummary] = useState<Record<string, PlacementSummaryEntry>>({});
  const [placementCreative, setPlacementCreative] = useState<Record<string, { image: string; headline: string; subheadline: string; cta: string }>>({});
  const [readinessError, setReadinessError] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      setQuery((prev) => ({ ...prev, q: nextSearch || undefined }));
      void trackTourismEvent({
        event: 'tourism_search',
        kind: query.kind ?? 'all',
        metadata: { q: nextSearch }
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, query.kind]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setInitialLoading(true);
      setError(null);
      try {
        const data = await fetchTourismExperiencesCursor({ ...query, cursor: undefined, limit: query.limit ?? 12 }, controller.signal);
        if (!active) return;
        setItems(data.items);
        setTotalLoaded(data.items.length);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setError((e as Error).message || 'Failed to load experiences');
        setItems([]);
        setTotalLoaded(0);
        setNextCursor(null);
        setHasMore(false);
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    };
    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const loadReadiness = async () => {
      try {
        await fetchTourismReadiness();
        setReadinessError(null);
      } catch (e) {
        setReadinessError((e as Error).message || 'Tourism backend readiness failed');
      }
    };
    void loadReadiness();
  }, []);

  useEffect(() => {
    const loadTerritories = async () => {
      try {
        const rows = await fetchTerritoryOverlays();
        setTerritories(rows || []);
      } catch {
        setTerritories([]);
      }
    };
    void loadTerritories();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await fetchCulturalTourismPlacements();
        setPlacementSummary(buildPlacementSummaryMap(payload.summary as TourismPlacementSummary[]));
        setPlacementCreative(buildPlacementCreativeMap(payload.placements));
      } catch {
        setPlacementSummary({});
        setPlacementCreative({});
      }
    };
    void load();
  }, []);

  const selectedCategoryLabel = useMemo(() => {
    return categoryOptions.find((x) => x.id === (query.kind ?? 'all'))?.label ?? 'All';
  }, [query.kind]);

  const premiumCreative = (
    typeId: string,
    fallback: { image: string; headline: string; subheadline: string; cta: string }
  ) => {
    const found = placementCreative[typeId];
    if (!found) return fallback;
    return {
      image: found.image || fallback.image,
      headline: found.headline || fallback.headline,
      subheadline: found.subheadline || fallback.subheadline,
      cta: found.cta || fallback.cta
    };
  };

  const onSearch = (value: string) => setSearchInput(value);
  const openPremiumPlacementView = (typeId: string, fallback: { headline: string; subheadline: string; image: string }) => {
    const c = premiumCreative(typeId, {
      image: fallback.image,
      headline: fallback.headline,
      subheadline: fallback.subheadline,
      cta: 'View'
    });
    const synthetic: ExperienceListing = {
      id: `premium-${typeId}`,
      title: c.headline || fallback.headline,
      kind: (query.kind && query.kind !== 'all' ? query.kind : 'guided-tours') as ExperienceKind,
      nation: 'Featured Indigenous Operator',
      community: 'Marketplace Partner',
      region: 'Global',
      summary: c.subheadline || fallback.subheadline,
      image: c.image || fallback.image,
      priceFrom: 0,
      currency: 'USD',
      durationLabel: 'Featured',
      groupSize: 'See listing',
      rating: 5,
      reviews: 0,
      verificationTier: 'Gold',
      elderApproved: false,
      sacredContent: false,
      virtual: false,
      availableNextDate: new Date().toISOString().slice(0, 10),
      protocols: [],
      tags: ['premium placement'],
      featured: true,
      createdAt: new Date().toISOString()
    };
    setSelected(synthetic);
    setViewModalOpen(true);
  };
  const closeModals = () => {
    setViewModalOpen(false);
  };

  const onLoadMore = async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await fetchTourismExperiencesCursor({ ...query, cursor: nextCursor, limit: query.limit ?? 12 });
      setItems((prev) => [...prev, ...data.items]);
      setTotalLoaded((prev) => prev + data.items.length);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (e) {
      setError((e as Error).message || 'Failed to load more experiences');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <section className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#141414] via-[#101010] to-[#141414] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{viewAllOnly ? 'View All Cultural Tourism Experiences' : 'Cultural Tourism Marketplace'}</h1>
            <p className="text-gray-400 mt-1">Indigenous-led experiences across lands, stories, hospitality, and learning.</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1.5 rounded-full border border-[#d4af37]/40 text-[#d4af37]">{totalLoaded.toLocaleString()} loaded</span>
            <span className="px-3 py-1.5 rounded-full border border-[#DC143C]/40 text-[#FF6B6B]">13 categories</span>
            <span className="px-3 py-1.5 rounded-full border border-emerald-500/40 text-emerald-300">Verified + Protocol-Aware</span>
          </div>
        </div>
        {readinessError && (
          <p className="mt-3 text-xs text-red-300">Readiness check failed: {readinessError}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {!viewAllOnly && (
            <Link href="/cultural-tourism/experiences" className="px-3 py-1.5 rounded-full border border-[#d4af37]/35 text-[#d4af37] hover:bg-[#d4af37]/10">
              View All Experiences
            </Link>
          )}
          {viewAllOnly && (
            <Link href="/cultural-tourism" className="px-3 py-1.5 rounded-full border border-[#d4af37]/35 text-[#d4af37] hover:bg-[#d4af37]/10">
              Back to Marketplace
            </Link>
          )}
          <Link href="/cultural-tourism/trips" className="px-3 py-1.5 rounded-full border border-[#d4af37]/20 text-gray-200 hover:border-[#d4af37]/40">Seasonal trips</Link>
          <Link href="/cultural-tourism/experiences?kind=lodging" className="px-3 py-1.5 rounded-full border border-[#d4af37]/20 text-gray-200 hover:border-[#d4af37]/40">Bookable stays</Link>
          <Link href="/cultural-tourism/experiences?kind=guided-tours" className="px-3 py-1.5 rounded-full border border-[#d4af37]/20 text-gray-200 hover:border-[#d4af37]/40">Trusted tours</Link>
        </div>
      </section>

      {!viewAllOnly && <TourismStickyBanner />}

      {!viewAllOnly && <TourismAnnouncementBanner />}

      {!viewAllOnly && <FeaturedBanner pillar="cultural-tourism" />}

          <section className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
              <div className="xl:col-span-2 relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-500" />
                <input
                  placeholder="Search experiences, nations, tags"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white"
                  value={searchInput}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
              <select
                value={query.kind}
                onChange={(e) => setQuery((prev) => ({ ...prev, kind: e.target.value as ExperienceKind | 'all' }))}
                className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white"
              >
                {categoryOptions.map((x) => (
                  <option key={x.id} value={x.id}>{x.label}</option>
                ))}
              </select>
              <input
                placeholder="Region"
                className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white"
                onChange={(e) => setQuery((prev) => ({ ...prev, region: e.target.value || undefined }))}
              />
              <input
                type="number"
                min={0}
                placeholder="Min Price"
                className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white"
                onChange={(e) => setQuery((prev) => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
              />
              <select
                value={query.sort}
                onChange={(e) => setQuery((prev) => ({ ...prev, sort: e.target.value as CulturalTourismQuery['sort'] }))}
                className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-sm text-white"
              >
                <option value="featured">Featured</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price Low</option>
                <option value="price-high">Price High</option>
                <option value="newest">Newest</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={Boolean(query.verifiedOnly)} onChange={(e) => setQuery((prev) => ({ ...prev, verifiedOnly: e.target.checked }))} />
                Verified only
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={Boolean(query.virtualOnly)} onChange={(e) => setQuery((prev) => ({ ...prev, virtualOnly: e.target.checked }))} />
                Virtual only
              </label>
              <span className="text-[#d4af37]">Category: {selectedCategoryLabel}</span>
              {!viewAllOnly && (
                <Link href="/cultural-tourism/experiences" className="text-[#d4af37] underline underline-offset-4">
                  View All Experiences
                </Link>
              )}
              <button
                onClick={() => setShowMapPanel((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg border border-[#d4af37]/30 text-[#d4af37]"
              >
                {showMapPanel ? 'Hide Territory Map' : 'Explore by Territory Map'}
              </button>
            </div>
          </section>

          {showMapPanel && (
            <section className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-white font-semibold">Territory Map Discovery</h3>
                <span className="text-xs text-gray-400">{territories.length} territories</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Pick a territory to focus search and find bookable experiences nearby.</p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {territories.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setQuery((prev) => ({ ...prev, region: t.region || undefined }))}
                    className="text-left rounded-lg border border-[#d4af37]/20 bg-[#111111] p-3 hover:border-[#d4af37]/40"
                  >
                    <p className="text-sm text-white font-medium">{t.territoryName}</p>
                    <p className="text-xs text-gray-400 mt-1">{t.nation} • {t.region}</p>
                    <p className="text-xs text-[#d4af37] mt-1">{t.experiences} experiences</p>
                  </button>
                ))}
                {territories.length === 0 && <p className="text-xs text-gray-400">No territory overlays available.</p>}
              </div>
              <div className="mt-3 rounded-lg border border-[#d4af37]/20 bg-[#111111] p-3">
                <p className="text-xs text-gray-400 mb-2">Viewport Search</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input value={mapLat} onChange={(e) => setMapLat(e.target.value)} placeholder="Center Lat" className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-xs text-white" />
                  <input value={mapLng} onChange={(e) => setMapLng(e.target.value)} placeholder="Center Lng" className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-xs text-white" />
                  <input type="number" min={10} value={mapRadiusKm} onChange={(e) => setMapRadiusKm(Math.max(10, Number(e.target.value || 250)))} placeholder="Radius Km" className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-xs text-white" />
                  <button
                    onClick={() => setQuery((prev) => ({
                      ...prev,
                      lat: mapLat ? Number(mapLat) : undefined,
                      lng: mapLng ? Number(mapLng) : undefined,
                      radiusKm: mapLat && mapLng ? mapRadiusKm : undefined
                    }))}
                    className="px-3 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-xs"
                  >
                    Apply Viewport
                  </button>
                </div>
              </div>
            </section>
          )}

          {!viewAllOnly && <section className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#d4af37]">Sponsored Spotlight</p>
                <p className="text-white text-sm font-medium">
                  {premiumCreative('tour_operator_spotlight', {
                    image: premiumMocks['tour-prem-2'].image,
                    headline: premiumPlacements[1].label,
                    subheadline: premiumPlacements[1].description,
                    cta: premiumMocks['tour-prem-2'].cta
                  }).headline}
                </p>
                <p className="text-xs text-gray-400">
                  {premiumCreative('tour_operator_spotlight', {
                    image: premiumMocks['tour-prem-2'].image,
                    headline: premiumPlacements[1].label,
                    subheadline: premiumPlacements[1].description,
                    cta: premiumMocks['tour-prem-2'].cta
                  }).subheadline}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    openPremiumPlacementView('tour_operator_spotlight', {
                      headline: premiumPlacements[1].label,
                      subheadline: premiumPlacements[1].description,
                      image: premiumMocks['tour-prem-2'].image
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-gray-500/40 text-gray-300 text-xs"
                >
                  View
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-[#d4af37]/35 text-[#d4af37] text-xs">
                  {premiumCreative('tour_operator_spotlight', {
                    image: premiumMocks['tour-prem-2'].image,
                    headline: premiumPlacements[1].label,
                    subheadline: premiumPlacements[1].description,
                    cta: premiumMocks['tour-prem-2'].cta
                  }).cta}
                </button>
              </div>
            </div>
          </section>}

          {error && <p className="text-sm text-red-300">{error}</p>}
          {initialLoading && <p className="text-sm text-gray-400">Loading experiences...</p>}

          <section className={`grid grid-cols-1 gap-6 ${viewAllOnly ? '' : 'xl:grid-cols-3'}`}>
            <div className={`${viewAllOnly ? '' : 'xl:col-span-2'} grid grid-cols-1 md:grid-cols-2 gap-4`}>
              {items.reduce<ReactNode[]>((acc, item, idx) => {
                const merch = getMarketplaceCardMerchandising({
                  title: item.title,
                  pillarLabel: 'Cultural Tourism',
                  image: item.image,
                  coverImage: item.image,
                  galleryOrder: [item.image],
                  ctaMode: 'book',
                  ctaPreset: 'book-now',
                  availabilityLabel: item.availableNextDate ? `Next: ${item.availableNextDate}` : 'Bookable now',
                  availabilityTone: 'success',
                  featured: item.verificationTier === 'Platinum' || item.elderApproved,
                  merchandisingRank: item.elderApproved ? 3 : 10,
                  status: 'Active',
                  priceLabel: `From $${item.priceFrom}`,
                  blurb: item.summary,
                });

                acc.push(
                  <article key={item.id} className="rounded-xl border border-[#d4af37]/20 bg-[#141414] overflow-hidden">
                    <img src={merch.image} alt={item.title} className="w-full h-44 object-cover" />
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-semibold leading-tight">{item.title}</h3>
                        <span className={`text-[11px] border px-2 py-1 rounded-full ${tierClass(item.verificationTier)}`}>{item.verificationTier}</span>
                      </div>
                      <p className="text-xs text-gray-400">{item.summary}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
                        <span className="inline-flex items-center gap-1"><MapPin size={12} />{item.region}</span>
                        <span className="inline-flex items-center gap-1"><Clock size={12} />{item.durationLabel}</span>
                        <span className="inline-flex items-center gap-1"><Users size={12} />{item.groupSize}</span>
                        <span className="inline-flex items-center gap-1 text-yellow-300"><Star size={12} />{item.rating.toFixed(1)} ({item.reviews})</span>
                        <span className={`text-[11px] px-2 py-1 rounded-full border ${item.virtual ? 'border-indigo-400/40 text-indigo-300' : 'border-sky-400/40 text-sky-300'}`}>
                          {item.virtual ? 'Online Ticket' : 'In-Person Ticket'}
                        </span>
                        <span className="text-[11px] px-2 py-1 rounded-full border border-emerald-500/35 text-emerald-300">
                          {merch.normalized.availabilityLabel}
                        </span>
                        {merch.launchBadge && (
                          <span className="text-[11px] px-2 py-1 rounded-full border border-emerald-500/35 text-emerald-300">
                            {merch.launchBadge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[#d4af37] font-semibold">From ${item.priceFrom}</p>
                        <div className="flex items-center gap-2">
                          {item.elderApproved && <span className="text-[11px] px-2 py-1 rounded-full border border-emerald-500/40 text-emerald-300">Elder Approved</span>}
                          {item.sacredContent && <span className="text-[11px] px-2 py-1 rounded-full border border-[#DC143C]/40 text-[#FF6B6B]">Protocol Sensitive</span>}
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Link
                          href={`/cultural-tourism/experiences/${item.id}`}
                          className="w-full px-3 py-2 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] hover:bg-[#d4af37]/25 text-sm text-center"
                        >
                          Explore
                        </Link>
                        <Link
                          href={`/cultural-tourism/experiences/${item.id}#booking`}
                          className="w-full px-3 py-2 rounded-lg bg-[#d4af37] text-black hover:opacity-90 text-sm font-medium text-center"
                        >
                          {merch.ctaLabel}
                        </Link>
                      </div>
                    </div>
                  </article>
                );

                if (!viewAllOnly && idx === 1) {
                  acc.push(
                    <TourismPremiumPlacementCard
                      key={premiumPlacements[2].id}
                      title={premiumCreative('tour_sponsored_card', {
                        image: premiumMocks['tour-prem-3'].image,
                        headline: premiumPlacements[2].label,
                        subheadline: premiumPlacements[2].description,
                        cta: premiumMocks['tour-prem-3'].cta
                      }).headline}
                      description={premiumCreative('tour_sponsored_card', {
                        image: premiumMocks['tour-prem-3'].image,
                        headline: premiumPlacements[2].label,
                        subheadline: premiumPlacements[2].description,
                        cta: premiumMocks['tour-prem-3'].cta
                      }).subheadline}
                      price=""
                      image={premiumCreative('tour_sponsored_card', {
                        image: premiumMocks['tour-prem-3'].image,
                        headline: premiumPlacements[2].label,
                        subheadline: premiumPlacements[2].description,
                        cta: premiumMocks['tour-prem-3'].cta
                      }).image}
                      cta={premiumCreative('tour_sponsored_card', {
                        image: premiumMocks['tour-prem-3'].image,
                        headline: premiumPlacements[2].label,
                        subheadline: premiumPlacements[2].description,
                        cta: premiumMocks['tour-prem-3'].cta
                      }).cta}
                      onView={() =>
                        openPremiumPlacementView('tour_sponsored_card', {
                          headline: premiumPlacements[2].label,
                          subheadline: premiumPlacements[2].description,
                          image: premiumMocks['tour-prem-3'].image
                        })
                      }
                    />
                  );
                }

                if (!viewAllOnly && idx === 7) {
                  acc.push(
                    <TourismPremiumPlacementCard
                      key={premiumPlacements[3].id}
                      title={premiumCreative('tour_region_boost', {
                        image: premiumMocks['tour-prem-4'].image,
                        headline: premiumPlacements[3].label,
                        subheadline: premiumPlacements[3].description,
                        cta: premiumMocks['tour-prem-4'].cta
                      }).headline}
                      description={premiumCreative('tour_region_boost', {
                        image: premiumMocks['tour-prem-4'].image,
                        headline: premiumPlacements[3].label,
                        subheadline: premiumPlacements[3].description,
                        cta: premiumMocks['tour-prem-4'].cta
                      }).subheadline}
                      price=""
                      image={premiumCreative('tour_region_boost', {
                        image: premiumMocks['tour-prem-4'].image,
                        headline: premiumPlacements[3].label,
                        subheadline: premiumPlacements[3].description,
                        cta: premiumMocks['tour-prem-4'].cta
                      }).image}
                      cta={premiumCreative('tour_region_boost', {
                        image: premiumMocks['tour-prem-4'].image,
                        headline: premiumPlacements[3].label,
                        subheadline: premiumPlacements[3].description,
                        cta: premiumMocks['tour-prem-4'].cta
                      }).cta}
                      onView={() =>
                        openPremiumPlacementView('tour_region_boost', {
                          headline: premiumPlacements[3].label,
                          subheadline: premiumPlacements[3].description,
                          image: premiumMocks['tour-prem-4'].image
                        })
                      }
                    />
                  );
                }

                return acc;
              }, [])}
              {!viewAllOnly && items.length < 2 && (
                <TourismPremiumPlacementCard
                  key={`${premiumPlacements[2].id}-fallback`}
                  title={premiumCreative('tour_sponsored_card', {
                    image: premiumMocks['tour-prem-3'].image,
                    headline: premiumPlacements[2].label,
                    subheadline: premiumPlacements[2].description,
                    cta: premiumMocks['tour-prem-3'].cta
                  }).headline}
                  description={premiumCreative('tour_sponsored_card', {
                    image: premiumMocks['tour-prem-3'].image,
                    headline: premiumPlacements[2].label,
                    subheadline: premiumPlacements[2].description,
                    cta: premiumMocks['tour-prem-3'].cta
                  }).subheadline}
                  price=""
                  image={premiumCreative('tour_sponsored_card', {
                    image: premiumMocks['tour-prem-3'].image,
                    headline: premiumPlacements[2].label,
                    subheadline: premiumPlacements[2].description,
                    cta: premiumMocks['tour-prem-3'].cta
                  }).image}
                  cta={premiumCreative('tour_sponsored_card', {
                    image: premiumMocks['tour-prem-3'].image,
                    headline: premiumPlacements[2].label,
                    subheadline: premiumPlacements[2].description,
                    cta: premiumMocks['tour-prem-3'].cta
                  }).cta}
                  onView={() =>
                    openPremiumPlacementView('tour_sponsored_card', {
                      headline: premiumPlacements[2].label,
                      subheadline: premiumPlacements[2].description,
                      image: premiumMocks['tour-prem-3'].image
                    })
                  }
                />
              )}
              {!viewAllOnly && items.length < 8 && (
                <TourismPremiumPlacementCard
                  key={`${premiumPlacements[3].id}-fallback`}
                  title={premiumCreative('tour_region_boost', {
                    image: premiumMocks['tour-prem-4'].image,
                    headline: premiumPlacements[3].label,
                    subheadline: premiumPlacements[3].description,
                    cta: premiumMocks['tour-prem-4'].cta
                  }).headline}
                  description={premiumCreative('tour_region_boost', {
                    image: premiumMocks['tour-prem-4'].image,
                    headline: premiumPlacements[3].label,
                    subheadline: premiumPlacements[3].description,
                    cta: premiumMocks['tour-prem-4'].cta
                  }).subheadline}
                  price=""
                  image={premiumCreative('tour_region_boost', {
                    image: premiumMocks['tour-prem-4'].image,
                    headline: premiumPlacements[3].label,
                    subheadline: premiumPlacements[3].description,
                    cta: premiumMocks['tour-prem-4'].cta
                  }).image}
                  cta={premiumCreative('tour_region_boost', {
                    image: premiumMocks['tour-prem-4'].image,
                    headline: premiumPlacements[3].label,
                    subheadline: premiumPlacements[3].description,
                    cta: premiumMocks['tour-prem-4'].cta
                  }).cta}
                  onView={() =>
                    openPremiumPlacementView('tour_region_boost', {
                      headline: premiumPlacements[3].label,
                      subheadline: premiumPlacements[3].description,
                      image: premiumMocks['tour-prem-4'].image
                    })
                  }
                />
              )}
            </div>

            {!viewAllOnly && <aside className="space-y-4">
              <TourismPremiumPlacementCard
                title={premiumCreative('tour_newsletter_feature', {
                  image: premiumMocks['tour-prem-5'].image,
                  headline: premiumPlacements[4].label,
                  subheadline: premiumPlacements[4].description,
                  cta: premiumMocks['tour-prem-5'].cta
                }).headline}
                description={premiumCreative('tour_newsletter_feature', {
                  image: premiumMocks['tour-prem-5'].image,
                  headline: premiumPlacements[4].label,
                  subheadline: premiumPlacements[4].description,
                  cta: premiumMocks['tour-prem-5'].cta
                }).subheadline}
                price=""
                image={premiumCreative('tour_newsletter_feature', {
                  image: premiumMocks['tour-prem-5'].image,
                  headline: premiumPlacements[4].label,
                  subheadline: premiumPlacements[4].description,
                  cta: premiumMocks['tour-prem-5'].cta
                }).image}
                cta={premiumCreative('tour_newsletter_feature', {
                  image: premiumMocks['tour-prem-5'].image,
                  headline: premiumPlacements[4].label,
                  subheadline: premiumPlacements[4].description,
                  cta: premiumMocks['tour-prem-5'].cta
                }).cta}
                onView={() =>
                  openPremiumPlacementView('tour_newsletter_feature', {
                    headline: premiumPlacements[4].label,
                    subheadline: premiumPlacements[4].description,
                    image: premiumMocks['tour-prem-5'].image
                  })
                }
              />

              <TourismPremiumPlacementCard
                title={premiumCreative('tour_seasonal_takeover', {
                  image: premiumMocks['tour-prem-6'].image,
                  headline: premiumPlacements[5].label,
                  subheadline: premiumPlacements[5].description,
                  cta: premiumMocks['tour-prem-6'].cta
                }).headline}
                description={premiumCreative('tour_seasonal_takeover', {
                  image: premiumMocks['tour-prem-6'].image,
                  headline: premiumPlacements[5].label,
                  subheadline: premiumPlacements[5].description,
                  cta: premiumMocks['tour-prem-6'].cta
                }).subheadline}
                price=""
                image={premiumCreative('tour_seasonal_takeover', {
                  image: premiumMocks['tour-prem-6'].image,
                  headline: premiumPlacements[5].label,
                  subheadline: premiumPlacements[5].description,
                  cta: premiumMocks['tour-prem-6'].cta
                }).image}
                cta={premiumCreative('tour_seasonal_takeover', {
                  image: premiumMocks['tour-prem-6'].image,
                  headline: premiumPlacements[5].label,
                  subheadline: premiumPlacements[5].description,
                  cta: premiumMocks['tour-prem-6'].cta
                }).cta}
                onView={() =>
                  openPremiumPlacementView('tour_seasonal_takeover', {
                    headline: premiumPlacements[5].label,
                    subheadline: premiumPlacements[5].description,
                    image: premiumMocks['tour-prem-6'].image
                  })
                }
              />

              <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
                <h3 className="text-white font-semibold">Traveler Tools</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                  <Link href="/cultural-tourism/trips" className="px-3 py-2 rounded-lg border border-[#d4af37]/25 text-gray-200 hover:border-[#d4af37]/50 inline-flex items-center gap-2"><Calendar size={14} />Trip Dashboard</Link>
                  <button className="px-3 py-2 rounded-lg border border-[#d4af37]/25 text-gray-200 hover:border-[#d4af37]/50 inline-flex items-center gap-2"><Heart size={14} />Save to Wishlist</button>
                  <button className="px-3 py-2 rounded-lg border border-[#d4af37]/25 text-gray-200 hover:border-[#d4af37]/50 inline-flex items-center gap-2"><Ticket size={14} />Gift Certificate</button>
                </div>
              </div>
            </aside>}
          </section>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{totalLoaded} experiences loaded</span>
            <div className="flex gap-2">
              <button
                onClick={onLoadMore}
                className="px-3 py-1.5 rounded-lg border border-[#d4af37]/20 disabled:opacity-40"
                disabled={!hasMore || loadingMore || initialLoading}
              >
                {loadingMore ? 'Loading...' : hasMore ? 'Load More' : 'All Loaded'}
              </button>
            </div>
          </div>

          {viewModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-3xl rounded-2xl border border-[#d4af37]/30 bg-[#101010] overflow-hidden">
                {!selected && (
                  <div className="p-8 text-sm text-gray-300">Experience unavailable.</div>
                )}
                {selected && (
                  <>
                <img src={selected.image} alt={selected.title} className="w-full h-64 object-cover" />
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{selected.title}</h3>
                      <p className="text-sm text-gray-300">{selected.summary}</p>
                    </div>
                    <button onClick={closeModals} className="px-3 py-1.5 rounded-lg border border-[#d4af37]/35 text-[#d4af37] text-sm">
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-300">
                    <span className="inline-flex items-center gap-1"><MapPin size={12} />{selected.region}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={12} />{selected.durationLabel}</span>
                    <span className="inline-flex items-center gap-1"><Users size={12} />{selected.groupSize}</span>
                    <span className="inline-flex items-center gap-1 text-yellow-300"><Star size={12} />{selected.rating.toFixed(1)} ({selected.reviews})</span>
                  </div>
                  <div className="rounded-lg border border-[#d4af37]/20 bg-[#151515] p-3">
                    <p className="text-xs uppercase tracking-wide text-[#d4af37]">Cultural Protocols</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-200">
                      {selected.protocols.map((p) => (
                        <li key={p.id} className="flex items-start gap-2">
                          <Shield size={14} className="mt-0.5 text-[#d4af37]" />
                          <span>{p.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[#d4af37] font-semibold">From ${selected.priceFrom}</p>
                    <Link href={`/cultural-tourism/experiences/${selected.id}`} className="px-4 py-2 rounded-lg bg-[#d4af37] text-black text-sm font-medium">
                      Open Experience
                    </Link>
                  </div>
                </div>
                  </>
                )}
              </div>
            </div>
          )}
    </div>
  );
}


