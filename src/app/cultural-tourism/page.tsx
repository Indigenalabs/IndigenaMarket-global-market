'use client';

import Link from 'next/link';
import CulturalTourismMarketplace from '@/app/components/marketplace/CulturalTourismMarketplace';
import CulturalTourismFrame from './components/CulturalTourismFrame';

export default function CulturalTourismPage() {
  return (
    <CulturalTourismFrame
      title="Cultural Tourism Marketplace"
      subtitle="Indigenous-led experiences, protocol-aware travel, and premium placement exposure across destination discovery."
      showPremiumHero={false}
      showStickyBanner={false}
    >
      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Travel shortcuts</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Go straight to stays, tours, workshops, or seasonal trips</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['/cultural-tourism/experiences', 'All experiences'],
              ['/cultural-tourism/trips', 'Trips'],
              ['/cultural-tourism/experiences?kind=lodging', 'Stays'],
              ['/cultural-tourism/experiences?kind=guided-tours', 'Guided tours'],
              ['/cultural-tourism/experiences?kind=workshops', 'Workshops'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full border border-[#d4af37]/30 bg-black/30 px-4 py-2 text-sm text-[#d4af37] transition-colors hover:bg-[#d4af37]/10">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Book now', text: 'Find a stay, guide, or experience with open dates and direct booking.' },
          { label: 'Plan a season', text: 'Use destination pages and seasonal launches to plan ahead.' },
          { label: 'Travel respectfully', text: 'Every listing carries protocol, host, and community trust context.' },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">{item.label}</p>
            <p className="mt-2 text-sm text-gray-300">{item.text}</p>
          </article>
        ))}
      </section>

      <CulturalTourismMarketplace />
    </CulturalTourismFrame>
  );
}
