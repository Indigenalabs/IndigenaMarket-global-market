'use client';

import { useEffect, useState, useRef } from 'react';
import { ShoppingCart, TrendingUp, Zap } from 'lucide-react';

interface Sale {
  id: string;
  itemName: string;
  itemImage: string;
  buyer: string;
  buyerAvatar: string;
  seller: string;
  price: number;
  currency: string;
  timeAgo: string;
}

const recentSales: Sale[] = [
  {
    id: '1',
    itemName: 'Sacred Eagle',
    itemImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=100&h=100&fit=crop',
    buyer: 'Collector123',
    buyerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
    seller: 'Maria Redfeather',
    price: 2.5,
    currency: 'ETH',
    timeAgo: '2 min ago'
  },
  {
    id: '2',
    itemName: 'Dream Catcher #45',
    itemImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop',
    buyer: 'ArtLover99',
    buyerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
    seller: 'ThunderVoice',
    price: 0.8,
    currency: 'ETH',
    timeAgo: '5 min ago'
  },
  {
    id: '3',
    itemName: 'Spirit Wolf',
    itemImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=100&h=100&fit=crop',
    buyer: 'CryptoNative',
    buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
    seller: 'Elena Rivers',
    price: 1.2,
    currency: 'ETH',
    timeAgo: '8 min ago'
  },
  {
    id: '4',
    itemName: 'Traditional Beadwork',
    itemImage: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=100&h=100&fit=crop',
    buyer: 'IndigenousArt',
    buyerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop',
    seller: 'DesertRose',
    price: 0.5,
    currency: 'ETH',
    timeAgo: '12 min ago'
  },
  {
    id: '5',
    itemName: 'Digital Totem',
    itemImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=100&h=100&fit=crop',
    buyer: 'NFTCollector',
    buyerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop',
    seller: 'MountainEagle',
    price: 3.0,
    currency: 'ETH',
    timeAgo: '15 min ago'
  },
  {
    id: '6',
    itemName: 'Ceremonial Mask',
    itemImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=100&h=100&fit=crop',
    buyer: 'CultureKeeper',
    buyerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop',
    seller: 'RiverSong',
    price: 1.8,
    currency: 'ETH',
    timeAgo: '18 min ago'
  }
];

export default function RecentSalesTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const animate = () => {
      scrollPosition += speed;
      
      // Reset when scrolled through half (duplicated content)
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  return (
    <section className="py-4 bg-[#141414] border-y border-[#d4af37]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Live Sales</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <TrendingUp size={16} className="text-[#d4af37]" />
            <span>24h Volume: <span className="text-white font-semibold">245.8 ETH</span></span>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ scrollBehavior: 'auto' }}
      >
        {/* Duplicate sales for seamless loop */}
        {[...recentSales, ...recentSales].map((sale, idx) => (
          <div 
            key={`${sale.id}-${idx}`}
            className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] rounded-xl border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-colors cursor-pointer"
          >
            {/* Item Image */}
            <img 
              src={sale.itemImage}
              alt={sale.itemName}
              className="w-12 h-12 rounded-lg object-cover"
            />

            {/* Details */}
            <div className="flex-1 min-w-[140px]">
              <p className="text-white text-sm font-medium truncate">{sale.itemName}</p>
              <p className="text-gray-400 text-xs">by {sale.seller}</p>
            </div>

            {/* Buyer & Price */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img 
                  src={sale.buyerAvatar}
                  alt={sale.buyer}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-gray-400 text-xs hidden sm:block">{sale.buyer}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/10 rounded-lg">
                <Zap size={12} className="text-[#d4af37]" />
                <span className="text-[#d4af37] text-sm font-bold">{sale.price} {sale.currency}</span>
              </div>
            </div>

            {/* Time */}
            <span className="text-gray-500 text-xs whitespace-nowrap">{sale.timeAgo}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
