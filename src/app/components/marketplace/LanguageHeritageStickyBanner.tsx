'use client';

import LivePlacementStickyBanner from '@/app/components/marketplace/LivePlacementStickyBanner';

const fallbackItems = [
  {
    id: 'lh-ann-1',
    message: 'Language week campaigns are now open for community archives and immersion programs.',
    cta: 'View Library',
    href: '/language-heritage/library'
  },
  {
    id: 'lh-ann-2',
    message: 'Recognized Elders can now approve protocol-gated listings from one dashboard.',
    cta: 'Open Dashboard',
    href: '/language-heritage'
  },
  {
    id: 'lh-ann-3',
    message: 'Institution partner slots are live for archive digitization and curriculum distribution.',
    cta: 'Explore Partners',
    href: '/language-heritage'
  }
];

export default function LanguageHeritageStickyBanner() {
  return (
    <LivePlacementStickyBanner
      apiPath="/api/placements/page/language-heritage"
      stickyKey="stickyBanner"
      fallbackItems={fallbackItems}
      bannerClassName="sticky top-0 z-40 w-full rounded-lg border border-[#d4af37]/30 bg-gradient-to-r from-[#13221b] via-[#111111] to-[#2a1f0d] backdrop-blur-md"
      iconClassName="shrink-0 text-[#d4af37]"
      textClassName="truncate text-sm text-[#f3e3b0]"
      buttonClassName="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#d4af37] hover:bg-white/20"
      badgeClassName="shrink-0 rounded-full border border-[#d4af37]/35 bg-black/35 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]"
      dismissClassName="rounded-full p-1 text-[#d4af37] hover:bg-white/10"
      dismissLabel="Dismiss language and heritage announcement"
    />
  );
}
