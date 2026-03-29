'use client';

import LivePlacementStickyBanner from '@/app/components/marketplace/LivePlacementStickyBanner';

const fallbackItems = [
  { id: 'fr-1', message: 'Top-rated pro sidebar spots are now open for next week.', cta: 'Book Sidebar', href: '/freelancing' },
  { id: 'fr-2', message: 'Sponsored service cards can now target category feeds.', cta: 'Promote Service', href: '/freelancing' },
  { id: 'fr-3', message: 'Skill Hub partner strip accepting premium placements.', cta: 'Reserve', href: '/freelancing' }
];

export default function FreelancingStickyBanner() {
  return (
    <LivePlacementStickyBanner
      apiPath="/api/placements/page/freelancing"
      stickyKey="stickyBanner"
      fallbackItems={fallbackItems}
      bannerClassName="sticky top-0 z-40 w-full rounded-lg border border-emerald-500/35 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/20 backdrop-blur-md"
      iconClassName="shrink-0 text-emerald-300"
      textClassName="truncate text-sm text-emerald-100"
      buttonClassName="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-white/20"
      badgeClassName="shrink-0 rounded-full border border-emerald-400/35 bg-black/35 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-300"
      dismissClassName="rounded-full p-1 text-emerald-300 hover:bg-white/10"
      dismissLabel="Dismiss freelancing announcement"
    />
  );
}
