'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MaterialsToolsHero from '@/app/materials-tools/components/MaterialsToolsHero';
import {
  MaterialCard,
  SupplierCard,
  RentalCard,
  ServiceCard,
  CoopOrderCard,
  StatsStrip,
  SupplyChainBand
} from '@/app/materials-tools/components/MaterialsToolsCards';
import { MATERIALS_TOOLS_PLACEMENTS } from '@/app/materials-tools/components/premiumPlacements';
import {
  categoryMeta,
  products,
  suppliers,
  type MaterialsToolsCategoryId,
  type MaterialProduct,
  type Supplier,
  type ToolRental,
  type SupplyService,
  type CoopOrder
} from '@/app/materials-tools/data/pillar10Data';
import {
  fetchMaterialsToolsCoopOrders,
  fetchMaterialsToolsListings,
  fetchMaterialsToolsRentals,
  fetchMaterialsToolsServices,
  fetchMaterialsToolsSuppliers
} from '@/app/lib/materialsToolsApi';
import CommunityMarketplaceCard from '@/app/components/community/CommunityMarketplaceCard';
import { fetchCommunityMarketplaceOffers, type CommunityMarketplaceOffer } from '@/app/lib/communityMarketplaceApi';

const categoryOptions = Object.entries(categoryMeta).map(([id, meta]) => ({ id: id as MaterialsToolsCategoryId, label: meta.label }));

type Mode = 'materials' | 'suppliers' | 'rentals' | 'services' | 'co-op';

