'use client';

import LivePlacementStickyBanner from '@/app/components/marketplace/LivePlacementStickyBanner';

const fallbackItems = [
  { id: 'co-1', message: 'New course bundles are live for this learning cycle.', cta: 'View Bundles', href: '/courses/bundles' },
  { id: 'co-2', message: 'Instructor spotlight placements are now open.', cta: 'Apply', href: '/courses/instructor/promote' },
  { id: 'co-3', message: 'Promoted course card campaigns now bookable weekly.', cta: 'Promote', href: '/courses/promote' }
];

export default function CoursesStickyBanner() {
  return (
    <LivePlacementStickyBanner
      apiPath="/api/placements/page/courses"
      stickyKey="stickyAnnouncement"
      fallbackItems={fallbackItems}
      bannerClassName="sticky top-0 z-40 w-full rounded-lg border border-[#d4af37]/30 bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/10 to-[#d4af37]/20 backdrop-blur-md"
      iconClassName="shrink-0 text-[#d4af37]"
      textClassName="truncate text-sm text-[#f4e4a6]"
      buttonClassName="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#d4af37] hover:bg-white/20"
      badgeClassName="shrink-0 rounded-full border border-[#d4af37]/35 bg-black/35 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]"
      dismissClassName="rounded-full p-1 text-[#d4af37] hover:bg-white/10"
      dismissLabel="Dismiss courses announcement"
    />
  );
}
