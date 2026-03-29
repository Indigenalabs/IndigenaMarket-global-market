'use client';

import { Search, Bell, User, Menu, Flame, Users, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import WalletSessionEntry from '@/app/components/WalletSessionEntry';
import { useSidebar } from '@/app/components/Sidebar';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#DC143C]/30 z-40 flex items-center justify-between px-4 md:px-6 ${
        isMobile ? 'left-0' : isCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      {/* Left Section - Navigation */}
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-white/5 rounded-full transition-colors lg:hidden"
        >
          <Menu size={20} className="text-gray-400" />
        </button>
        
        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-4">
          <Link 
            href="/trending" 
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#d4af37] transition-colors text-sm"
          >
            <Flame size={16} />
            Trending
          </Link>
          <Link 
            href="/community" 
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#d4af37] transition-colors text-sm"
          >
            <Users size={16} />
            Community
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="relative w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search NFTs, artists, collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-[#DC143C]/30 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#DC143C] transition-colors"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
          <Bell size={20} className="text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC143C] rounded-full pulse-red"></span>
        </button>

        <WalletSessionEntry variant="header" />

        {/* Wallet Link */}
        <Link 
          href="/wallet"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all text-sm"
        >
          <Wallet size={14} />
          12.5K
        </Link>

        <Link
          href="/profile/aiyana-redbird"
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
          aria-label="Open profile"
        >
          <User size={20} className="text-gray-400" />
        </Link>
      </div>
    </header>
  );
}
