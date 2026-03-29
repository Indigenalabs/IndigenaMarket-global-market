'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import LanguageHeritageStickyBanner from '@/app/components/marketplace/LanguageHeritageStickyBanner';
import PillarPremiumHero from '@/app/components/marketplace/PillarPremiumHero';

const topLinks = [
  { href: '/language-heritage', label: 'Home' },
  { href: '/language-heritage/marketplace', label: 'Marketplace' },
  { href: '/language-heritage/languages', label: 'Languages' },
  { href: '/language-heritage/archive', label: 'Archive' },
  { href: '/language-heritage/sacred', label: 'Sacred Portal' },
  { href: '/language-heritage/consulting', label: 'Services' }
] as const;

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function LanguageHeritageFrame({ title, subtitle, children }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-[#0a0a0a]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[18%] top-[-10%] h-[320px] w-[320px] rounded-full bg-[#d4af37]/8 blur-3xl" />
        <div className="absolute bottom-[-6%] right-[10%] h-[280px] w-[280px] rounded-full bg-[#b51d19]/8 blur-3xl" />
      </div>
      <Sidebar
        activePillar="language-heritage"
        onPillarChange={() => {}}
        isCollapsed={isCollapsed}
        onCollapseChange={setIsCollapsed}
      />
      <div className="relative z-10 flex-1 min-w-0 p-4 md:p-7">
        <div className="mx-auto w-full max-w-[1480px] space-y-6 md:space-y-8">
        <header className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#111111] via-[#101010] to-[#111111] p-5 md:p-6">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
          <nav className="mt-4 flex flex-wrap gap-2.5">
            {topLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full border border-[#d4af37]/30 bg-black/20 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
        <LanguageHeritageStickyBanner />
        <PillarPremiumHero scope="language-heritage" eyebrow="Pillar 7 paid exposure" ctaHref="/creator-hub" />
        <div className="space-y-6 md:space-y-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
