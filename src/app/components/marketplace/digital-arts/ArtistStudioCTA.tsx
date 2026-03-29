'use client';

import Link from 'next/link';
import { Palette, Upload, TrendingUp, Shield, ArrowRight, Sparkles, Zap } from 'lucide-react';

export default function ArtistStudioCTA() {
  return (
    <div className="bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414] rounded-xl border border-[#d4af37]/20 p-6 cursor-pointer hover:border-[#d4af37]/40 transition-colors">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#DC143C] rounded-2xl flex items-center justify-center">
            <Palette size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Are you an Indigenous Digital Artist?</h3>
            <p className="text-gray-400 mt-1">Join our community of creators. Free to list, only 8% when you sell.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Upload size={16} className="text-[#d4af37]" />
            <span>Free Minting</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp size={16} className="text-[#d4af37]" />
            <span>Global Reach</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield size={16} className="text-[#d4af37]" />
            <span>IP Protection</span>
          </div>
          <Link
            href="/creator-hub"
            className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-black font-semibold rounded-full hover:bg-[#f4e4a6] transition-colors"
          >
            Open Studio
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#d4af37]/10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles size={16} className="text-[#d4af37]" />
            <p className="text-2xl font-bold text-[#d4af37]">FREE</p>
          </div>
          <p className="text-gray-500 text-sm">Listing & Minting</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap size={16} className="text-[#d4af37]" />
            <p className="text-2xl font-bold text-white">8%</p>
          </div>
          <p className="text-gray-500 text-sm">Only on Sales</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">50K+</p>
          <p className="text-gray-500 text-sm">Artworks</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">$2M+</p>
          <p className="text-gray-500 text-sm">Paid to Artists</p>
        </div>
      </div>
    </div>
  );
}
