'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Settings2, Store } from 'lucide-react';

export function StorefrontHeroFrame({
  cover,
  coverAlt,
  badgeLabel,
  manageHref = '/creator-hub',
  manageLabel = 'Creator view',
  identity,
  actions,
  mainContent,
  sideContent,
  quickStrip
}: {
  cover: string;
  coverAlt: string;
  badgeLabel: string;
  manageHref?: string;
  manageLabel?: string;
  identity: ReactNode;
  actions: ReactNode;
  mainContent: ReactNode;
  sideContent: ReactNode;
  quickStrip?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[#d4af37]/15 bg-[#101010] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_58%)]" />
      <div className="pointer-events-none absolute right-0 top-[140px] h-48 w-48 rounded-full bg-[#d4af37]/8 blur-3xl" />
      <div className="relative h-[190px] md:h-[240px]">
        <img src={cover} alt={coverAlt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(10,10,10,0.5)_42%,rgba(10,10,10,0.98)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.38),transparent_45%,rgba(0,0,0,0.28))]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-black/50 px-3 py-1 text-xs text-[#f3d780] backdrop-blur">
            <Store size={12} />
            {badgeLabel}
          </div>
          <Link
            href={manageHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white hover:border-[#d4af37]/40 hover:text-[#f3d780]"
          >
            <Settings2 size={12} />
            {manageLabel}
          </Link>
        </div>
      </div>

      <div className="relative px-4 pb-5 md:px-6">
        <div className="-mt-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {identity}
          {actions}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
          <div>{mainContent}</div>
          <div>{sideContent}</div>
        </div>

        {quickStrip ? <div className="mt-4">{quickStrip}</div> : null}
      </div>
    </section>
  );
}

export function StorefrontTabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange
}: {
  tabs: Array<{ id: T; label: string }>;
  activeTab: T;
  onTabChange: (tab: T) => void;
}) {
  return (
    <section className="sticky top-3 z-20 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,16,16,0.96),rgba(10,10,10,0.92))] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur md:p-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[#d4af37] text-black shadow-[0_10px_24px_rgba(212,175,55,0.22)]'
                : 'border border-white/10 bg-black/25 text-gray-300 hover:border-[#d4af37]/35 hover:bg-[#d4af37]/8 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  );
}
