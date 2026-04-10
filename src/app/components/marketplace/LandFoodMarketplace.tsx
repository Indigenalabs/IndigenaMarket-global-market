'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import LandFoodHero from '@/app/land-food/components/LandFoodHero';
import {
  ProductCard,
  ProducerCard,
  ProjectCard,
  ServiceCard,
  StatsStrip,
  RegenerativeImpactBand
} from '@/app/land-food/components/LandFoodCards';
import {
  products,
  producers,
  projects,
  services,
  type LandFoodCategoryId,
  type LandFoodProduct,
  type ConservationProject,
  type StewardshipService
} from '@/app/land-food/data/pillar8Data';
import { LAND_FOOD_PREMIUM_PLACEMENTS } from '@/app/land-food/components/premiumPlacements';
import LandFoodPremiumPlacementCard from '@/app/land-food/components/LandFoodPremiumPlacementCard';
import {
  fetchLandFoodListings,
  fetchLandFoodPlacements,
  trackLandFoodEvent,
  type LandFoodListing,
  type LandFoodListingKind,
  type LandFoodQuery
} from '@/app/lib/landFoodApi';
import {
  buildPlacementCreativeMap,
  buildPlacementSummaryMap,
  formatPlacementPrice,
  type PlacementSummaryEntry
} from '@/app/lib/pillarPlacementController';
import CommunityMarketplaceCard from '@/app/components/community/CommunityMarketplaceCard';
import { fetchCommunityMarketplaceOffers, type CommunityMarketplaceOffer } from '@/app/lib/communityMarketplaceApi';

type Mode = 'products' | 'projects' | 'services';
type FeedEntry =
  | { type: 'product'; product: LandFoodProduct }
  | { type: 'sponsored'; placementId: string };
type SlotTheme = { badge: string; ring: string };

const toModeKind = (mode: Mode): LandFoodListingKind => {
  if (mode === 'projects') return 'project';
  if (mode === 'services') return 'service';
  return 'product';
};

