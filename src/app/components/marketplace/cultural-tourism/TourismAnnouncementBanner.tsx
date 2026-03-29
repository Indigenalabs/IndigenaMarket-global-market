'use client';

export default function TourismAnnouncementBanner() {
  return (
    <section className="sticky top-2 z-20 rounded-xl border border-[#d4af37]/40 bg-gradient-to-r from-[#1a1405] via-[#2a1b08] to-[#1a1405] px-4 py-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-[#d4af37] font-medium whitespace-nowrap">Premium Announcement Banner</p>
        <p className="text-gray-200 text-xs md:text-sm truncate">
          Garma Festival season is now live. Priority placements available for verified operators this week.
        </p>
        <button className="px-2.5 py-1 rounded-md border border-[#d4af37]/40 text-[#d4af37] text-xs whitespace-nowrap">
          Book Announcement
        </button>
      </div>
    </section>
  );
}

