'use client';

import LivePlacementStickyBanner from '@/app/components/marketplace/LivePlacementStickyBanner';

const fallbackItems = [
  { id: 'to-1', message: 'Seasonal destination campaign windows now available.', cta: 'Book Campaign', href: '/cultural-tourism/operator' },
  { id: 'to-2', message: 'Newsletter feature slots open for the next send.', cta: 'Reserve Slot', href: '/cultural-tourism/operator' },
  { id: 'to-3', message: 'Operator spotlight banner updated with new featured hosts.', cta: 'View Operators', href: '/cultural-tourism' }
];

export default function TourismStickyBanner() {
  return (
    <LivePlacementStickyBanner
      apiPath="/api/placements/page/cultural-tourism"
      stickyKey="stickyBanner"
      fallbackItems={fallbackItems}
      bannerClassName="sticky top-0 z-40 w-full rounded-lg border border-[#d4af37]/30 bg-gradient-to-r from-[#d4af37]/20 via-[#b51d19]/10 to-[#d4af37]/20 backdrop-blur-md"
      iconClassName="shrink-0 text-[#d4af37]"
      textClassName="truncate text-sm text-[#f4e4a6]"
      buttonClassName="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#d4af37] hover:bg-white/20"
      badgeClassName="shrink-0 rounded-full border border-[#d4af37]/35 bg-black/35 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]"
      dismissClassName="rounded-full p-1 text-[#d4af37] hover:bg-white/10"
      dismissLabel="Dismiss tourism announcement"
    />
  );
}
