'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';

type PlacementTone = 'gold' | 'rose' | 'neutral';

const toneClasses: Record<PlacementTone, string> = {
  gold: 'border-[#d4af37]/30 bg-[#0b0b0b]/75 text-[#f3d57c]',
  rose: 'border-rose-400/30 bg-[#0b0b0b]/75 text-rose-200',
  neutral: 'border-white/10 bg-black/55 text-gray-300'
};

export const placementMetaPillClass =
  'rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-2.5 py-1 text-[11px] font-medium text-[#d4af37]/80';

export const placementContextPillClass =
  'rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-400';

export const placementPrimaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8941f] px-4 py-2 font-medium text-black transition-all hover:shadow-lg hover:shadow-[#d4af37]/30';

export const placementSecondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 font-medium text-[#d4af37] transition-all hover:bg-[#d4af37] hover:text-black';

export const placementSurfaceCardClass = 'rounded-[22px] border border-white/10 bg-black/20 p-4';

export const placementHighlightedSurfaceCardClass = 'rounded-[22px] border border-[#d4af37]/20 bg-[#d4af37]/10 p-4';

export const placementStatusPillClass = 'rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-gray-300';

export const placementPricePillClass = 'rounded-full bg-[#d4af37] px-3 py-1 text-xs font-semibold text-black';

export function PlacementPill({
  children,
  icon: Icon,
  tone = 'gold',
  className = ''
}: {
  children: ReactNode;
  icon?: LucideIcon;
  tone?: PlacementTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm ${toneClasses[tone]} ${className}`.trim()}
    >
      {Icon ? <Icon size={10} /> : null}
      {children}
    </span>
  );
}

export function PlacementSponsorRow({
  sponsor,
  label = 'Sponsored by',
  right
}: {
  sponsor: string;
  label?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/8 px-2.5 py-1 text-[11px] text-[#d4af37]/80">
        {label} {sponsor}
      </span>
      {right}
    </div>
  );
}

export function PlacementSectionHeader({
  icon: Icon,
  title,
  description,
  meta,
  href,
  hrefLabel,
  right
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  meta?: string;
  href?: string;
  hrefLabel?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#d4af37] to-[#b8941f]">
          <Icon size={16} className="text-black" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {description ? <p className="text-xs text-gray-400">{description}</p> : null}
        </div>
        {meta ? <span className={placementMetaPillClass}>{meta}</span> : null}
      </div>
      <div className="flex items-center gap-3">
        {right}
        {href && hrefLabel ? (
          <Link href={href} className="text-sm text-[#d4af37] transition-colors hover:text-[#f4e4a6]">
            {hrefLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
