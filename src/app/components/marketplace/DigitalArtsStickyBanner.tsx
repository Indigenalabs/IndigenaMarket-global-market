'use client';

import LivePlacementStickyBanner from '@/app/components/marketplace/LivePlacementStickyBanner';

const fallbackItems = [
  { id: 'da-1', message: 'New digital drop: Sacred Geometry Collection launches this week.', cta: 'View Drop', href: '/digital-arts' },
  { id: 'da-2', message: 'Featured artist slots open for next homepage cycle.', cta: 'Apply', href: '/creator-hub' },
  { id: 'da-3', message: 'Creator tools partner banner now available for booking.', cta: 'Book Slot', href: '/digital-arts/add' }
];

export default function DigitalArtsStickyBanner() {
  return (
    <LivePlacementStickyBanner
      apiPath="/api/placements/page/digital-arts"
      stickyKey="stickyBanner"
      fallbackItems={fallbackItems}
      bannerClassName="sticky top-0 z-40 w-full rounded-lg border border-[#d4af37]/30 bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/10 to-[#d4af37]/20 backdrop-blur-md"
      iconClassName="shrink-0 text-[#d4af37]"
      textClassName="truncate text-sm text-[#f4e4a6]"
      buttonClassName="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#d4af37] hover:bg-white/20"
      badgeClassName="shrink-0 rounded-full border border-[#d4af37]/35 bg-black/35 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]"
      dismissClassName="rounded-full p-1 text-[#d4af37] hover:bg-white/10"
      dismissLabel="Dismiss digital arts announcement"
    />
  );
}
