'use client';

import LivePlacementStickyBanner from '@/app/components/marketplace/LivePlacementStickyBanner';

const fallbackItems = [
  {
    id: 'adv-1',
    message: 'Advocacy hero and sticky placements now run across Pillar 9 home, marketplace, and service pages.',
    cta: 'Book Placement',
    href: '/creator-hub'
  },
  {
    id: 'adv-2',
    message: 'Attorney and resource spotlight slots are open for the next protection cycle.',
    cta: 'View Pricing',
    href: '/creator-hub'
  },
  {
    id: 'adv-3',
    message: 'Trending legal actions rail can now carry approved campaign and service promotions.',
    cta: 'Plan Campaign',
    href: '/creator-hub'
  }
];

export default function AdvocacyStickyBanner() {
  return (
    <LivePlacementStickyBanner
      apiPath="/api/placements/page/advocacy-legal"
      stickyKey="stickyBanner"
      fallbackItems={fallbackItems}
      bannerClassName="sticky top-0 z-40 w-full rounded-lg border border-[#d4af37]/30 bg-gradient-to-r from-[#2a1216] via-[#121212] to-[#2a1b10] backdrop-blur-md"
      iconClassName="shrink-0 text-[#d4af37]"
      textClassName="truncate text-sm text-[#f3e3b0]"
      buttonClassName="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#d4af37] hover:bg-white/20"
      badgeClassName="shrink-0 rounded-full border border-[#d4af37]/35 bg-black/35 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]"
      dismissClassName="rounded-full p-1 text-[#d4af37] hover:bg-white/10"
      dismissLabel="Dismiss advocacy announcement"
    />
  );
}
