'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Palette,
  ShoppingBag,
  GraduationCap,
  Briefcase,
  Heart,
  Plane,
  Languages,
  Sprout,
  Scale,
  Hammer,
  Menu,
  X,
  Home,
  Rocket,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import WalletSessionEntry from '@/app/components/WalletSessionEntry';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {}
});

export const useSidebar = () => useContext(SidebarContext);

interface Pillar {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const pillars: Pillar[] = [
  { id: 'digital-arts', name: 'Digital Arts', icon: <Palette size={20} />, color: '#DC143C' },
  { id: 'physical-items', name: 'Physical Items', icon: <ShoppingBag size={20} />, color: '#DC143C' },
  { id: 'courses', name: 'Courses', icon: <GraduationCap size={20} />, color: '#DC143C' },
  { id: 'freelancing', name: 'Freelancing', icon: <Briefcase size={20} />, color: '#DC143C' },
  { id: 'seva', name: 'Seva', icon: <Heart size={20} />, color: '#DC143C' },
  { id: 'cultural-tourism', name: 'Cultural Tourism', icon: <Plane size={20} />, color: '#DC143C' },
  { id: 'language-heritage', name: 'Language & Heritage', icon: <Languages size={20} />, color: '#DC143C' },
  { id: 'land-food', name: 'Land & Food', icon: <Sprout size={20} />, color: '#DC143C' },
  { id: 'advocacy-legal', name: 'Advocacy & Legal', icon: <Scale size={20} />, color: '#DC143C' },
  { id: 'materials-tools', name: 'Materials & Tools', icon: <Hammer size={20} />, color: '#DC143C' }
];

interface SidebarProps {
  activePillar: string;
  onPillarChange: (pillarId: string) => void;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

const mainNavItems = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'trending', label: 'Trending', icon: TrendingUp, href: '/trending' },
  { id: 'community', label: 'Community', icon: Users, href: '/community' },
  { id: 'launchpad', label: 'Launchpad', icon: Rocket, href: '/launchpad' },
  { id: 'wallet', label: 'My Wallet', icon: Wallet, href: '/wallet' }
];

