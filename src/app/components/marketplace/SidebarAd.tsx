'use client';

import { Star, ExternalLink } from 'lucide-react';
import { PlacementPill } from '../placements/PremiumPlacement';

export default function SidebarAd() {
  return (
    <div className="p-4 bg-gradient-to-br from-[#141414] to-[#1a1a1a] rounded-xl border border-[#d4af37]/20">
      {/* Sponsored Label */}
      <div className="flex items-center gap-1 mb-3">
        <PlacementPill icon={Star}>Sponsored</PlacementPill>
      </div>

      {/* Ad Content */}
      <div className="mb-3">
        <img 
          src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=150&fit=crop"
          alt="Featured Workshop"
          className="w-full h-24 object-cover rounded-lg mb-3"
        />
        <h4 className="text-white font-semibold text-sm mb-1">Master Beadwork Workshop</h4>
        <p className="mb-2 text-[11px] text-[#d4af37]/75">Sponsored by Heritage Learning Studio</p>
        <p className="text-gray-400 text-xs">Learn traditional patterns from Lakota masters</p>
      </div>

      {/* CTA */}
      <button className="w-full flex items-center justify-center gap-2 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-sm hover:bg-[#d4af37] hover:text-black transition-all">
        Learn More
        <ExternalLink size={14} />
      </button>

      {/* Pricing Info */}
      <p className="mt-3 text-center text-xs text-gray-500">
        Advertise here for 150 INDI/month
      </p>
    </div>
  );
}
