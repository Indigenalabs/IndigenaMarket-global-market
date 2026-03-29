'use client';

import { useState } from 'react';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import NFTCard from '../NFTCard';
import HomeMarketplaceModal, { type HomeMarketplaceItem } from './HomeMarketplaceModal';

const trendingNFTs = [
  {
    id: 't1',
    title: 'Sacred Buffalo Spirit',
    creator: 'LakotaDreams',
    price: 250,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    likes: 128,
    views: 1045,
    isVerified: true
  },
  {
    id: 't2',
    title: 'Navajo Weaving Pattern #4',
    creator: 'WeavingWoman',
    price: 180,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    likes: 89,
    views: 723,
    isVerified: true
  },
  {
    id: 't3',
    title: 'Thunderbird Rising',
    creator: 'CoastalArtist',
    price: 420,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    likes: 256,
    views: 2103,
    isVerified: false
  },
  {
    id: 't4',
    title: 'Medicine Wheel',
    creator: 'PlainsElder',
    price: 500,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop',
    likes: 312,
    views: 2890,
    isVerified: true
  },
];

export default function TrendingSection() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeItem, setActiveItem] = useState<HomeMarketplaceItem | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('trending-container');
    if (container) {
      const scrollAmount = 320;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className="py-12 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC143C] to-[#8B0000] flex items-center justify-center">
              <Flame size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">🔥 Trending Now</h2>
              <p className="text-sm text-gray-500">Most popular this week · <span className="text-green-400/80">Algorithm Based</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-[#141414] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/10 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-[#141414] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/10 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div 
          id="trending-container"
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trendingNFTs.map((nft, index) => (
            <div key={nft.id} className="flex-shrink-0 w-72 relative">
              {index < 3 && (
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-[#DC143C] to-[#8B0000] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  #{index + 1}
                </div>
              )}
              <NFTCard
                {...nft}
                onViewDetails={() =>
                  setActiveItem({
                    id: nft.id,
                    title: nft.title,
                    creator: nft.creator,
                    image: nft.image,
                    price: nft.price,
                    currency: nft.currency,
                    description: `${nft.title} is one of the fastest-rising works on the homepage, currently drawing ${nft.views.toLocaleString()} views and ${nft.likes} likes this week.`,
                    detailHref: `/marketplace/item/${nft.id}`,
                    artistHref: `/artist/${nft.creator.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
      <HomeMarketplaceModal item={activeItem} mode="details" isOpen={Boolean(activeItem)} onClose={() => setActiveItem(null)} />
    </section>
  );
}
