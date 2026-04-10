'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, CheckCircle2, Network } from 'lucide-react';
import CommunityMarketplaceRail from '@/app/components/community/CommunityMarketplaceRail';
import { fetchCommunityMarketplaceOffers } from '@/app/lib/communityMarketplaceApi';
import type { CommunityMarketplaceOffer } from '@/app/lib/communityMarketplace';

interface CommunityMarketplaceExplorerProps {
  pillar?: string;
  title: string;
  subtitle: string;
  emptyLabel: string;
}

export default function CommunityMarketplaceExplorer({
  pillar,
  title,
  subtitle,
  emptyLabel
}: CommunityMarketplaceExplorerProps) {
  const [offers, setOffers] = useState<CommunityMarketplaceOffer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedSplitRule, setSelectedSplitRule] = useState('all');

  useEffect(() => {
    let active = true;
    fetchCommunityMarketplaceOffers({ pillar })
      .then((data) => {
        if (active) setOffers(data);
      })
      .catch(() => {
        if (active) setOffers([]);
      });
    return () => {
      active = false;
    };
  }, [pillar]);

  const splitRuleOptions = useMemo(() => {
    return Array.from(
      new Map(
        offers
          .filter((offer) => offer.splitRuleId || offer.splitLabel)
          .map((offer) => [offer.splitRuleId || offer.splitLabel, offer.splitLabel || 'Unrouted'])
      ).entries()
    ).map(([value, label]) => ({ value, label }));
  }, [offers]);

  const filteredOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return offers.filter((offer) => {
      if (verifiedOnly && offer.communityVerificationStatus !== 'approved') return false;
      if (selectedSplitRule !== 'all' && (offer.splitRuleId || offer.splitLabel) !== selectedSplitRule) return false;
      if (!q) return true;
      return [
        offer.title,
        offer.description,
        offer.communityName,
        offer.communityNation,
        offer.pillarLabel,
        offer.splitLabel,
        offer.ownerProfileSlug || ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [offers, searchQuery, selectedSplitRule, verifiedOnly]);

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-[#d4af37]/16 bg-[#101010] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Marketplace facets</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Search community-owned listings by trust and treasury routing</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-300">
              Community-owned is the active storefront mode here. Narrow by verified communities, search terms, and the split rule routing the listing is attached to.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-[#f3ddb1]">
              <Network size={13} />
              Community-owned
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-gray-300">
              {filteredOffers.length} matching listings
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr,0.8fr,0.7fr]">
          <label className="relative block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search title, nation, community, or owner"
              className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 focus:border-[#d4af37]/45 focus:outline-none"
            />
          </label>

          <select
            value={selectedSplitRule}
            onChange={(event) => setSelectedSplitRule(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white focus:border-[#d4af37]/45 focus:outline-none"
          >
            <option value="all">All split rules</option>
            {splitRuleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setVerifiedOnly((current) => !current)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
              verifiedOnly
                ? 'border-[#d4af37]/40 bg-[#d4af37]/12 text-[#f3ddb1]'
                : 'border-white/10 bg-black/20 text-gray-300 hover:border-[#d4af37]/25 hover:text-white'
            }`}
          >
            <CheckCircle2 size={15} />
            Verified community only
          </button>
        </div>
      </div>

      <CommunityMarketplaceRail
        offers={filteredOffers}
        title={title}
        subtitle={subtitle}
        emptyLabel={emptyLabel}
      />
    </section>
  );
}
