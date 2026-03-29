'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export interface StorefrontOfferBadge {
  id: string;
  label: string;
  className: string;
}

export default function StorefrontOfferCard({
  href,
  image,
  title,
  typeLabel,
  pillarLabel,
  pillarIcon,
  priceLabel,
  ctaLabel,
  blurb,
  metadata = [],
  badges = [],
  actionHint,
  onClick
}: {
  href: string;
  image: string;
  title: string;
  typeLabel: string;
  pillarLabel: string;
  pillarIcon?: ReactNode;
  priceLabel: string;
  ctaLabel: string;
  blurb: string;
  metadata?: string[];
  badges?: StorefrontOfferBadge[];
  actionHint?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.18))] transition-all hover:-translate-y-1 hover:border-[#d4af37]/35 hover:shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
    >
      <div className="relative h-56 overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.75))]" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs text-white backdrop-blur">
          {pillarIcon ? <span className="inline-flex items-center">{pillarIcon}</span> : null}
          {pillarLabel}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xl font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-[#ebe4d7]">{typeLabel}</p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span key={badge.id} className={badge.className}>
              {badge.label}
            </span>
          ))}
        </div>
        <p className="text-sm leading-6 text-gray-300">{blurb}</p>
        <div className="flex flex-wrap gap-2">
          {metadata.map((meta) => (
            <span key={meta} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-gray-300">
              {meta}
            </span>
          ))}
        </div>
        {actionHint ? <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af37]">{actionHint}</p> : null}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-lg font-semibold text-[#d4af37]">{priceLabel}</span>
          <span className="text-sm text-white">{ctaLabel}</span>
        </div>
      </div>
    </Link>
  );
}
