'use client';

import { Star, TrendingUp } from 'lucide-react';
import NFTCard from '../NFTCard';

interface PromotedListingsProps {
  pillar: string;
}

const promotedNFTs = [
  {
    id: 'promo-1',
    title: 'Morning Star Vision',
    creator: 'StarDancer',
    price: 320,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    likes: 89,
    views: 567,
    isVerified: true,
    isPromoted: true
  },
  {
    id: 'promo-2',
    title: 'Eagle Totem',
    creator: 'WingedSpirit',
    price: 450,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    likes: 134,
    views: 892,
    isVerified: true,
    isPromoted: true
  },
  {
    id: 'promo-3',
    title: 'Dream Weaver',
    creator: 'NightSky',
    price: 275,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    likes: 67,
    views: 423,
    isVerified: false,
    isPromoted: true
  }
];

export default function PromotedListings({ pillar }: PromotedListingsProps) {
  const pillarLabel = pillar.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-[#d4af37]" />
          <h3 className="text-lg font-bold text-white">Promoted in {pillarLabel}</h3>
        </div>
        <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-2.5 py-1 text-[11px] font-medium text-[#d4af37]/80">
          Sponsored
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotedNFTs.map((nft) => (
          <div key={nft.id} className="relative">
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full border border-[#d4af37]/30 bg-[#0b0b0b]/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c] backdrop-blur-sm">
              <Star size={10} className="text-[#f3d57c]" fill="currentColor" />
              Promoted
            </div>
            <NFTCard {...nft} />
          </div>
        ))}
      </div>
    </div>
  );
}
