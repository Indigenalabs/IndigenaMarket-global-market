'use client';

import { ReactNode, useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

interface ProfileWorkspaceShellProps {
  children: ReactNode;
  activePillar?: string;
}

export default function ProfileWorkspaceShell({
  children,
  activePillar = ''
}: ProfileWorkspaceShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar
        activePillar={activePillar}
        onPillarChange={() => {}}
        isCollapsed={isCollapsed}
        onCollapseChange={setIsCollapsed}
      />
      <div className="flex-1 min-w-0">
        <Header onMenuClick={() => setIsCollapsed(false)} />
        <main className="min-h-screen px-4 pb-10 pt-20 md:px-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
