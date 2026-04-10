'use client';

import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Landmark, Network } from 'lucide-react';
import type { CommunityMarketplaceOffer } from '@/app/lib/communityMarketplace';

interface CommunityMarketplaceCardProps {
  offer: CommunityMarketplaceOffer;
  mode?: 'rail' | 'mixed';
  className?: string;
}

function verificationLabel(status: string) {
  return status === 'approved' ? 'Verified community' : status.replace(/-/g, ' ');
}

export default function CommunityMarketplaceCard({
  offer,
  mode = 'rail',
  className = ''
}: CommunityMarketplaceCardProps) {
  const compact = mode === 'mixed';
  const verified = offer.communityVerificationStatus === 'approved';

  return (
    <article
      className={`overflow-hidden rounded-[24px] border border-[#d4af37]/18 bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(8,8,8,0.98))] shadow-[0_18px_40px_rgba(0,0,0,0.22)] ${className}`.trim()}
    >
      <div className={`relative overflow-hidden ${compact ? 'h-36' : 'h-44'}`}>
        <img src={offer.image} alt={offer.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.9))]" />
        <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em]">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/30 bg-black/45 px-2.5 py-1 text-[#f3ddb1]">
            <Network size={12} />
            Community-owned
          </span>
          {compact ? (
            <span className="rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-white/82">Marketplace spotlight</span>
          ) : null}
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/82">{offer.pillarLabel}</span>
          {verified ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/12 px-2.5 py-1 text-emerald-200">
              <CheckCircle2 size={12} />
              {verificationLabel(offer.communityVerificationStatus)}
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-white/68">
              {verificationLabel(offer.communityVerificationStatus)}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af37]">{offer.communityName}</p>
          <h3 className={`${compact ? 'mt-2 text-base' : 'mt-3 text-lg'} font-semibold text-white`}>{offer.title}</h3>
          <p className="mt-1 text-xs text-white/62">{offer.communityNation}</p>
        </div>
      </div>

      <div className={`space-y-3 ${compact ? 'p-4' : 'p-5'}`}>
        <p className={`leading-7 text-gray-300 ${compact ? 'text-sm' : 'text-sm'}`}>{offer.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/18 bg-[#d4af37]/10 px-2.5 py-1 text-[#f3ddb1]">
            <Landmark size={12} />
            {offer.splitLabel}
          </span>
          {offer.availabilityLabel ? (
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{offer.availabilityLabel}</span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[#d4af37]">{offer.priceLabel}</p>
            <p className="text-xs text-white/55">{compact ? 'Marketplace spotlight' : 'Routes through community treasury logic'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={offer.href}
              className="rounded-full border border-white/10 px-3 py-2 text-xs text-white transition-colors hover:border-[#d4af37]/35"
            >
              Community detail
            </Link>
            <Link
              href={offer.sourceHref || offer.href}
              className="inline-flex items-center gap-1 rounded-full bg-[#d4af37] px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-[#f4d370]"
            >
              {offer.ctaLabel}
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