export default function MaterialsToolsMarketplace() {
  const [mode, setMode] = useState<Mode>('materials');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | MaterialsToolsCategoryId>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [materialResults, setMaterialResults] = useState<MaterialProduct[]>(products);
  const [supplierResults, setSupplierResults] = useState<Supplier[]>(suppliers);
  const [rentalResults, setRentalResults] = useState<ToolRental[]>([]);
  const [serviceResults, setServiceResults] = useState<SupplyService[]>([]);
  const [coopResults, setCoopResults] = useState<CoopOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'api' | 'mock'>('mock');
  const [error, setError] = useState<string | null>(null);
  const [communityOffers, setCommunityOffers] = useState<CommunityMarketplaceOffer[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (mode === 'materials') {
          const page = await fetchMaterialsToolsListings({ q: query, category, verifiedOnly, page: 1, limit: 18 });
          if (!mounted) return;
          setMaterialResults(page.items);
          setSource(page.source);
        } else if (mode === 'suppliers') {
          const page = await fetchMaterialsToolsSuppliers(query, 1, 18);
          if (!mounted) return;
          setSupplierResults(page.items);
          setSource(page.source);
        } else if (mode === 'rentals') {
          const page = await fetchMaterialsToolsRentals(query, 1, 18);
          if (!mounted) return;
          setRentalResults(page.items);
          setSource(page.source);
        } else if (mode === 'services') {
          const page = await fetchMaterialsToolsServices(query, 1, 18);
          if (!mounted) return;
          setServiceResults(page.items);
          setSource(page.source);
        } else {
          const page = await fetchMaterialsToolsCoopOrders(query, 1, 18);
          if (!mounted) return;
          setCoopResults(page.items);
          setSource(page.source);
        }
      } catch (e) {
        if (!mounted) return;
        setError((e as Error).message || 'Failed to load Materials & Tools data.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [mode, query, category, verifiedOnly]);

  useEffect(() => {
    let cancelled = false;
    fetchCommunityMarketplaceOffers({ pillar: 'materials-tools', search: query || undefined })
      .then((offers) => {
        if (!cancelled) setCommunityOffers(offers.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setCommunityOffers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
        <h1 className="text-3xl font-bold text-white">Materials & Tools Marketplace</h1>
        <p className="mt-2 text-[#cdbfae]">Source the raw inputs, trusted tools, rentals, and group buying power creators need to keep making.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#f0d7aa]">
          <span className="rounded-full border border-[#d4af37]/30 px-2 py-1">Traceable origins</span>
          <span className="rounded-full border border-[#1d6b74]/35 px-2 py-1 text-[#9fe5ea]">Tool library access</span>
          <span className="rounded-full border border-white/10 px-2 py-1 text-[#ddd0be]">Supplier-first trust</span>
          <span className="rounded-full border border-white/10 px-2 py-1 text-[#ddd0be]">Source: {source === 'api' ? 'Live API' : 'Mock fallback'}</span>
        </div>
      </section>

      <section className="sticky top-0 z-30 rounded-full border border-[#9b6b2b]/35 bg-gradient-to-r from-[#1c130b] via-[#101010] to-[#0d1a1c] px-4 py-2 text-sm text-[#f2dfbf]">
        Premium sticky banner: suppliers can feature new studio bundles, rental windows, and co-op deadlines here.
      </section>

      <MaterialsToolsHero
        eyebrow="Pillar 10"
        title={MATERIALS_TOOLS_PLACEMENTS[1].headline}
        description={MATERIALS_TOOLS_PLACEMENTS[1].copy}
        image={MATERIALS_TOOLS_PLACEMENTS[1].image}
        chips={['Materials', 'Tools', 'Equipment', 'Bulk supply']}
        premiumLabel="Premium Hero Banner"
        actions={[
          { href: '/materials-tools', label: 'Open Pillar Home' },
          { href: '/materials-tools/suppliers', label: 'Supplier Directory', tone: 'secondary' }
        ]}
      />

      <StatsStrip />
      <SupplyChainBand />

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <div className="grid gap-3 md:grid-cols-[1fr,240px,160px]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search listings, suppliers, rentals, co-ops" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/45" />
          <select value={category} onChange={(e) => setCategory(e.target.value as 'all' | MaterialsToolsCategoryId)} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
            <option value="all">All categories</option>
            {categoryOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#ddd0be]">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="accent-[#d4af37]" />
            Verified only
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            ['materials', 'Materials'],
            ['suppliers', 'Suppliers'],
            ['rentals', 'Tool Libraries'],
            ['services', 'Services'],
            ['co-op', 'Bulk Co-op']
          ] as Array<[Mode, string]>).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setMode(id)} className={`rounded-full border px-3 py-1.5 text-xs transition ${mode === id ? 'border-[#d4af37]/55 bg-[#d4af37]/12 text-[#f2cb7d]' : 'border-white/15 text-[#d8cab9] hover:border-[#9b6b2b]/45'}`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div> : null}
      {loading ? <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#ddd0be]">Loading marketplace data...</div> : null}

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Supplier spotlight</h3>
          <Link href="/materials-tools/suppliers" className="text-xs text-[#9fe5ea] hover:underline">View all suppliers</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {supplierResults.slice(0, 4).map((item) => <SupplierCard key={item.id} item={item} />)}
        </div>
      </section>

      {mode === 'materials' ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {materialResults.slice(0, 3).map((item) => <MaterialCard key={item.id} item={item} />)}
          {communityOffers.slice(0, 1).map((offer) => <CommunityMarketplaceCard key={`materials-${offer.id}`} offer={offer} mode="mixed" className="h-full" />)}
          {materialResults.slice(3).map((item) => <MaterialCard key={item.id} item={item} />)}
          {communityOffers.slice(1, 2).map((offer) => <CommunityMarketplaceCard key={`materials-tail-${offer.id}`} offer={offer} mode="mixed" className="h-full" />)}
        </section>
      ) : null}

      {mode === 'suppliers' ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{supplierResults.map((item) => <SupplierCard key={item.id} item={item} />)}</section> : null}
      {mode === 'rentals' ? <section className="grid gap-4 md:grid-cols-3">{rentalResults.map((item) => <RentalCard key={item.id} item={item} />)}</section> : null}
      {mode === 'services' ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{serviceResults.map((item) => <ServiceCard key={item.id} item={item} />)}{communityOffers.slice(0, 2).map((offer) => <CommunityMarketplaceCard key={`services-${offer.id}`} offer={offer} mode="mixed" className="h-full" />)}</section> : null}
      {mode === 'co-op' ? <section className="grid gap-4 md:grid-cols-3">{coopResults.map((item) => <CoopOrderCard key={item.id} item={item} />)}{communityOffers.slice(0, 1).map((offer) => <CommunityMarketplaceCard key={`coop-${offer.id}`} offer={offer} mode="mixed" className="h-full" />)}</section> : null}

    </div>
  );
}
