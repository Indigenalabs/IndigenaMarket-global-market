import Link from 'next/link';
import { getMarketplaceCardMerchandising } from '@/app/components/marketplace/marketplaceCardMerchandising';
import {
  products,
  producers,
  projects,
  services,
  regenerativeEconomySummary,
  type LandFoodProduct,
  type Producer,
  type ConservationProject,
  type StewardshipService
} from '@/app/land-food/data/pillar8Data';

function tierClass(tier: Producer['verificationTier']) {
  if (tier === 'platinum') return 'border-[#d4af37]/60 bg-[#d4af37]/15 text-[#d4af37]';
  if (tier === 'gold') return 'border-amber-400/40 bg-amber-500/10 text-amber-300';
  if (tier === 'silver') return 'border-slate-300/40 bg-slate-500/10 text-slate-200';
  return 'border-orange-400/40 bg-orange-500/10 text-orange-200';
}

export function ProductCard({ item }: { item: LandFoodProduct }) {
  const merch = getMarketplaceCardMerchandising({
    title: item.title,
    pillarLabel: 'Land & Food',
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
    <article className="overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#10110f] transition-all hover:-translate-y-0.5 hover:border-[#d4af37]/40">
      <div className="relative">
        <img src={merch.image} alt={item.title} className="h-44 w-full object-cover" />
        <span className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${tierClass(item.verificationTier)}`}>
          {item.verificationTier} verified
        </span>
        {merch.launchBadge ? <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-medium text-white">{merch.launchBadge}</span> : null}
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-white">{item.title}</p>
        <p className="text-xs text-gray-400">{item.producerName} • {item.nation}</p>
        <p className="mt-2 text-xs text-gray-300">{item.summary}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {item.certifications.slice(0, 2).map((c) => (
            <span key={c} className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-gray-300">{c}</span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[#d4af37]">${item.price} {item.currency}</span>
          <span className="text-gray-400">{merch.normalized.availabilityLabel}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-emerald-300">Stewardship Share: {item.stewardshipSharePercent}%</span>
          <span className="text-gray-500">{item.traceability.qrCodeLabel}</span>
        </div>
        <Link href={`/land-food/product/${item.id}`} className="mt-3 block rounded-lg border border-[#d4af37]/35 bg-[#d4af37]/10 py-2 text-center text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20">{merch.ctaLabel}</Link>
      </div>
    </article>
  );
}

export function ProducerCard({ item }: { item: Producer }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#10110f] transition-all hover:-translate-y-0.5 hover:border-[#d4af37]/40">
      <img src={item.cover} alt={item.name} className="h-32 w-full object-cover" />
      <div className="p-4">
        <div className="-mt-9 flex items-center gap-3">
          <img src={item.avatar} alt={item.name} className="h-14 w-14 rounded-full border-2 border-[#10110f] object-cover" />
          <div>
            <p className="text-sm font-semibold text-white">{item.name}</p>
            <p className="text-xs text-gray-400">{item.region}</p>
          </div>
        </div>
        <div className="mt-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${tierClass(item.verificationTier)}`}>{item.verificationTier} tier</span>
        </div>
        <p className="mt-2 text-xs text-gray-300">{item.bio}</p>
        <p className="mt-2 text-xs text-emerald-300">Yearly stewardship revenue: ${item.yearlyStewardshipRevenue.toLocaleString()}</p>
        <Link href={`/land-food/producer/${item.id}`} className="mt-3 block rounded-lg border border-[#d4af37]/35 bg-[#d4af37]/10 py-2 text-center text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20">View Producer</Link>
      </div>
    </article>
  );
}

export function ProjectCard({ item }: { item: ConservationProject }) {
  const merch = getMarketplaceCardMerchandising({
    title: item.title,
    pillarLabel: 'Land & Food',
    image: item.image,
    coverImage: item.image,
    galleryOrder: [item.image],
    ctaMode: 'message',
    ctaPreset: 'message-first',
    availabilityLabel: `${item.progressPercent}% funded`,
    availabilityTone: item.progressPercent >= 75 ? 'success' : 'warning',
    featured: item.progressPercent >= 80,
    merchandisingRank: item.progressPercent >= 80 ? 4 : 12,
    status: 'Active',
    priceLabel: `${item.fundingRaisedUsd.toLocaleString()}`,
    blurb: item.location,
  });
  return (
    <article className="overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#10110f]">
      <img src={merch.image} alt={item.title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <p className="text-sm font-semibold text-white">{item.title}</p>
        <p className="text-xs text-gray-400">{item.location} • {item.nation}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-white/10 bg-black/25 p-2"><p className="text-gray-400">Credits</p><p className="text-white">{item.carbonCredits}</p></div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-2"><p className="text-gray-400">Bio</p><p className="text-white">{item.biodiversityScore}</p></div>
          <div className="rounded-lg border border-white/10 bg-black/25 p-2"><p className="text-gray-400">Progress</p><p className="text-white">{item.progressPercent}%</p></div>
        </div>
        <p className="mt-2 text-xs text-emerald-300">Raised ${item.fundingRaisedUsd.toLocaleString()} / ${item.fundingTargetUsd.toLocaleString()}</p>
        <Link href={`/land-food/project/${item.id}`} className="mt-3 block rounded-lg border border-[#d4af37]/35 bg-[#d4af37]/10 py-2 text-center text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20">{merch.ctaLabel}</Link>
      </div>
    </article>
  );
}

export function ServiceCard({ item }: { item: StewardshipService }) {
  const merch = getMarketplaceCardMerchandising({
    title: item.title,
    pillarLabel: 'Land & Food',
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
    <article className="overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#10110f]">
      <img src={merch.image} alt={item.title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <p className="text-sm font-semibold text-white">{item.title}</p>
        <p className="text-xs text-gray-400">{item.provider} • {item.nation}</p>
        <p className="mt-2 text-xs text-gray-300">{item.summary}</p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[#d4af37]">{item.rateLabel}</span>
          <Link href={`/land-food/service/${item.id}`} className="text-[#d4af37] hover:underline">{merch.ctaLabel}</Link>
        </div>
      </div>
    </article>
  );
}

export function StatsStrip() {
  const summary = regenerativeEconomySummary();
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'Verified Producers', value: summary.verifiedProducers.toString() },
        { label: 'Marketplace Products', value: products.length.toString() },
        { label: 'Stewardship Avg Share', value: `${summary.stewardshipAvg}%` },
        { label: 'Carbon Credits Listed', value: summary.totalCredits.toLocaleString() }
      ].map((x) => (
        <article key={x.label} className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">{x.label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{x.value}</p>
        </article>
      ))}
    </section>
  );
}

export function RegenerativeImpactBand() {
  const summary = regenerativeEconomySummary();
  return (
    <section className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Regenerative Economy Impact</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs text-gray-400">Projected Community Flow per Basket</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">${summary.projectedCommunityFlow.toLocaleString()}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs text-gray-400">Average Stewardship Share</p>
          <p className="mt-1 text-xl font-semibold text-white">{summary.stewardshipAvg}%</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs text-gray-400">Active Stewardship Services</p>
          <p className="mt-1 text-xl font-semibold text-white">{services.length}</p>
        </article>
      </div>
    </section>
  );
}
