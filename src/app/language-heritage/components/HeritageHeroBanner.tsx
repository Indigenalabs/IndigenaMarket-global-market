'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { fetchLanguageHeritagePlacements } from '@/app/lib/languageHeritageApi';
import { buildPlacementCreativeMap, buildPlacementSummaryMap, formatPlacementPrice, type PlacementSummaryEntry } from '@/app/lib/pillarPlacementController';
import { getHeritagePremiumPlacement } from './premiumPlacements';

type Action = {
  href: string;
  label: string;
  tone?: 'primary' | 'secondary';
};

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  chips?: string[];
  actions?: Action[];
  placementId?: string;
};

export default function HeritageHeroBanner({
  eyebrow,
  title,
  description,
  image,
  chips = [],
  actions = [],
  placementId = 'heritage_featured_banner'
}: Props) {
  const [summaryMap, setSummaryMap] = useState<Record<string, PlacementSummaryEntry>>({});
  const [creativeMap, setCreativeMap] = useState<Record<string, { image: string; headline: string; subheadline: string; cta: string }>>({});

  useEffect(() => {
    let mounted = true;
    const loadPlacements = async () => {
      try {
        const payload = await fetchLanguageHeritagePlacements();
        if (!mounted) return;
        setSummaryMap(buildPlacementSummaryMap(payload.summary));
        setCreativeMap(buildPlacementCreativeMap(payload.placements));
      } catch {
        if (!mounted) return;
        setSummaryMap({});
        setCreativeMap({});
      }
    };
    void loadPlacements();
    return () => {
      mounted = false;
    };
  }, []);

  const placement = useMemo(() => getHeritagePremiumPlacement(placementId), [placementId]);
  const creative = creativeMap[placementId];
  const heroTitle = creative?.headline || title;
  const heroDescription = creative?.subheadline || description;
  const heroImage = creative?.image || image;
  const premiumPrice = placement ? formatPlacementPrice(placement.fallbackPrice, placement.id, summaryMap) : null;

  const backgroundStyle = heroImage
    ? {
        backgroundImage: `linear-gradient(120deg, rgba(8,8,8,0.9), rgba(8,8,8,0.82)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : undefined;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[#d4af37]/20 p-6 md:p-8"
      style={backgroundStyle}
    >
      {!image ? (
        <>
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#d4af37]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 h-64 w-64 rounded-full bg-[#b51d19]/10 blur-3xl" />
        </>
      ) : null}
      <div className="relative z-10 max-w-4xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#d4af37]">{eyebrow}</p>
        ) : null}
        <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-[#d4af37]/35 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#d4af37]">
          <Megaphone size={11} />
          Sponsored Feature
          {premiumPrice ? <span className="text-gray-200">• {premiumPrice}</span> : null}
        </div>
        <h2 className="text-2xl font-bold text-white md:text-3xl">{heroTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-300">{heroDescription}</p>
        {chips.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span key={chip} className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs text-gray-200">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
        {actions.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href + action.label}
                href={action.href}
                className={
                  action.tone === 'secondary'
                    ? 'rounded-full border border-[#d4af37]/40 px-5 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10'
                    : 'rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#e5c15b]'
                }
                >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