export default function LandFoodMarketplace() {
  const [mode, setMode] = useState<Mode>('products');
  const [queryText, setQueryText] = useState('');
  const [category, setCategory] = useState<'all' | LandFoodCategoryId>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [items, setItems] = useState<LandFoodListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'api' | 'mock'>('mock');
  const [communityOffers, setCommunityOffers] = useState<CommunityMarketplaceOffer[]>([]);

  const [summaryMap, setSummaryMap] = useState<Record<string, PlacementSummaryEntry>>({});
  const [creativeMap, setCreativeMap] = useState<Record<string, { image: string; headline: string; subheadline: string; cta: string }>>({});
  const getSlot = (id: string) => LAND_FOOD_PREMIUM_PLACEMENTS.find((x) => x.id === id);
  const slotThemes: Record<string, SlotTheme> = {
    landfood_sticky_banner: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35', ring: 'border-emerald-400/35' },
    landfood_hero_banner: { badge: 'bg-amber-500/15 text-amber-300 border-amber-400/35', ring: 'border-amber-400/35' },
    landfood_featured_producer_spotlight: { badge: 'bg-sky-500/15 text-sky-300 border-sky-400/35', ring: 'border-sky-400/35' },
    landfood_trending_strip: { badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/35', ring: 'border-fuchsia-400/35' },
    landfood_sponsored_listing_card: { badge: 'bg-rose-500/15 text-rose-300 border-rose-400/35', ring: 'border-rose-400/35' },
    landfood_project_spotlight: { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/35', ring: 'border-cyan-400/35' },
    landfood_institution_partner_strip: { badge: 'bg-violet-500/15 text-violet-300 border-violet-400/35', ring: 'border-violet-400/35' }
  };
  const slotTheme = (id: string) =>
    slotThemes[id] || { badge: 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/35', ring: 'border-[#d4af37]/35' };

  const apiQuery: LandFoodQuery = useMemo(
    () => ({
      q: queryText || undefined,
      kind: toModeKind(mode),
      category,
      verifiedOnly,
      page: 1,
      limit: 24
    }),
    [queryText, mode, category, verifiedOnly]
  );

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const page = await fetchLandFoodListings(apiQuery, controller.signal);
        if (!mounted) return;
        setItems(page.items);
        setSource(page.source);
      } catch (e) {
        if (!mounted) return;
        const message = (e as Error).message || 'Failed to load Land & Food listings.';
        setItems([]);
        setError(message);
        void trackLandFoodEvent({ event: 'land_food_load_error', metadata: { message } });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [apiQuery]);

  useEffect(() => {
    let cancelled = false;
    fetchCommunityMarketplaceOffers({ pillar: 'land-food', search: queryText || undefined })
      .then((offers) => {
        if (!cancelled) setCommunityOffers(offers.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setCommunityOffers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [queryText]);

  useEffect(() => {
    const loadPlacements = async () => {
      try {
        const payload = await fetchLandFoodPlacements();
        setSummaryMap(buildPlacementSummaryMap(payload.summary));
        setCreativeMap(buildPlacementCreativeMap(payload.placements));
      } catch (e) {
        const message = (e as Error).message || 'Land & Food placements unavailable';
        void trackLandFoodEvent({ event: 'land_food_placement_error', metadata: { message } });
        setSummaryMap({});
        setCreativeMap({});
      }
    };
    void loadPlacements();
  }, []);

  const mappedProducts = useMemo(() => {
    const productIds = items.filter((x) => x.kind === 'product').map((x) => x.id);
    if (mode === 'products') {
      if (productIds.length === 0) return [];
      return products.filter((p) => productIds.includes(p.id));
    }
    if (productIds.length === 0) return products;
    return products.filter((p) => productIds.includes(p.id));
  }, [items, mode]);

  const mappedProjects = useMemo(() => {
    const ids = items.filter((x) => x.kind === 'project').map((x) => x.id);
    if (mode === 'projects') {
      if (ids.length === 0) return [];
      return projects.filter((p) => ids.includes(p.id));
    }
    if (ids.length === 0) return projects;
    return projects.filter((p) => ids.includes(p.id));
  }, [items, mode]);

  const mappedServices = useMemo(() => {
    const ids = items.filter((x) => x.kind === 'service').map((x) => x.id);
    if (mode === 'services') {
      if (ids.length === 0) return [];
      return services.filter((s) => ids.includes(s.id));
    }
    if (ids.length === 0) return services;
    return services.filter((s) => ids.includes(s.id));
  }, [items, mode]);

  const productFeed = useMemo<FeedEntry[]>(() => {
    const entries: FeedEntry[] = [];
    mappedProducts.forEach((product, idx) => {
      entries.push({ type: 'product', product });
      // Keep in-feed sponsored injection to a single deterministic card.
      if ((idx + 1) === 4) {
        entries.push({ type: 'sponsored', placementId: 'landfood_sponsored_listing_card' });
      }
    });
    return entries;
  }, [mappedProducts]);

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#131710] via-[#10130e] to-[#131710] p-6">
        <h1 className="text-3xl font-bold text-white">Land & Food Marketplace</h1>
        <p className="mt-1 text-gray-400">Traditional foods, natural materials, and stewardship services rooted in Indigenous land guardianship.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[#d4af37]/30 px-2 py-1 text-[#d4af37]">Regenerative Economy</span>
          <span className="rounded-full border border-emerald-500/30 px-2 py-1 text-emerald-300">Community Verified</span>
          <span className="rounded-full border border-slate-500/30 px-2 py-1 text-slate-300">Source: {source === 'api' ? 'Live API' : 'Mock Fallback'}</span>
        </div>
      </section>

      <section className="sticky top-0 z-30 rounded-lg border border-[#d4af37]/30 bg-gradient-to-r from-[#1d2e1a] via-[#121212] to-[#2b220f] px-4 py-2 text-sm text-[#f3e3b0]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">Premium Sticky Announcement Banner • Seasonal wild rice and blue corn harvest preorders are now open.</span>
          <button
            type="button"
            className="rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
            onClick={() => void trackLandFoodEvent({ event: 'land_food_premium_click', metadata: { slot: 'landfood_sticky_banner' } })}
          >
            View
          </button>
        </div>
      </section>

      <LandFoodHero
        eyebrow="Pillar 8"
        title={creativeMap['landfood_hero_banner']?.headline || 'Regenerative Land, Living Food Systems'}
        description={creativeMap['landfood_hero_banner']?.subheadline || 'Buy from verified producers, fund conservation projects, and contract TEK-aligned stewardship services.'}
        image={creativeMap['landfood_hero_banner']?.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1800&h=900&fit=crop'}
        chips={['Traditional Foods', 'Conservation Credits', 'TEK Services']}
        actions={[{ href: '/land-food', label: 'Open Full Pillar' }, { href: '/land-food/marketplace', label: 'View All', tone: 'secondary' }]}
        premiumLabel="Premium Hero Banner"
      />

      <StatsStrip />
      <RegenerativeImpactBand />

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Recent Sales & Activity</h3>
          <span className="text-xs text-gray-400">Last 24h marketplace signals</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'Wild Rice Harvest Pack', meta: 'Sold to Adelaide Food Co-op', value: '$420', ago: '12m ago' },
            { title: 'Tepary Bean Seed Set', meta: 'Purchased by Desert Learning Farm', value: '$180', ago: '28m ago' },
            { title: 'Wetland Carbon Credits', meta: '42 credits reserved by EcoFund AU', value: '$1,890', ago: '1h ago' },
            { title: 'Natural Indigo Dye Bundle', meta: 'Repeat order from Textile Studio', value: '$260', ago: '2h ago' }
          ].map((sale) => (
            <article key={sale.title} className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-sm font-semibold text-white">{sale.title}</p>
              <p className="mt-1 text-xs text-gray-400">{sale.meta}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[#d4af37]">{sale.value}</span>
                <span className="text-emerald-300">{sale.ago}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-4">
        <div className="grid gap-3 md:grid-cols-[1fr,220px,140px]">
          <input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search products, projects, services, nations"
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'all' | LandFoodCategoryId)}
            className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
          >
            <option value="all">All Categories</option>
            <option value="traditional-foods">Traditional Foods</option>
            <option value="heirloom-seeds-plants">Heirloom Seeds & Plants</option>
            <option value="natural-materials-dyes">Natural Materials & Dyes</option>
            <option value="value-added-products">Value-Added Products</option>
            <option value="gift-bundle-boxes">Gift & Bundle Boxes</option>
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-gray-200">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4 accent-[#d4af37]" />
            Verified only
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {([
            ['products', 'Products'],
            ['projects', 'Conservation Projects'],
            ['services', 'Stewardship Services']
          ] as Array<[Mode, string]>).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${mode === id ? 'border-[#d4af37]/60 bg-[#d4af37]/15 text-[#d4af37]' : 'border-white/20 text-gray-300 hover:border-[#d4af37]/30'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border bg-[#10110f] p-4 md:p-5 ${slotTheme('landfood_featured_producer_spotlight').ring}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Featured Producers • Premium Placement</h3>
          <button className="text-xs text-[#d4af37] hover:underline" onClick={() => void trackLandFoodEvent({ event: 'land_food_featured_producer_slot_view' })}>View slot</button>
        </div>
        <div className="mb-4 rounded-xl border border-[#d4af37]/30 bg-gradient-to-r from-[#1b160a] via-[#10110f] to-[#1b160a] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[#f3e3b0]">
              Featured Producer Spotlight • Own this high-trust ranking surface.
            </p>
            <button
              type="button"
              className="rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
              onClick={() => void trackLandFoodEvent({ event: 'land_food_premium_click', metadata: { slot: 'landfood_featured_producer_spotlight' } })}
            >
              View
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {producers.map((item) => <ProducerCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className={`rounded-2xl border bg-[#10110f] p-4 md:p-5 ${slotTheme('landfood_trending_strip').ring}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Trending Strip • Premium Placement</h3>
          <button
            type="button"
            className="text-xs text-[#d4af37] hover:underline"
            onClick={() => void trackLandFoodEvent({ event: 'land_food_premium_click', metadata: { slot: 'landfood_trending_strip' } })}
          >
            View
          </button>
        </div>
        <div className="mb-4 rounded-xl border border-[#d4af37]/25 bg-black/30 px-4 py-3 text-sm text-gray-200">
          Trending Strip Placement • inserted in high-intent demand discovery rails.
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {mappedProducts.slice(0, 4).map((item) => <ProductCard key={`trend-${item.id}`} item={item} />)}
        </div>
      </section>

      {loading ? <p className="text-sm text-gray-400">Loading listings...</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {mode === 'products' ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {productFeed.map((entry, idx) => {
            if (entry.type === 'sponsored') {
              const slot = getSlot('landfood_sponsored_listing_card');
              if (!slot) return null;
              const creative = creativeMap[slot.id];
              return (
                <LandFoodPremiumPlacementCard
                  key={`sponsor-${idx}`}
                  title={creative?.headline || slot.label}
                  description={creative?.subheadline || slot.description}
                  image={creative?.image || slot.image}
                  price=""
                  cta={creative?.cta || slot.cta}
                  onView={() => void trackLandFoodEvent({ event: 'land_food_premium_click', metadata: { slot: slot.id } })}
                />
              );
            }
            return <ProductCard key={entry.product.id} item={entry.product} />;
          })}
          {communityOffers.slice(0, 2).map((offer) => (
            <CommunityMarketplaceCard key={`land-food-product-${offer.id}`} offer={offer} mode="mixed" className="h-full" />
          ))}
          {!loading && !error && mappedProducts.length === 0 ? (
            <article className="md:col-span-2 xl:col-span-3 rounded-xl border border-white/15 bg-black/25 p-6 text-center">
              <p className="text-base font-semibold text-white">No products match your filters</p>
              <p className="mt-1 text-sm text-gray-400">Try a broader search, turn off Verified only, or switch category.</p>
            </article>
          ) : null}
        </section>
      ) : null}

      {mode === 'projects' ? (
        <section className="grid gap-4 md:grid-cols-2">
          {mappedProjects.map((item: ConservationProject) => <ProjectCard key={item.id} item={item} />)}
          {communityOffers.slice(0, 1).map((offer) => (
            <CommunityMarketplaceCard key={`land-food-project-${offer.id}`} offer={offer} mode="mixed" className="h-full" />
          ))}
          {!loading && !error && mappedProjects.length === 0 ? (
            <article className="md:col-span-2 rounded-xl border border-white/15 bg-black/25 p-6 text-center">
              <p className="text-base font-semibold text-white">No conservation projects match your filters</p>
              <p className="mt-1 text-sm text-gray-400">Try a broader query or switch tabs.</p>
            </article>
          ) : null}
        </section>
      ) : null}

      {mode === 'services' ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mappedServices.map((item: StewardshipService) => <ServiceCard key={item.id} item={item} />)}
          {communityOffers.slice(0, 2).map((offer) => (
            <CommunityMarketplaceCard key={`land-food-service-${offer.id}`} offer={offer} mode="mixed" className="h-full" />
          ))}
          {!loading && !error && mappedServices.length === 0 ? (
            <article className="md:col-span-2 xl:col-span-3 rounded-xl border border-white/15 bg-black/25 p-6 text-center">
              <p className="text-base font-semibold text-white">No stewardship services match your filters</p>
              <p className="mt-1 text-sm text-gray-400">Try another keyword or open all categories.</p>
            </article>
          ) : null}
        </section>
      ) : null}

      <section className={`rounded-2xl border bg-[#10110f] p-4 md:p-5 ${slotTheme('landfood_project_spotlight').ring}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Project Spotlight • Premium Placement</h3>
          <button
            type="button"
            className="text-xs text-[#d4af37] hover:underline"
            onClick={() => void trackLandFoodEvent({ event: 'land_food_premium_click', metadata: { slot: 'landfood_project_spotlight' } })}
          >
            View
          </button>
        </div>
        <div className="mb-4 rounded-xl border border-[#d4af37]/25 bg-black/30 px-4 py-3 text-sm text-gray-200">
          Conservation Project Spotlight • boost funding visibility for stewardship outcomes.
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((item) => <ProjectCard key={`spot-${item.id}`} item={item} />)}
        </div>
      </section>

      <section className={`rounded-2xl border bg-[#10110f] p-4 md:p-5 ${slotTheme('landfood_institution_partner_strip').ring}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Institution Partner Strip • Premium Placement</h3>
          <button
            type="button"
            className="text-xs text-[#d4af37] hover:underline"
            onClick={() => void trackLandFoodEvent({ event: 'land_food_premium_click', metadata: { slot: 'landfood_institution_partner_strip' } })}
          >
            View
          </button>
        </div>
        <div className="mb-4 rounded-xl border border-[#d4af37]/25 bg-black/30 px-4 py-3 text-sm text-gray-200">
          Institution Partner Strip • preferred exposure for wholesale and institutional buyers.
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {['Schools', 'Hospitals', 'Food Banks', 'Museums', 'Universities', 'Government Buyers'].map((partner) => (
            <span key={partner} className="rounded-full border border-white/20 px-3 py-1 text-gray-200">{partner}</span>
          ))}
        </div>
      </section>

      <div className="flex justify-center">
        <Link href="/land-food" className="rounded-full border border-[#d4af37]/40 px-6 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
          Browse Full Land & Food Pillar
        </Link>
      </div>
    </div>
  );
}

