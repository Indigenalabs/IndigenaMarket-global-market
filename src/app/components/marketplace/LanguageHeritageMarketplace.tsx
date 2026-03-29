'use client';

import { useEffect, useMemo, useState } from 'react';
import { getMarketplaceCardMerchandising } from './marketplaceCardMerchandising';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Filter,
  Globe2,
  Languages,
  Lock,
  Play,
  Receipt,
  Search,
  Shield,
  Star,
  Ticket,
  UserCheck
} from 'lucide-react';
import LanguageHeritageStickyBanner from './LanguageHeritageStickyBanner';
import LanguageHeritagePremiumPlacementCard from './language-heritage/LanguageHeritagePremiumPlacementCard';
import KeeperMiniCard from './language-heritage/KeeperMiniCard';
import { HERITAGE_PREMIUM_PLACEMENTS } from '@/app/language-heritage/components/premiumPlacements';
import {
  fetchMyLanguageHeritageAccessRequests,
  fetchMyLanguageHeritageReceipts,
  fetchLanguageHeritageListings,
  fetchLanguageHeritagePlacements,
  createLanguageHeritagePaymentIntent,
  confirmLanguageHeritagePayment,
  requestLanguageHeritageAccess,
  trackLanguageHeritageEvent,
  type HeritageAccessRequestRecord,
  type HeritageReceipt,
  type HeritageAccessLevel,
  type LanguageHeritageListing,
  type LanguageHeritageQuery
} from '@/app/lib/languageHeritageApi';
import { PILLAR7_CATEGORIES } from '@/app/language-heritage/data/pillar7Catalog';
import {
  buildPlacementCreativeMap,
  buildPlacementSummaryMap,
  formatPlacementPrice,
  type PlacementSummaryEntry
} from '@/app/lib/pillarPlacementController';

interface LanguageHeritageMarketplaceProps {
  viewAllOnly?: boolean;
}

function accessBadge(level: HeritageAccessLevel) {
  if (level === 'elder-approved') {
    return 'border-[#d4af37]/40 bg-[#d4af37]/15 text-[#d4af37]';
  }
  if (level === 'restricted') {
    return 'border-red-500/40 bg-red-500/10 text-red-300';
  }
  if (level === 'community') {
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  }
  return 'border-slate-500/40 bg-slate-500/10 text-slate-200';
}

function formatAccess(level: HeritageAccessLevel) {
  if (level === 'elder-approved') return 'Elder Approved';
  if (level === 'restricted') return 'Restricted';
  if (level === 'community') return 'Community';
  return 'Public';
}

type FeedEntry =
  | { type: 'listing'; listing: LanguageHeritageListing }
  | { type: 'placement'; placementId: string };

type KeeperProfile = {
  name: string;
  nation: string;
  bio: string;
  avatar: string;
  followers: number;
  rating: number;
  collections: number;
  verified: boolean;
};

function avatarForName(name: string) {
  const seed = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const images = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face'
  ];
  return images[seed % images.length];
}

