'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  const [activePillar, setActivePillar] = useState('courses');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [simpleCreateMode, setSimpleCreateMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isSimple = pathname === '/courses/create' && new URLSearchParams(window.location.search).get('simple') === '1';
    setSimpleCreateMode(isSimple);
  }, [pathname]);

  return (
    <div className={`flex ${simpleCreateMode ? 'min-h-screen' : 'h-screen'} bg-[#0a0a0a] overflow-hidden`}>
      {!simpleCreateMode ? (
        <Sidebar
          activePillar={activePillar}
          onPillarChange={setActivePillar}
          isCollapsed={isCollapsed}
          onCollapseChange={setIsCollapsed}
        />
      ) : null}
      <div
        className={`flex-1 min-w-0 flex flex-col ${simpleCreateMode ? 'overflow-visible' : 'overflow-hidden'} transition-all duration-300`}
      >
        {children}
      </div>
    </div>
  );
}