const isNavItemActive = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function Sidebar({ activePillar, onPillarChange, isCollapsed: externalCollapsed, onCollapseChange }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setIsCollapsed = (value: boolean) => {
    if (onCollapseChange) {
      onCollapseChange(value);
    } else {
      setInternalCollapsed(value);
    }
  };

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMobileOpen(false);
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const handleMainNavigation = (itemId: string, href: string) => {
    if (itemId === 'home') {
      onPillarChange('');
    }
    if (isMobile) setMobileOpen(false);
    router.push(href, { scroll: false });
  };

  const handlePillarNavigation = (pillarId: string) => {
    onPillarChange(pillarId);
    if (isMobile) setMobileOpen(false);

    if (pillarId === 'courses') {
      router.push('/courses', { scroll: false });
      return;
    }

    if (pillarId === 'seva') {
      router.push('/seva', { scroll: false });
      return;
    }

    if (pillarId === 'cultural-tourism') {
      router.push('/cultural-tourism', { scroll: false });
      return;
    }
    if (pillarId === 'language-heritage') {
      router.push('/language-heritage', { scroll: false });
      return;
    }
    if (pillarId === 'land-food') {
      router.push('/land-food', { scroll: false });
      return;
    }
    if (pillarId === 'advocacy-legal') {
      router.push('/advocacy-legal', { scroll: false });
      return;
    }
    if (pillarId === 'materials-tools') {
      router.push('/materials-tools', { scroll: false });
      return;
    }

    router.push(`/?pillar=${pillarId}`, { scroll: false });
  };

  const renderSidebarContent = (mobile = false) => (
    <>
      <div className={`flex items-center border-b border-[#DC143C]/30 flex-shrink-0 ${isCollapsed && !mobile ? 'p-2 justify-center' : 'p-4 justify-between'}`}>
        {(!isCollapsed || mobile) && (
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Indigena" className="h-10 w-10 rounded-full object-cover" />
            <span className="primary-gradient text-lg font-bold tracking-wider">INDIGENA</span>
          </div>
        )}
        {isCollapsed && !mobile && <img src="/logo.png" alt="Indigena" className="h-8 w-8 rounded-full object-cover" />}
        <button
          onClick={() => (mobile ? setMobileOpen(false) : setIsCollapsed(!isCollapsed))}
          className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-white/5"
          type="button"
          aria-label={mobile ? 'Close navigation' : isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {mobile ? <X size={20} className="text-[#DC143C]" /> : !isCollapsed ? <X size={20} className="text-[#DC143C]" /> : <Menu size={18} className="text-[#DC143C]" />}
        </button>
      </div>

      {isCollapsed && !mobile && (
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex items-center justify-center border-b border-[#DC143C]/20 p-2 transition-colors hover:bg-white/5" type="button">
          <Menu size={18} className="text-[#DC143C]" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/30 scrollbar-track-transparent">
        <nav className="p-2">
          {(!isCollapsed || mobile) && <p className="mb-2 px-2 text-xs uppercase tracking-wider text-gray-500">Main</p>}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMainNavigation(item.id, item.href)}
                className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200 ${
                  isActive ? 'border-[#d4af37]/50 bg-[#d4af37]/20' : 'border-transparent hover:bg-white/5'
                }`}
              >
                <span className={`${isActive ? 'text-[#d4af37]' : 'text-gray-400 group-hover:text-[#d4af37]'} transition-colors`}>
                  <Icon size={20} />
                </span>
                {(!isCollapsed || mobile) && (
                  <span className={`${isActive ? 'font-medium text-[#d4af37]' : 'text-gray-300 group-hover:text-white'} text-sm transition-colors`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <nav className="p-2 pb-20">
          {(!isCollapsed || mobile) && <p className="mb-2 mt-4 px-2 text-xs uppercase tracking-wider text-gray-500">10 Sacred Pillars</p>}
          {pillars.map((pillar) => {
            const isPillarActive =
              (pillar.id === 'courses' && pathname.startsWith('/courses')) ||
              (pillar.id === 'seva' && pathname.startsWith('/seva')) ||
              (pillar.id === 'cultural-tourism' && pathname.startsWith('/cultural-tourism')) ||
              (pillar.id === 'language-heritage' && pathname.startsWith('/language-heritage')) ||
              (pillar.id === 'land-food' && pathname.startsWith('/land-food')) ||
              (pillar.id === 'advocacy-legal' && pathname.startsWith('/advocacy-legal')) ||
              (pillar.id === 'materials-tools' && pathname.startsWith('/materials-tools')) ||
              (pillar.id !== 'courses' &&
                pillar.id !== 'seva' &&
                pillar.id !== 'cultural-tourism' &&
                pillar.id !== 'language-heritage' &&
                pillar.id !== 'land-food' &&
                pillar.id !== 'advocacy-legal' &&
                pillar.id !== 'materials-tools' &&
                activePillar === pillar.id);

            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => handlePillarNavigation(pillar.id)}
                className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200 ${
                  isPillarActive ? 'border-[#DC143C]/50 bg-[#DC143C]/20' : 'border-transparent hover:bg-white/5'
                }`}
              >
                <span className={`${isPillarActive ? 'text-[#DC143C]' : 'text-gray-400 group-hover:text-[#DC143C]'} transition-colors`}>
                  {pillar.icon}
                </span>
                {(!isCollapsed || mobile) && (
                  <span className={`${isPillarActive ? 'font-medium text-[#FF4444]' : 'text-gray-300 group-hover:text-white'} text-sm transition-colors`}>
                    {pillar.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {(!isCollapsed || mobile) && (
        <div className="flex-shrink-0 border-t border-[#DC143C]/30 bg-[#0f0f0f] p-4">
          <WalletSessionEntry variant="sidebar" />
        </div>
      )}
    </>
  );

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {isMobile ? (
        <>
          {!mobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="fixed left-4 top-4 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DC143C]/35 bg-[#0f0f0f]/92 text-[#DC143C] shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur md:hidden"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
          )}
          {mobileOpen && (
            <>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-[69] bg-black/70 md:hidden"
                aria-label="Close navigation overlay"
              />
              <aside className="fixed inset-y-0 left-0 z-[70] flex h-screen w-72 flex-col overflow-hidden border-r border-[#DC143C]/30 bg-[#0f0f0f] shadow-2xl md:hidden">
                {renderSidebarContent(true)}
              </aside>
            </>
          )}
        </>
      ) : (
        <aside
          className={`sticky top-0 z-50 flex h-screen flex-shrink-0 flex-col overflow-hidden border-r border-[#DC143C]/30 bg-[#0f0f0f] transition-all duration-300 ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {renderSidebarContent(false)}
        </aside>
      )}
    </SidebarContext.Provider>
  );
}