export default function LanguageHeritageMarketplace({ viewAllOnly = false }: LanguageHeritageMarketplaceProps) {
  const [query, setQuery] = useState<LanguageHeritageQuery>({
    categoryId: 'all',
    accessLevel: 'all',
    format: 'all',
    sort: 'featured',
    limit: viewAllOnly ? 30 : 12,
    page: 1
  });
  const [searchText, setSearchText] = useState('');
  const [items, setItems] = useState<LanguageHeritageListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState<'api' | 'mock'>('mock');
  const [summaryMap, setSummaryMap] = useState<Record<string, PlacementSummaryEntry>>({});
  const [creativeMap, setCreativeMap] = useState<Record<string, { image: string; headline: string; subheadline: string; cta: string }>>({});
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [selected, setSelected] = useState<LanguageHeritageListing | null>(null);
  const [selectedKeeper, setSelectedKeeper] = useState<KeeperProfile | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actionState, setActionState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });
  const [protocolConsent, setProtocolConsent] = useState(false);
  const [myReceipts, setMyReceipts] = useState<HeritageReceipt[]>([]);
  const [myAccessRequests, setMyAccessRequests] = useState<HeritageAccessRequestRecord[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQuery((prev) => ({ ...prev, q: searchText.trim() || undefined, page: 1 }));
      void trackLanguageHeritageEvent({ event: 'heritage_search', metadata: { q: searchText.trim() } });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchLanguageHeritageListings(query, controller.signal);
        if (!mounted) return;
        setItems(response.items);
        setTotal(response.total);
        setSource(response.source);
        setPage(response.page);
        setPages(response.pages);
      } catch (err) {
        if (!mounted) return;
        const message = (err as Error).message || 'Could not load Language & Heritage listings.';
        setError(message);
        setItems([]);
        void trackLanguageHeritageEvent({ event: 'heritage_load_error', metadata: { message } });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const loadPlacements = async () => {
      try {
        const payload = await fetchLanguageHeritagePlacements();
        setSummaryMap(buildPlacementSummaryMap(payload.summary));
        setCreativeMap(buildPlacementCreativeMap(payload.placements));
        setPlacementError(null);
      } catch (error) {
        setSummaryMap({});
        setCreativeMap({});
        const message = (error as Error).message || 'Premium placements unavailable';
        setPlacementError(message);
        void trackLanguageHeritageEvent({ event: 'heritage_placements_error', metadata: { message } });
      }
    };
    void loadPlacements();
  }, []);

  useEffect(() => {
    setActionState({ status: 'idle', message: '' });
    setProtocolConsent(false);
  }, [selected?.id]);

  useEffect(() => {
    const loadMine = async () => {
      try {
        const [receipts, requests] = await Promise.all([
          fetchMyLanguageHeritageReceipts(6),
          fetchMyLanguageHeritageAccessRequests(6)
        ]);
        setMyReceipts(receipts);
        setMyAccessRequests(requests);
      } catch {
        setMyReceipts([]);
        setMyAccessRequests([]);
      }
    };
    void loadMine();
  }, []);

  const visibleCategories = useMemo(
    () => [{ id: 'all', name: 'All Categories' }, ...PILLAR7_CATEGORIES.map((entry) => ({ id: entry.id, name: entry.name }))],
    []
  );

  const keeperProfiles = useMemo<KeeperProfile[]>(() => {
    const grouped = new Map<string, LanguageHeritageListing[]>();
    items.forEach((row) => {
      const key = row.keeperName || 'Community Keeper';
      const existing = grouped.get(key) || [];
      existing.push(row);
      grouped.set(key, existing);
    });

    return Array.from(grouped.entries())
      .map(([name, rows]) => {
        const nation = rows[0]?.nation || 'Indigenous Nation';
        const avgRating = rows.reduce((acc, row) => acc + row.rating, 0) / Math.max(1, rows.length);
        const avgReviews = rows.reduce((acc, row) => acc + row.reviews, 0) / Math.max(1, rows.length);
        return {
          name,
          nation,
          bio: 'Knowledge keeper sharing language, story, and cultural archives through community-led protocols.',
          avatar: avatarForName(name),
          followers: Math.round(avgReviews * 2.6 + rows.length * 18 + 120),
          rating: Number(avgRating.toFixed(1)),
          collections: rows.length,
          verified: rows.some((row) => row.verifiedSpeaker)
        };
      })
      .sort((a, b) => b.followers - a.followers)
      .slice(0, 8);
  }, [items]);

  const relatedListings = useMemo(() => {
    if (!selected) return [] as LanguageHeritageListing[];
    return items
      .filter((row) => row.id !== selected.id && (row.keeperName === selected.keeperName || row.nation === selected.nation))
      .slice(0, 4);
  }, [items, selected]);

  const galleryImages = useMemo(() => {
    if (!selected) return [] as string[];
    const raw = [selected.image, ...relatedListings.map((row) => row.image)].filter(Boolean);
    return Array.from(new Set(raw));
  }, [selected, relatedListings]);

  useEffect(() => {
    setGalleryIndex(0);
  }, [selected?.id]);

  const feedEntries = useMemo<FeedEntry[]>(() => {
    const rotatingPlacementIds = [
      'heritage_sponsored_card',
      'heritage_category_boost',
      'heritage_newsletter_feature',
      'heritage_institution_partner'
    ];
    const rows: FeedEntry[] = [];
    let placementIndex = 0;

    items.forEach((listing, index) => {
      rows.push({ type: 'listing', listing });
      if ((index + 1) % 4 === 0 && rotatingPlacementIds.length > 0) {
        rows.push({ type: 'placement', placementId: rotatingPlacementIds[placementIndex % rotatingPlacementIds.length] });
        placementIndex += 1;
      }
    });

    if (rows.length === 0) {
      rows.push({ type: 'placement', placementId: 'heritage_sponsored_card' });
      rows.push({ type: 'placement', placementId: 'heritage_category_boost' });
    }

    return rows;
  }, [items]);

  const onPremiumView = (placementId: string, title: string, description: string, image: string) => {
    const creative = creativeMap[placementId];
    setSelected({
      id: `premium-${placementId}`,
      title: creative?.headline || title,
      categoryId: 'consulting-professional-services',
      categoryLabel: 'Sponsored collection',
      summary: creative?.subheadline || description,
      nation: 'Marketplace Partner',
      keeperName: 'Indigena Marketplace',
      format: 'service',
      accessLevel: 'public',
      verifiedSpeaker: true,
      elderApproved: false,
      communityControlled: true,
      price: 0,
      currency: 'USD',
      image: creative?.image || image,
      tags: ['premium placement'],
      rating: 5,
      reviews: 0,
      createdAt: new Date().toISOString()
    });
  };

  const viewPremiumSlot = (placementId: string) => {
    const slot = HERITAGE_PREMIUM_PLACEMENTS.find((entry) => entry.id === placementId);
    if (!slot) return;
    onPremiumView(slot.id, slot.label, slot.description, slot.image);
  };

  const handleAccessOrPurchase = async () => {
    if (!selected) return;
    if (!protocolConsent) {
      setActionState({ status: 'error', message: 'You must accept protocol consent before continuing.' });
      return;
    }
    setActionState({ status: 'loading', message: 'Processing...' });
    try {
      const acknowledgements = ['cultural_protocol_acknowledged', 'icip_usage_terms_acknowledged'];
      if (selected.accessLevel !== 'public') {
        const response = await requestLanguageHeritageAccess(selected.id, '', true, acknowledgements);
        setActionState({
          status: 'success',
          message: response?.message || 'Access request submitted.'
        });
        const reqRow = response?.request as HeritageAccessRequestRecord | undefined;
        if (reqRow?.requestId) {
          setMyAccessRequests((prev) => [reqRow, ...prev.filter((r) => r.requestId !== reqRow.requestId)].slice(0, 6));
        }
        return;
      }

      if (selected.price <= 0) {
        setActionState({ status: 'success', message: 'This listing is free to access.' });
        return;
      }

      const intent = await createLanguageHeritagePaymentIntent(selected.id, true, acknowledgements);
      const receipt = await confirmLanguageHeritagePayment(selected.id, intent.intentId, intent.clientSecret, true, acknowledgements);
      setActionState({
        status: 'success',
        message: `Payment confirmed. Receipt: ${receipt.receiptId}`
      });
      setMyReceipts((prev) => [receipt, ...prev.filter((row) => row.receiptId !== receipt.receiptId)].slice(0, 6));
    } catch (error) {
      setActionState({
        status: 'error',
        message: (error as Error).message || 'Action failed.'
      });
      void trackLanguageHeritageEvent({
        event: 'heritage_action_error',
        listingId: selected.id,
        categoryId: selected.categoryId,
        metadata: { message: (error as Error).message || 'Action failed.' }
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#141414] via-[#101010] to-[#141414] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {viewAllOnly ? 'Language & Heritage Library' : 'Language & Heritage Marketplace'}
            </h1>
            <p className="mt-1 text-gray-400">
              Community-controlled language resources, archives, immersion experiences, and heritage services.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-[#d4af37]/30 px-2 py-1 text-[#d4af37]">18 categories</span>
              <span className="rounded-full border border-emerald-500/30 px-2 py-1 text-emerald-300">Protocol-aware access</span>
              <span className="rounded-full border border-slate-500/30 px-2 py-1 text-slate-300">
                Source: {source === 'api' ? 'Live API' : 'Mock Fallback'}
              </span>
            </div>
          </div>
          <Link
            href="/language-heritage/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10"
          >
            <BookOpen size={16} />
            View All
          </Link>
        </div>
      </section>

      <LanguageHeritageStickyBanner />
      {placementError ? (
        <section className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          Premium placement data temporarily unavailable. Showing default slot layout.
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-[#d4af37]/25 bg-[#0f0f0f]">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&h=540&fit=crop"
            alt="Language and heritage hero"
            className="h-56 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
          <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6">
            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-[#d4af37]/40 bg-black/60 px-2 py-1 text-xs text-[#d4af37]">
              <Languages size={14} />
              Heritage + Revitalization
            </span>
            <h2 className="max-w-2xl text-3xl font-bold text-white">Protect Voice, Share Knowledge, Respect Protocol.</h2>
            <p className="max-w-3xl text-sm text-gray-200">
              Browse language tools, archives, storytelling collections, and professional services with community-led access controls.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Featured Keepers • Premium Slot</h3>
          <button type="button" onClick={() => viewPremiumSlot('heritage_speaker_spotlight')} className="inline-flex items-center gap-1 text-xs text-[#d4af37] hover:text-[#f4e4a6]">
            View Slot
            <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {keeperProfiles.slice(0, 4).map((keeper) => (
            <button
              key={keeper.name}
              type="button"
              onClick={() => setSelectedKeeper(keeper)}
              className="group rounded-xl border border-white/10 bg-[#0b0b0b] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-[#d4af37]/35"
            >
              <div className="flex items-center gap-3">
                <img src={keeper.avatar} alt={keeper.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-white">{keeper.name}</p>
                  <p className="text-xs text-gray-400">{keeper.nation}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-[#d4af37]">{keeper.collections} collections</span>
                <span className="text-gray-300">{keeper.rating.toFixed(1)} rating</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Live Sessions & Bundles • Premium Slot</h3>
          <button type="button" onClick={() => viewPremiumSlot('heritage_institution_partner')} className="inline-flex items-center gap-1 text-xs text-[#d4af37] hover:text-[#f4e4a6]">
            View Slot
            <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {[
              { title: 'Evening Story Circle', host: 'Elder Collective', viewers: 182, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=500&fit=crop' },
              { title: 'Language Pronunciation Lab', host: 'Native Script Lab', viewers: 96, image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop' }
            ].map((session) => (
              <article key={session.title} className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]">
                <div className="relative h-28">
                  <img src={session.image} alt={session.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-[#d4af37]/40 bg-black/60 px-2 py-0.5 text-[10px] text-[#d4af37]">
                    <Play size={10} />
                    Live
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-white">{session.title}</p>
                  <p className="text-xs text-gray-400">{session.host} - {session.viewers} watching</p>
                </div>
              </article>
            ))}
          </div>
          <div className="space-y-3">
            {[
              { title: 'Starter Fluency Bundle', items: 14, price: 95, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=500&fit=crop' },
              { title: 'Community Archive Pack', items: 22, price: 165, image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=500&fit=crop' }
            ].map((bundle) => (
              <article key={bundle.title} className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]">
                <div className="relative h-28">
                  <img src={bundle.image} alt={bundle.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  <span className="absolute left-2 top-2 rounded-full border border-[#d4af37]/40 bg-black/60 px-2 py-0.5 text-[10px] text-[#d4af37]">
                    Bundle
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-white">{bundle.title}</p>
                  <p className="text-xs text-gray-400">{bundle.items} items - USD {bundle.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4 md:grid-cols-4">
        <label className="flex items-center gap-2 rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-gray-300 md:col-span-2">
          <Search size={16} className="text-[#d4af37]" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search keepers, nations, archives, tools"
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </label>
        <select
          value={query.categoryId || 'all'}
          onChange={(e) => setQuery((prev) => ({ ...prev, categoryId: e.target.value, page: 1 }))}
          className="rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-sm text-white"
        >
          {visibleCategories.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
        <select
          value={query.sort || 'featured'}
          onChange={(e) => setQuery((prev) => ({ ...prev, sort: e.target.value as LanguageHeritageQuery['sort'], page: 1 }))}
          className="rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-sm text-white"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>

        <select
          value={query.accessLevel || 'all'}
          onChange={(e) => setQuery((prev) => ({ ...prev, accessLevel: e.target.value as LanguageHeritageQuery['accessLevel'], page: 1 }))}
          className="rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-sm text-white"
        >
          <option value="all">All Access</option>
          <option value="public">Public</option>
          <option value="community">Community</option>
          <option value="restricted">Restricted</option>
          <option value="elder-approved">Elder Approved</option>
        </select>
        <select
          value={query.format || 'all'}
          onChange={(e) => setQuery((prev) => ({ ...prev, format: e.target.value as LanguageHeritageQuery['format'], page: 1 }))}
          className="rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-sm text-white"
        >
          <option value="all">All Formats</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
          <option value="document">Document</option>
          <option value="service">Service</option>
          <option value="experience">Experience</option>
          <option value="software">Software</option>
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2">
          <Filter size={14} className="text-[#d4af37]" />
          <input
            type="number"
            placeholder="Min Price"
            value={query.minPrice ?? ''}
            onChange={(e) =>
              setQuery((prev) => ({
                ...prev,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
                page: 1
              }))
            }
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2">
          <Filter size={14} className="text-[#d4af37]" />
          <input
            type="number"
            placeholder="Max Price"
            value={query.maxPrice ?? ''}
            onChange={(e) =>
              setQuery((prev) => ({
                ...prev,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
                page: 1
              }))
            }
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </label>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Listings</h3>
          <span className="text-sm text-gray-400">{loading ? 'Loading...' : `${total} results`}</span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {(!loading && items.length === 0) && (
          <div className="mb-4 rounded-xl border border-[#d4af37]/20 bg-[#101010] p-6 text-center">
            <p className="text-white">No listings match these filters.</p>
            <p className="mt-1 text-sm text-gray-400">Try broadening category/access filters or clear price range.</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {feedEntries.map((entry, idx) => {
            if (entry.type === 'placement') {
              const placement = HERITAGE_PREMIUM_PLACEMENTS.find((item) => item.id === entry.placementId);
              if (!placement) return null;
              const creative = creativeMap[placement.id];
              return (
                <LanguageHeritagePremiumPlacementCard
                  key={`placement-${placement.id}-${idx}`}
                  title={creative?.headline || placement.label}
                  description={creative?.subheadline || placement.description}
                  image={creative?.image || placement.image}
                  price={formatPlacementPrice(placement.fallbackPrice, placement.id, summaryMap)}
                  cta={creative?.cta || placement.cta}
                  onView={() => onPremiumView(placement.id, placement.label, placement.description, placement.image)}
                />
              );
            }
            const listing = entry.listing;
            const merch = getMarketplaceCardMerchandising({
              title: listing.title,
              pillarLabel: 'Language & Heritage',
              image: listing.image,
              coverImage: listing.image,
              galleryOrder: [listing.image],
              ctaMode: listing.accessLevel === 'public' ? (listing.price > 0 ? 'buy' : 'message') : 'message',
              ctaPreset: listing.accessLevel === 'public' ? (listing.price > 0 ? 'collect-now' : 'message-first') : 'message-first',
              availabilityLabel: formatAccess(listing.accessLevel),
              availabilityTone: listing.accessLevel === 'restricted' ? 'warning' : 'default',
              featured: listing.verifiedSpeaker || listing.elderApproved,
              merchandisingRank: listing.verifiedSpeaker ? 4 : 10,
              status: 'Active',
              priceLabel: `${listing.currency} ${listing.price.toLocaleString()}`,
              blurb: listing.summary,
            });
            return (
            <article
              key={listing.id}
              className="fade-up-in overflow-hidden rounded-xl border border-[#d4af37]/15 bg-[#101010]"
              style={{ animationDelay: `${idx * 45}ms` }}
            >
              <img src={merch.image} alt={listing.title} className="h-44 w-full object-cover" />
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="line-clamp-2 text-base font-semibold text-white">{listing.title}</h4>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${accessBadge(listing.accessLevel)}`}>
                    {formatAccess(listing.accessLevel)}
                  </span>
                </div>

                <p className="line-clamp-2 text-sm text-gray-400">{listing.summary}</p>

                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-2.5">
                  <div className="flex items-center gap-2">
                    <img src={avatarForName(listing.keeperName)} alt={listing.keeperName} className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-medium text-white">{listing.keeperName}</p>
                      <p className="text-[11px] text-gray-400">{listing.nation}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedKeeper({
                        name: listing.keeperName,
                        nation: listing.nation,
                        bio: 'Knowledge keeper sharing language, story, and cultural archives through community-led protocols.',
                        avatar: avatarForName(listing.keeperName),
                        followers: Math.round(listing.reviews * 2.5 + 120),
                        rating: listing.rating,
                        collections: items.filter((row) => row.keeperName === listing.keeperName).length || 1,
                        verified: listing.verifiedSpeaker
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/35 px-2 py-1 text-[11px] text-[#d4af37] hover:bg-[#d4af37]/10"
                  >
                    Keeper
                    <ArrowRight size={11} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Globe2 size={12} className="text-[#d4af37]" />
                    {listing.nation}
                  </span>
                  <span className="inline-flex items-center gap-1"><UserCheck size={12} className="text-[#d4af37]" /> Verified Path</span>
                  {listing.durationLabel && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} className="text-[#d4af37]" />
                      {listing.durationLabel}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-gray-300">
                    <Star size={12} className="text-[#d4af37]" /> {listing.rating.toFixed(1)} ({listing.reviews})
                  </span>
                  <span className="rounded-full border border-[#d4af37]/30 px-2 py-0.5 text-[#d4af37]">{listing.categoryLabel}</span>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div>
                    <p className="text-lg font-semibold text-[#d4af37]">{listing.currency} {listing.price.toLocaleString()}</p>
                    {listing.itemCountLabel && <p className="text-xs text-gray-500">{listing.itemCountLabel}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(listing);
                      void trackLanguageHeritageEvent({ event: 'heritage_view_listing', listingId: listing.id, categoryId: listing.categoryId });
                    }}
                    className="rounded-lg border border-[#d4af37]/40 px-3 py-2 text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/10"
                  >{merch.ctaLabel}</button>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                  {listing.communityControlled && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 px-2 py-0.5 text-emerald-300">
                      <Shield size={11} /> Community Controlled
                    </span>
                  )}
                  {listing.verifiedSpeaker && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/30 px-2 py-0.5 text-[#d4af37]">
                      <CheckCircle2 size={11} /> Verified Speaker
                    </span>
                  )}
                  {listing.elderApproved && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/30 px-2 py-0.5 text-purple-200">
                      <Lock size={11} /> Elder Signed
                    </span>
                  )}
                </div>
              </div>
            </article>
            );
          })}
        </div>
        {pages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setQuery((prev) => ({ ...prev, page: Math.max(1, page - 1) }))}
              className="rounded-full border border-[#d4af37]/40 px-4 py-1.5 text-sm text-[#d4af37] disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-gray-400">Page {page} / {pages}</span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setQuery((prev) => ({ ...prev, page: Math.min(pages, page + 1) }))}
              className="rounded-full border border-[#d4af37]/40 px-4 py-1.5 text-sm text-[#d4af37] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>

      <section>
        {(() => {
          const placement = HERITAGE_PREMIUM_PLACEMENTS.find((item) => item.id === 'heritage_featured_banner');
          if (!placement) return null;
          const creative = creativeMap[placement.id];
          return (
            <LanguageHeritagePremiumPlacementCard
              title={creative?.headline || placement.label}
              description={creative?.subheadline || placement.description}
              image={creative?.image || placement.image}
              price={formatPlacementPrice(placement.fallbackPrice, placement.id, summaryMap)}
              cta={creative?.cta || placement.cta}
              onView={() => onPremiumView(placement.id, placement.label, placement.description, placement.image)}
            />
          );
        })()}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
            <Ticket size={15} className="text-[#d4af37]" />
            My Access Requests
          </h3>
          {myAccessRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No access requests yet.</p>
          ) : (
            <div className="space-y-2">
              {myAccessRequests.map((row) => (
                <div key={row.requestId} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm">
                  <span className="text-gray-300">{row.listingId}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      row.status === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : row.status === 'rejected'
                          ? 'bg-red-500/15 text-red-300'
                          : 'bg-[#d4af37]/15 text-[#d4af37]'
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
            <Receipt size={15} className="text-[#d4af37]" />
            My Heritage Receipts
          </h3>
          {myReceipts.length === 0 ? (
            <p className="text-sm text-gray-500">No receipts yet.</p>
          ) : (
            <div className="space-y-2">
              {myReceipts.map((row) => (
                <div key={row.receiptId} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm">
                  <span className="text-gray-300">{row.receiptId}</span>
                  <span className="text-[#d4af37]">{row.currency} {Number(row.amount || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {!viewAllOnly && (
        <div className="flex justify-center">
          <Link
            href="/language-heritage/marketplace"
            className="rounded-full border border-[#d4af37]/40 px-6 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10"
          >
            Browse Full Library
          </Link>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#d4af37]/30 bg-[#101010]">
            <img src={selected.image} alt={selected.title} className="h-56 w-full object-cover" />
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selected.title}</h3>
                  <p className="text-sm text-gray-400">{selected.categoryLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
                >
                  Close
                </button>
              </div>

              <p className="text-sm text-gray-300">{selected.summary}</p>

              <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                <p className="text-xs uppercase tracking-wider text-gray-500">Preview Gallery</p>
                <div className="relative mt-2 overflow-hidden rounded-lg border border-white/10">
                  <img
                    src={galleryImages[galleryIndex] || selected.image}
                    alt={`${selected.title} preview`}
                    className="h-56 w-full object-cover transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {galleryImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-1.5 text-white hover:border-[#d4af37]/50"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryIndex((prev) => (prev + 1) % galleryImages.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-1.5 text-white hover:border-[#d4af37]/50"
                        aria-label="Next image"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </>
                  ) : null}
                </div>
                {galleryImages.length > 1 ? (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {galleryImages.slice(0, 8).map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setGalleryIndex(index)}
                        className={`aspect-square overflow-hidden rounded-md border transition-colors ${
                          galleryIndex === index ? 'border-[#d4af37]/70' : 'border-white/10 hover:border-[#d4af37]/35'
                        }`}
                      >
                        <img src={image} alt={`${selected.title} thumb ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <img src={avatarForName(selected.keeperName)} alt={selected.keeperName} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-white">{selected.keeperName}</p>
                      <p className="text-xs text-gray-400">{selected.nation}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedKeeper({
                        name: selected.keeperName,
                        nation: selected.nation,
                        bio: 'Knowledge keeper sharing language, story, and cultural archives through community-led protocols.',
                        avatar: avatarForName(selected.keeperName),
                        followers: Math.round(selected.reviews * 2.5 + 120),
                        rating: selected.rating,
                        collections: items.filter((row) => row.keeperName === selected.keeperName).length || 1,
                        verified: selected.verifiedSpeaker
                      })
                    }
                    className="rounded-full border border-[#d4af37]/40 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
                  >
                    View Keeper
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-black/30 p-2">
                    <p className="font-semibold text-[#d4af37]">{selected.rating.toFixed(1)}</p>
                    <p className="text-gray-400">Rating</p>
                  </div>
                  <div className="rounded-lg bg-black/30 p-2">
                    <p className="font-semibold text-white">{selected.reviews}</p>
                    <p className="text-gray-400">Reviews</p>
                  </div>
                  <div className="rounded-lg bg-black/30 p-2">
                    <p className="font-semibold text-white">{relatedListings.length}</p>
                    <p className="text-gray-400">Related</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-sm text-gray-300 md:grid-cols-2">
                <p><span className="text-gray-500">Nation:</span> {selected.nation}</p>
                <p><span className="text-gray-500">Keeper:</span> {selected.keeperName}</p>
                <p><span className="text-gray-500">Access:</span> {formatAccess(selected.accessLevel)}</p>
                <p><span className="text-gray-500">Format:</span> {selected.format}</p>
              </div>

              {relatedListings.length > 0 ? (
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Related Listings</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {relatedListings.map((row) => (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => setSelected(row)}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 p-2 text-left hover:border-[#d4af37]/35"
                      >
                        <img src={row.image} alt={row.title} className="h-10 w-10 rounded-md object-cover" />
                        <div>
                          <p className="line-clamp-1 text-xs font-semibold text-white">{row.title}</p>
                          <p className="text-[11px] text-gray-400">{row.currency} {row.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-[#d4af37]/20 bg-[#0b0b0b] p-4">
                <p className="text-xs uppercase tracking-wider text-gray-500">Access and Protocol</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><Shield size={14} className="text-[#d4af37]" /> Cultural protocol acknowledgment required before access.</li>
                  <li className="flex items-center gap-2"><Lock size={14} className="text-[#d4af37]" /> Download rights follow listing-specific ICIP license controls.</li>
                  <li className="flex items-center gap-2"><Calendar size={14} className="text-[#d4af37]" /> Usage is tracked for community transparency logs.</li>
                </ul>
                <label className="mt-3 flex items-center gap-2 rounded-lg border border-[#d4af37]/20 bg-black/30 px-3 py-2 text-sm text-gray-200">
                  <input
                    type="checkbox"
                    checked={protocolConsent}
                    onChange={(e) => setProtocolConsent(e.target.checked)}
                    className="h-4 w-4 accent-[#d4af37]"
                  />
                  I acknowledge cultural protocols and ICIP usage terms.
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-xl font-semibold text-[#d4af37]">{selected.currency} {selected.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Final access terms shown at checkout</p>
                </div>
                <button
                  type="button"
                  onClick={handleAccessOrPurchase}
                  disabled={actionState.status === 'loading' || !protocolConsent}
                  className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:brightness-110"
                >
                  {actionState.status === 'loading' ? (
                    'Processing...'
                  ) : selected.accessLevel === 'public' && selected.price <= 0 ? (
                    'Access Free Listing'
                  ) : selected.accessLevel === 'public' ? (
                    <span className="inline-flex items-center gap-2"><CreditCard size={14} /> Purchase Access</span>
                  ) : (
                    'Submit Access Request'
                  )}
                </button>
              </div>
              {actionState.status !== 'idle' && (
                <div
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    actionState.status === 'error'
                      ? 'border-red-500/40 bg-red-500/10 text-red-200'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  }`}
                >
                  <p className="inline-flex items-center gap-2">
                    {actionState.status === 'error' && <AlertCircle size={14} />}
                    {actionState.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedKeeper ? (
        <KeeperMiniCard
          name={selectedKeeper.name}
          nation={selectedKeeper.nation}
          bio={selectedKeeper.bio}
          avatar={selectedKeeper.avatar}
          followers={selectedKeeper.followers}
          rating={selectedKeeper.rating}
          collections={selectedKeeper.collections}
          verified={selectedKeeper.verified}
          onClose={() => setSelectedKeeper(null)}
        />
      ) : null}
    </div>
  );
}

