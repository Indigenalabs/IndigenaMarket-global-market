import Link from 'next/link';
import { getMarketplaceCardMerchandising } from '@/app/components/marketplace/marketplaceCardMerchandising';
import {
  products,
  suppliers,
  rentals,
  services,
  coopOrders,
  materialsToolsSummary,
  type MaterialProduct,
  type Supplier,
  type ToolRental,
  type SupplyService,
  type CoopOrder,
  type VerificationTier
} from '@/app/materials-tools/data/pillar10Data';

function tierClass(tier: VerificationTier) {
  if (tier === 'platinum') return 'border-[#d4af37]/60 bg-[#d4af37]/15 text-[#f5cd79]';
  if (tier === 'gold') return 'border-amber-400/40 bg-amber-500/10 text-amber-300';
  if (tier === 'silver') return 'border-sky-400/40 bg-sky-500/10 text-sky-200';
  return 'border-orange-400/40 bg-orange-500/10 text-orange-200';
}

export function MaterialCard({ item }: { item: MaterialProduct }) {
  const merch = getMarketplaceCardMerchandising({
    title: item.title,
    pillarLabel: 'Materials & Tools',
    image: item.image,
    coverImage: item.image,
    galleryOrder: [item.image],
    ctaMode: 'buy',
    ctaPreset: 'collect-now',
    availabilityLabel: item.stockLabel,
    availabilityTone: item.stockLabel.toLowerCase().includes('limited') ? 'warning' : 'success',
    featured: item.verificationTier === 'platinum' || item.verificationTier === 'gold',
    merchandisingRank: item.verificationTier === 'platinum' ? 3 : 10,
    status: 'Active',
    priceLabel: `${item.price} ${item.currency}`,
    blurb: item.summary,
  });
  return (
    <article className="overflow-hidden rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] transition-all hover:-translate-y-0.5 hover:border-[#d4af37]/35">
      <div className="relative">
        <img src={merch.image} alt={item.title} className="h-48 w-full object-cover" />
        <span className={`absolute left-3 top-3 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${tierClass(item.verificationTier)}`}>
          {item.verificationTier} verified
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-base font-semibold text-white">{item.title}</p>
          <p className="text-xs text-[#bdb0a0]">{item.supplierName} • {item.nation}</p>
        </div>
        <p className="text-sm leading-6 text-[#d5cab8]">{item.summary}</p>
        <div className="flex flex-wrap gap-1.5">
          {item.certifications.slice(0, 2).map((cert) => (
            <span key={cert} className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#ddd0be]">{cert}</span>
          ))}
        </div>
        <div className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-[#c7b7a3]">
          <div className="flex items-center justify-between"><span>Lead time</span><span className="text-white">{item.leadTime}</span></div>
          <div className="flex items-center justify-between"><span>Origin</span><span className="text-white">{item.traceability.originRegion}</span></div>
          <div className="flex items-center justify-between"><span>MOQ</span><span className="text-white">{item.moqLabel || 'Flexible'}</span></div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#1d6b74]/20 bg-[#1d6b74]/8 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-[#9fe5ea]">
          <span>{item.traceability.qrLabel}</span>
          <Link href={`/materials-tools/origin/${item.id}`} className="text-[#f4c766] hover:underline">Traceability</Link>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#f4c766]">${item.price} {item.currency}</span>
          <span className="text-[#85d0d5]">{merch.normalized.availabilityLabel}</span>
        </div>
        <Link href={`/materials-tools/product/${item.id}`} className="block rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 py-2 text-center text-sm font-medium text-[#f2cb7d] transition hover:bg-[#d4af37]/18">{merch.ctaLabel}</Link>
      </div>
    </article>
  );
}

export function SupplierCard({ item }: { item: Supplier }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] transition-all hover:-translate-y-0.5 hover:border-[#d4af37]/35">
      <img src={item.cover} alt={item.name} className="h-36 w-full object-cover" />
      <div className="p-4">
        <div className="-mt-10 flex items-center gap-3">
          <img src={item.avatar} alt={item.name} className="h-16 w-16 rounded-full border-2 border-[#100d09] object-cover" />
          <div>
            <p className="text-base font-semibold text-white">{item.name}</p>
            <p className="text-xs text-[#c5b7a6]">{item.region}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${tierClass(item.verificationTier)}`}>{item.verificationTier}</span>
          <span className="text-xs text-[#8ad3d9]">Fulfillment {item.fulfillmentScore}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#d4c8b8]">{item.bio}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.specialties.map((specialty) => (
            <span key={specialty} className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#ddd0be]">{specialty}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-[#c6b7a1]">
          <span>{item.responseTime}</span>
          <Link href={`/materials-tools/supplier/${item.id}`} className="text-[#f4c766] hover:underline">View Supplier</Link>
        </div>
      </div>
    </article>
  );
}

export function RentalCard({ item }: { item: ToolRental }) {
  const merch = getMarketplaceCardMerchandising({
    title: item.title,
    pillarLabel: 'Materials & Tools',
    image: item.image,
    coverImage: item.image,
    galleryOrder: [item.image],
    ctaMode: 'book',
    ctaPreset: 'book-now',
    availabilityLabel: item.availability,
    availabilityTone: 'success',
    featured: false,
    merchandisingRank: 10,
    status: 'Active',
    priceLabel: item.dailyRateLabel,
    blurb: item.summary,
  });
  return (
    <article className="overflow-hidden rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09]">
      <img src={merch.image} alt={item.title} className="h-40 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div>
          <p className="text-base font-semibold text-white">{item.title}</p>
          <p className="text-xs text-[#c5b7a6]">{item.hubName} • {item.location}</p>
        </div>
        <p className="text-sm leading-6 text-[#d4c8b8]">{item.summary}</p>
        <div className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-[#c7b7a3]">
          <div className="flex items-center justify-between"><span>Type</span><span className="text-white">{item.equipmentType}</span></div>
          <div className="flex items-center justify-between"><span>Availability</span><span className="text-white">{item.availability}</span></div>
          <div className="flex items-center justify-between"><span>Rate</span><span className="text-[#f4c766]">{item.dailyRateLabel}</span></div>
        </div>
        <div className="rounded-xl border border-[#1d6b74]/20 bg-[#1d6b74]/8 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-[#9fe5ea]">
          Orientation, deposit, and return protocols attach to each booking.
        </div>
        <Link href={`/materials-tools/rental/${item.id}`} className="block rounded-full border border-[#1d6b74]/35 bg-[#1d6b74]/12 py-2 text-center text-sm font-medium text-[#9fe5ea] transition hover:bg-[#1d6b74]/18">{merch.ctaLabel}</Link>
      </div>
    </article>
  );
}

export function ServiceCard({ item }: { item: SupplyService }) {
  const merch = getMarketplaceCardMerchandising({
    title: item.title,
    pillarLabel: 'Materials & Tools',
    image: item.image,
    coverImage: item.image,
    galleryOrder: [item.image],
    ctaMode: 'quote',
    ctaPreset: 'request-quote',
    availabilityLabel: item.rateLabel,
    availabilityTone: 'default',
    featured: false,
    merchandisingRank: 10,
    status: 'Active',
    priceLabel: item.rateLabel,
    blurb: item.summary,
  });
  return (
    <article className="overflow-hidden rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09]">
      <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div>
          <p className="text-base font-semibold text-white">{item.title}</p>
          <p className="text-xs text-[#c5b7a6]">{item.provider} • {item.nation}</p>
        </div>
        <p className="text-sm leading-6 text-[#d4c8b8]">{item.summary}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#f4c766]">{item.rateLabel}</span>
          <Link href={item.serviceType === 'repair' ? '/materials-tools/services/equipment-repair-maintenance' : item.serviceType === 'sourcing' ? '/materials-tools/services/material-sourcing-consultation' : item.serviceType === 'co-op' ? '/materials-tools/bulk-coop' : '/materials-tools/surplus-marketplace'} className="text-[#9fe5ea] hover:underline">{merch.ctaLabel}</Link>
        </div>
      </div>
    </article>
  );
}

export function CoopOrderCard({ item }: { item: CoopOrder }) {
  const percent = Math.min(100, Math.round((item.committedUnits / item.targetUnits) * 100));
  return (
    <article className="overflow-hidden rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09]">
      <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div>
          <p className="text-base font-semibold text-white">{item.title}</p>
          <p className="text-sm leading-6 text-[#d4c8b8]">{item.summary}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between text-xs text-[#c7b7a3]">
            <span>{item.committedUnits} committed</span>
            <span>{item.targetUnits} target</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#1d6b74]" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#f4c766]">Closes {item.closeDate}</span>
            <span className="text-[#9fe5ea]">{percent}% joined</span>
          </div>
        </div>
        <div className="rounded-xl border border-[#1d6b74]/20 bg-[#1d6b74]/8 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-[#9fe5ea]">
          Shared freight and pooled MOQ pressure relief.
        </div>
        <Link href={`/materials-tools/coop/${item.id}`} className="block rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 py-2 text-center text-sm font-medium text-[#f2cb7d] transition hover:bg-[#d4af37]/18">
          Join Co-op
        </Link>
      </div>
    </article>
  );
}

export function StatsStrip() {
  const summary = materialsToolsSummary();
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'Verified Suppliers', value: summary.suppliers.toString() },
        { label: 'Listings Ready', value: summary.products.toString() },
        { label: 'Tool Libraries', value: summary.rentals.toString() },
        { label: 'Avg Fulfillment Score', value: summary.avgFulfillment.toString() }
      ].map((item) => (
        <article key={item.label} className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[#bcae99]">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
        </article>
      ))}
    </section>
  );
}

export function SupplyChainBand() {
  const summary = materialsToolsSummary();
  return (
    <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5 md:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Supply Chain Sovereignty</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-[#bfae99]">Categories covered</p>
          <p className="mt-1 text-xl font-semibold text-white">{summary.categories}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-[#bfae99]">Service routes</p>
          <p className="mt-1 text-xl font-semibold text-white">{services.length}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs text-[#bfae99]">Live co-op runs</p>
          <p className="mt-1 text-xl font-semibold text-white">{coopOrders.length}</p>
        </article>
      </div>
    </section>
  );
}

export function FeaturedCollectionsBand() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">For makers</p>
        <p className="mt-2 text-lg font-semibold text-white">Source materials with protocol context and better supplier trust.</p>
      </article>
      <article className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">For communities</p>
        <p className="mt-2 text-lg font-semibold text-white">Sell stewarded raw materials and build closed-loop revenue inside the creative economy.</p>
      </article>
      <article className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">For co-ops</p>
        <p className="mt-2 text-lg font-semibold text-white">Pool purchases, reduce freight overhead, and unlock access to expensive tools.</p>
      </article>
    </section>
  );
}

export function SampleListings() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {products.slice(0, 4).map((item) => <MaterialCard key={item.id} item={item} />)}
    </section>
  );
}

export function SupplierShowcase() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {suppliers.map((item) => <SupplierCard key={item.id} item={item} />)}
    </section>
  );
}

export function ToolLibraryShowcase() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {rentals.map((item) => <RentalCard key={item.id} item={item} />)}
    </section>
  );
}

export function ServiceShowcase() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {services.map((item) => <ServiceCard key={item.id} item={item} />)}
    </section>
  );
}

export function CoopShowcase() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {coopOrders.map((item) => <CoopOrderCard key={item.id} item={item} />)}
    </section>
  );
}

