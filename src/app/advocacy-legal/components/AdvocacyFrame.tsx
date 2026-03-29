'use client';

import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import AdvocacyStickyBanner from '@/app/components/marketplace/AdvocacyStickyBanner';
import PillarPremiumHero from '@/app/components/marketplace/PillarPremiumHero';

export default function AdvocacyFrame({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar activePillar="advocacy-legal" onPillarChange={() => {}} />
      <div className="flex-1 min-w-0">
        <Header onMenuClick={() => {}} />
        <main className="pt-16 min-h-screen w-full overflow-x-hidden">
          <div className="mx-auto max-w-[1580px] space-y-8 px-5 py-7 md:px-7 lg:px-10 lg:py-10">
            <section className="relative overflow-hidden rounded-[30px] border border-[#d4af37]/20 bg-[linear-gradient(135deg,rgba(34,17,18,0.96),rgba(15,15,16,0.96)_42%,rgba(28,20,15,0.96))] px-6 py-7 shadow-[0_28px_90px_rgba(0,0,0,0.34)] md:px-8 md:py-8">
              <div className="pointer-events-none absolute inset-y-0 right-0 w-[34%] bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.16),transparent_62%)]" />
              <div className="relative flex flex-wrap items-start justify-between gap-6">
                <div className="max-w-4xl">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">Pillar 9 • Protection Economy</p>
                  <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl">{title}</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300 md:text-[15px]">{subtitle}</p>
                </div>
                <div className="max-w-xl rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-[#d4af37]/70">Navigate Pillar 9</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    ['/advocacy-legal', 'Home'],
                    ['/advocacy-legal/marketplace', 'Marketplace'],
                    ['/advocacy-legal/attorneys', 'Attorneys'],
                    ['/advocacy-legal/campaigns', 'Campaigns'],
                    ['/advocacy-legal/resources/know-your-rights', 'Resources'],
                    ['/advocacy-legal/icip-registry', 'ICIP Registry'],
                    ['/advocacy-legal/icip-notices', 'ICIP Notices'],
                    ['/advocacy-legal/dashboard/audit-center', 'Audit Center']
                  ].map(([href, label]) => (
                    <Link key={href} href={href} className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-[#d4af37] hover:bg-[#d4af37]/10">
                      {label}
                    </Link>
                  ))}
                  </div>
                </div>
              </div>
            </section>
            <AdvocacyStickyBanner />
            <PillarPremiumHero scope="advocacy-legal" eyebrow="Pillar 9 paid exposure" ctaHref="/creator-hub" />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
