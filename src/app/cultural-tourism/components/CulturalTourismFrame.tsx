'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import TourismStickyBanner from '@/app/components/marketplace/TourismStickyBanner';
import PillarPremiumHero from '@/app/components/marketplace/PillarPremiumHero';

const navLinks = [
  { href: '/cultural-tourism', label: 'Marketplace' },
  { href: '/cultural-tourism/experiences', label: 'All Experiences' },
  { href: '/cultural-tourism/operator', label: 'Operator Studio' },
  { href: '/cultural-tourism/trips', label: 'Trip Dashboard' }
] as const;

export default function CulturalTourismFrame({
  title,
  subtitle,
  children,
  showPremiumHero = true,
  showStickyBanner = true
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showPremiumHero?: boolean;
  showStickyBanner?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-[#0a0a0a]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[12%] top-[-12%] h-[340px] w-[340px] rounded-full bg-[#d4af37]/10 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[12%] h-[320px] w-[320px] rounded-full bg-[#b51d19]/10 blur-3xl" />
      </div>
      <Sidebar activePillar="cultural-tourism" onPillarChange={() => {}} isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} />
      <div className="relative z-10 flex-1 min-w-0 p-4 md:p-7">
        <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">
          <header className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#16110d] via-[#101010] to-[#18110f] p-5 md:p-6">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2.5">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-full border border-[#d4af37]/30 bg-black/25 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                  {link.label}
                </Link>
              ))}
            </div>
          </header>
          {showStickyBanner ? <TourismStickyBanner /> : null}
          {showPremiumHero ? <PillarPremiumHero scope="cultural-tourism" eyebrow="Pillar 6 paid exposure" ctaHref="/creator-hub" /> : null}
          <div className="space-y-6 md:space-y-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
