'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';

const nav = [
  { href: '/land-food', label: 'Home' },
  { href: '/land-food/marketplace', label: 'Marketplace' },
  { href: '/land-food/communities', label: 'Communities' },
  { href: '/land-food/services/conservation-carbon-projects', label: 'Conservation' },
  { href: '/land-food/harvest-calendar', label: 'Harvest Calendar' },
  { href: '/land-food/food-sovereignty-donation', label: 'Food Sovereignty' }
] as const;

export default function LandFoodFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-[#090b08]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[15%] top-[-10%] h-[320px] w-[320px] rounded-full bg-[#16a34a]/10 blur-3xl" />
        <div className="absolute bottom-[-6%] right-[12%] h-[320px] w-[320px] rounded-full bg-[#d4af37]/10 blur-3xl" />
      </div>
      <Sidebar activePillar="land-food" onPillarChange={() => {}} isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} />
      <div className="relative z-10 flex-1 min-w-0 p-4 md:p-7">
        <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">
          <header className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#12150f] via-[#10130e] to-[#12150f] p-5 md:p-6">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2.5">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-full border border-[#d4af37]/30 bg-black/25 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                  {item.label}
                </Link>
              ))}
            </div>
          </header>
          <div className="space-y-6 md:space-y-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
