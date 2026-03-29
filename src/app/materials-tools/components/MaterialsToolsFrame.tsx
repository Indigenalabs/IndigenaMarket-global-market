'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';

const nav = [
  { href: '/materials-tools', label: 'Home' },
  { href: '/materials-tools/marketplace', label: 'Marketplace' },
  { href: '/materials-tools/suppliers', label: 'Suppliers' },
  { href: '/materials-tools/rentals', label: 'Tool Libraries' },
  { href: '/materials-tools/bulk-coop', label: 'Bulk Co-op' },
  { href: '/materials-tools/wishlist', label: 'Wishlist' }
] as const;

export default function MaterialsToolsFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-[#0b0907] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[8%] top-[4%] h-[300px] w-[300px] rounded-full bg-[#9b6b2b]/18 blur-3xl" />
        <div className="absolute right-[12%] top-[18%] h-[260px] w-[260px] rounded-full bg-[#1d6b74]/12 blur-3xl" />
        <div className="absolute bottom-[0%] left-[30%] h-[340px] w-[340px] rounded-full bg-[#d4af37]/8 blur-3xl" />
      </div>
      <Sidebar activePillar="materials-tools" onPillarChange={() => {}} isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} />
      <div className="relative z-10 min-w-0 flex-1 p-4 md:p-7">
        <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">
          <header className="overflow-hidden rounded-[28px] border border-[#9b6b2b]/30 bg-[radial-gradient(circle_at_top_left,_rgba(155,107,43,0.2),_transparent_35%),linear-gradient(135deg,_rgba(17,12,8,0.98),_rgba(10,10,10,0.96))] p-5 md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#d4af37]">Pillar 10 • Sovereign Supply Chain</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1>
                {subtitle ? <p className="mt-2 max-w-3xl text-sm text-[#d9d0c2] md:text-base">{subtitle}</p> : null}
              </div>
              <div className="rounded-2xl border border-[#1d6b74]/35 bg-[#091214]/75 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.25em] text-[#7fd7dd]">Launch Focus</p>
                <p className="mt-1 text-sm text-[#d7f4f5]">Traceable materials, tool access, and community-first supplier trust.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-[#9b6b2b]/35 bg-black/20 px-3 py-1.5 text-xs font-medium text-[#f0d7aa] transition hover:border-[#d4af37]/55 hover:bg-[#9b6b2b]/12"
                >
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

