'use client';

import Link from 'next/link';
import CommunityMarketplaceCard from '@/app/components/community/CommunityMarketplaceCard';
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
            <CommunityMarketplaceCard key={`${offer.communitySlug}-${offer.id}`} offer={offer} />
          ))}
        </div>
      )}
    </section>
  );
}
