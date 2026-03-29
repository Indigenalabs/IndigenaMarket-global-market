'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { type MarketingPlacementScope } from '@/app/profile/data/marketingInventory';
import { PLACEMENT_FEED_CONFIG, type ServeablePlacementScope } from '@/app/lib/marketingPlacementFeeds';
import {
  PlacementPill,
  placementContextPillClass,
  placementPrimaryButtonClass,
  placementStatusPillClass,
  placementSurfaceCardClass
} from '@/app/components/placements/PremiumPlacement';

type LivePlacementEntry = {
  id: string;
  title: string;
  cta_url?: string;
  creative?: {
    headline?: string;
    subheadline?: string;
    cta?: string;
    image?: string;
  };
};

type PlacementFeedResponse = {
  placements?: Record<string, LivePlacementEntry[]>;
};

const scopeThemes: Record<MarketingPlacementScope, { border: string; glow: string; surface: string }> = {
  homepage: { border: 'border-[#d4af37]/25', glow: 'from-[#d4af37]/16 via-transparent to-transparent', surface: 'from-[#17120a] via-[#111111] to-[#16120c]' },
  trending: { border: 'border-[#B51D19]/25', glow: 'from-[#B51D19]/16 via-transparent to-transparent', surface: 'from-[#181010] via-[#111111] to-[#16110f]' },
  community: { border: 'border-emerald-500/25', glow: 'from-emerald-500/16 via-transparent to-transparent', surface: 'from-[#0f1711] via-[#101010] to-[#111612]' },
  'digital-arts': { border: 'border-[#d4af37]/25', glow: 'from-[#dc143c]/14 via-transparent to-transparent', surface: 'from-[#161012] via-[#0f0f10] to-[#17120c]' },
  'physical-items': { border: 'border-[#d4af37]/25', glow: 'from-[#d4af37]/14 via-transparent to-transparent', surface: 'from-[#17120d] via-[#101010] to-[#151311]' },
  courses: { border: 'border-sky-400/20', glow: 'from-sky-400/14 via-transparent to-transparent', surface: 'from-[#0d1518] via-[#101010] to-[#101417]' },
  freelancing: { border: 'border-[#d4af37]/25', glow: 'from-violet-400/12 via-transparent to-transparent', surface: 'from-[#131117] via-[#101010] to-[#141315]' },
  'cultural-tourism': { border: 'border-[#d4af37]/25', glow: 'from-[#b51d19]/14 via-transparent to-transparent', surface: 'from-[#17120f] via-[#101010] to-[#18110f]' },
  'language-heritage': { border: 'border-[#d4af37]/25', glow: 'from-emerald-500/12 via-transparent to-transparent', surface: 'from-[#111711] via-[#101010] to-[#17130d]' },
  'land-food': { border: 'border-emerald-500/25', glow: 'from-emerald-500/12 via-transparent to-transparent', surface: 'from-[#101612] via-[#101010] to-[#15160e]' },
  'advocacy-legal': { border: 'border-[#d4af37]/25', glow: 'from-[#B51D19]/14 via-transparent to-transparent', surface: 'from-[#171011] via-[#101010] to-[#17130d]' },
  'materials-tools': { border: 'border-[#d4af37]/25', glow: 'from-amber-500/12 via-transparent to-transparent', surface: 'from-[#17140f] via-[#101010] to-[#15120e]' }
};

function isServeableScope(scope: Exclude<MarketingPlacementScope, 'homepage' | 'trending' | 'community'>): scope is ServeablePlacementScope {
  return scope in PLACEMENT_FEED_CONFIG;
}

export default function PillarPremiumHero({
  scope,
  eyebrow,
  ctaHref
}: {
  scope: Exclude<MarketingPlacementScope, 'homepage' | 'trending' | 'community'>;
  eyebrow: string;
  ctaHref: string;
}) {
  const theme = scopeThemes[scope];
  const [liveFeed, setLiveFeed] = useState<PlacementFeedResponse | null>(null);

  useEffect(() => {
    if (!isServeableScope(scope)) return;
    let cancelled = false;
    fetch(PLACEMENT_FEED_CONFIG[scope].apiPath, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: PlacementFeedResponse | null) => {
        if (!cancelled && json?.placements) setLiveFeed(json);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const liveHero = useMemo(() => {
    if (!isServeableScope(scope)) return null;
    return liveFeed?.placements?.[PLACEMENT_FEED_CONFIG[scope].heroKey]?.[0] ?? null;
  }, [liveFeed, scope]);

  const liveSupport = useMemo(() => {
    if (!isServeableScope(scope)) return [];
    return PLACEMENT_FEED_CONFIG[scope].supportKeys.flatMap((key) => liveFeed?.placements?.[key] ?? []).slice(0, 3);
  }, [liveFeed, scope]);

  const heroPlacement = liveHero
    ? {
        title: liveHero.creative?.headline || liveHero.title,
        summary: liveHero.creative?.subheadline || 'Featured placement now serving across this pillar.',
        priceLabel: 'Live campaign',
        inventory: 'Serving now',
        bestFor: 'Premium inventory live',
        ctaHref: liveHero.cta_url || ctaHref,
        ctaLabel: liveHero.creative?.cta || 'View offer'
      }
    : null;

  const supportPlacements = liveSupport.map((placement) => ({
    id: placement.id,
    title: placement.creative?.headline || placement.title,
    summary: placement.creative?.subheadline || 'Serving now in this pillar.',
    priceLabel: 'Live campaign',
    inventory: 'Active'
  }));

  if (!heroPlacement) return null;

  return (
    <section className={`relative overflow-hidden rounded-[28px] border ${theme.border} bg-gradient-to-br ${theme.surface} p-5 md:p-6`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${theme.glow}`} />
      <div className="relative z-10 grid gap-5 xl:grid-cols-[1.15fr,0.85fr] xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">{eyebrow}</p>
          <div className="mt-3">
            <PlacementPill>Placement inventory live</PlacementPill>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">{heroPlacement.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">{heroPlacement.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-200">
            <span className={placementContextPillClass}>{heroPlacement.priceLabel}</span>
            <span className={placementStatusPillClass}>{heroPlacement.inventory}</span>
            <span className={placementStatusPillClass}>{heroPlacement.bestFor}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={heroPlacement.ctaHref} className={`${placementPrimaryButtonClass} rounded-full text-sm`}>
              {heroPlacement.ctaLabel}
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {supportPlacements.map((placement) => (
            <article key={placement.id} className={placementSurfaceCardClass}>
              <p className="text-sm font-medium text-white">{placement.title}</p>
              <p className="mt-2 text-xs leading-6 text-gray-400">{placement.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-300">
                <span className={placementStatusPillClass}>{placement.priceLabel}</span>
                <span className={placementStatusPillClass}>{placement.inventory}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
