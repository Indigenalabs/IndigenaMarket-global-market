'use client';

import Link from 'next/link';
import type { CommunityMarketplaceOffer } from '@/app/lib/communityMarketplace';

interface CommunityMarketplaceRailProps {
  offers: CommunityMarketplaceOffer[];
  title: string;
  subtitle: string;
  emptyLabel: string;
}

export default function CommunityMarketplaceRail({
  offers,
  title,
  subtitle,
  emptyLabel
}: CommunityMarketplaceRailProps) {
  return (
    <section className="mb-6 rounded-[28px] border border-[#d4af37]/16 bg-[linear-gradient(135deg,rgba(212,175,55,0.08),rgba(10,10,10,0.72))] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Community-owned marketplace</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-300">{subtitle}</p>
        </div>
        <Link href="/communities" className="rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:border-[#d4af37]/35">
          Explore community storefronts
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-5 text-sm text-white/68">
          {emptyLabel}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <article key={`${offer.communitySlug}-${offer.id}`} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]">
              <div className="relative h-44 overflow-hidden">
                <img src={offer.image} alt={offer.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.85))]" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em]">
                    <span className="rounded-full bg-black/50 px-2 py-1 text-[#f3ddb1]">{offer.pillarLabel}</span>
                    <span className="rounded-full bg-[#d4af37]/14 px-2 py-1 text-[#d4af37]">{offer.communityVerificationStatus}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{offer.title}</h3>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">{offer.communityName}</p>
                <p className="text-sm leading-7 text-gray-300">{offer.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-white/64">
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{offer.splitLabel}</span>
                  {offer.availabilityLabel ? <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{offer.availabilityLabel}</span> : null}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[#d4af37]">{offer.priceLabel}</p>
                    <p className="text-xs text-white/55">{offer.communityNation}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={offer.href} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white hover:border-[#d4af37]/35">
                      Community detail
                    </Link>
                    <Link href={offer.sourceHref || offer.href} className="rounded-full bg-[#d4af37] px-3 py-2 text-xs font-semibold text-black hover:bg-[#f4d370]">
                      {offer.ctaLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
