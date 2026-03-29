'use client';

import { useState, useEffect } from 'react';
import { Clock, Flame, ChevronRight, Gavel } from 'lucide-react';
import Link from 'next/link';
import HomeMarketplaceModal, { type HomeMarketplaceItem } from './HomeMarketplaceModal';

interface Auction {
  id: string;
  name: string;
  image: string;
  creator: string;
  currentBid: number;
  currency: string;
  endTime: Date;
  bids: number;
  watchers: number;
}

const endingAuctions: Auction[] = [
  {
    id: 'auction-1',
    name: 'Elder Wisdom Portrait',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    creator: 'Maria Redfeather',
    currentBid: 3.5,
    currency: 'ETH',
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 34 * 60 * 1000), // 2h 34m
    bids: 12,
    watchers: 45
  },
  {
    id: 'auction-2',
    name: 'Sacred Drum Collection',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    creator: 'ThunderVoice',
    currentBid: 1.8,
    currency: 'ETH',
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000 + 12 * 60 * 1000), // 5h 12m
    bids: 8,
    watchers: 32
  },
  {
    id: 'auction-3',
    name: 'Traditional Regalia',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop',
    creator: 'Elena Rivers',
    currentBid: 4.2,
    currency: 'ETH',
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000 + 45 * 60 * 1000), // 8h 45m
    bids: 15,
    watchers: 67
  },
  {
    id: 'auction-4',
    name: 'Ceremonial Mask Digital',
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=400&fit=crop',
    creator: 'MountainEagle',
    currentBid: 2.1,
    currency: 'ETH',
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000 + 20 * 60 * 1000), // 12h 20m
    bids: 6,
    watchers: 28
  }
];

function CountdownTimer({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = endTime.getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) return 'Ended';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setIsUrgent(hours < 1);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m ${seconds}s`;
    };

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <span className={isUrgent ? 'text-[#DC143C] animate-pulse' : 'text-[#d4af37]'}>
      {timeLeft}
    </span>
  );
}

export default function EndingSoon() {
  const [activeItem, setActiveItem] = useState<HomeMarketplaceItem | null>(null);

  return (
    <section className="py-12 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#DC143C] to-red-600 rounded-lg flex items-center justify-center">
              <Flame size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ending Soon</h2>
              <p className="text-gray-400 text-sm">Don&apos;t miss out on these auctions</p>
            </div>
          </div>
          <Link 
            href="/auctions"
            className="flex items-center gap-1 text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
          >
            All Auctions
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {endingAuctions.map((auction) => (
            <div 
              key={auction.id}
              className="group bg-[#141414] rounded-xl border border-[#d4af37]/10 overflow-hidden hover:border-[#d4af37]/30 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={auction.image}
                  alt={auction.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Timer Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full">
                  <Clock size={14} />
                  <CountdownTimer endTime={auction.endTime} />
                </div>

                {/* Bids Badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-[#d4af37]/20 rounded-lg">
                  <span className="text-[#d4af37] text-xs font-bold">{auction.bids} bids</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 truncate">{auction.name}</h3>
                <p className="text-gray-400 text-sm mb-3">by {auction.creator}</p>

                {/* Current Bid */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Current Bid</p>
                    <p className="text-xl font-bold text-white">{auction.currentBid} {auction.currency}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Watching</p>
                    <p className="text-[#d4af37] text-sm">{auction.watchers}</p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveItem({
                      id: auction.id,
                      title: auction.name,
                      creator: auction.creator,
                      image: auction.image,
                      price: auction.currentBid,
                      currentBid: auction.currentBid,
                      currency: auction.currency,
                      description: `${auction.name} is one of the auctions closing soon. Jump in from the homepage before the timer runs out.`,
                      isAuction: true,
                      bidIncrement: 0.1,
                      bidLabel: 'Suggested increment',
                      detailHref: '/auctions',
                      artistHref: `/artist/${auction.creator.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                    })
                  }
                  className="w-full py-2.5 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2"
                >
                  <Gavel size={16} />
                  Place Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <HomeMarketplaceModal item={activeItem} mode="bid" isOpen={Boolean(activeItem)} onClose={() => setActiveItem(null)} />
    </section>
  );
}
