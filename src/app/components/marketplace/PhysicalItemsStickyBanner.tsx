'use client';

import LivePlacementStickyBanner from '@/app/components/marketplace/LivePlacementStickyBanner';

const fallbackItems = [
  { id: 'pi-1', message: 'Featured Maker rotation updated with new handcrafted collections.', cta: 'Browse', href: '/physical-items' },
  { id: 'pi-2', message: 'Shipping hub partner campaign now accepting bookings.', cta: 'Partner', href: '/physical-items/add' },
  { id: 'pi-3', message: 'Craft supply banner slots available for this month.', cta: 'Book Slot', href: '/physical-items/add' }
];

export default function PhysicalItemsStickyBanner() {
  return (
    <LivePlacementStickyBanner
      apiPath="/api/placements/page/physical-items"
      stickyKey="stickyBanner"
      fallbackItems={fallbackItems}
      bannerClassName="sticky top-0 z-40 w-full rounded-lg border border-[#DC143C]/35 bg-gradient-to-r from-[#DC143C]/20 via-[#DC143C]/10 to-[#DC143C]/20 backdrop-blur-md"
      iconClassName="shrink-0 text-[#FF6B6B]"
      textClassName="truncate text-sm text-[#ffd0d7]"
      buttonClassName="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#FF6B6B] hover:bg-white/20"
      badgeClassName="shrink-0 rounded-full border border-[#FF6B6B]/35 bg-black/35 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#FF6B6B]"
      dismissClassName="rounded-full p-1 text-[#FF6B6B] hover:bg-white/10"
      dismissLabel="Dismiss physical items announcement"
    />
  );
}
