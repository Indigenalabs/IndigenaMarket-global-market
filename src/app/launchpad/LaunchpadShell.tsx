'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Rocket } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';

export default function LaunchpadShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activePillar, setActivePillar] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const backHref = useMemo(() => {
    if (pathname === '/launchpad') return '/';
    return '/launchpad';
  }, [pathname]);

  const backLabel = pathname === '/launchpad' ? 'Back home' : 'Back to Launchpad';

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar
        activePillar={activePillar}
        onPillarChange={setActivePillar}
        isCollapsed={isCollapsed}
        onCollapseChange={setIsCollapsed}
      />
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_28%),radial-gradient(circle_at_top_left,rgba(220,20,60,0.12),transparent_26%)]" />
        <div className="sticky top-0 z-40 border-b border-white/8 bg-[#050505]/92 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/78 transition hover:border-[#d4af37]/40 hover:text-white"
              >
                <ArrowLeft size={16} />
                {backLabel}
              </Link>
              <div className="hidden text-xs uppercase tracking-[0.24em] text-white/45 md:block">
                Funding for people, ventures, and community builds
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/launchpad/create"
                className="hidden rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35 hover:text-[#f0d39c] md:inline-flex"
              >
                Start campaign
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/18 bg-[#d4af37]/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#f0d39c]">
                <Rocket size={14} />
                Launchpad
              </div>
            </div>
          </div>
        </div>
        <div className="relative min-w-0">{children}</div>
      </div>
    </div>
  );
}
