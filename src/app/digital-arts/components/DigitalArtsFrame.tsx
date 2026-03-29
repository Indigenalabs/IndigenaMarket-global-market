'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import DigitalArtsStickyBanner from '@/app/components/marketplace/DigitalArtsStickyBanner';
import PillarPremiumHero from '@/app/components/marketplace/PillarPremiumHero';

const navLinks = [
  { href: '/digital-arts', label: 'Marketplace' },
  { href: '/digital-arts/artists', label: 'View All Artists' },
  { href: '/digital-arts/categories/digital-paintings', label: 'Paintings' },
  { href: '/digital-arts/categories/photography', label: 'Photography' },
  { href: '/digital-arts/categories/3d-art', label: '3D Art' },
  { href: '/digital-arts/categories/animation-motion-graphics', label: 'Animation' },
  { href: '/digital-arts/my-collection', label: 'My Collection' }
] as const;

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function DigitalArtsFrame({ title, subtitle, children }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-[#090909]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[12%] top-[-12%] h-[340px] w-[340px] rounded-full bg-[#dc143c]/10 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[15%] h-[340px] w-[340px] rounded-full bg-[#d4af37]/10 blur-3xl" />
      </div>
      <Sidebar activePillar="digital-arts" onPillarChange={() => {}} isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} />
      <div className="relative z-10 flex-1 min-w-0 p-4 md:p-7">
        <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">
          <header className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#121212] via-[#101010] to-[#121212] p-5 md:p-6">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-[#d4af37]/30 bg-black/25 px-3 py-1 text-xs text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </header>
          <DigitalArtsStickyBanner />
          <PillarPremiumHero scope="digital-arts" eyebrow="Pillar 1 paid exposure" ctaHref="/creator-hub" />
          <div className="space-y-6 md:space-y-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

