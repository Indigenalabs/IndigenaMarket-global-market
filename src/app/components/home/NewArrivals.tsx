'use client';

import { useState, useEffect } from 'react';
import { Clock, Sparkles, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import HomeMarketplaceModal, { type HomeMarketplaceItem } from './HomeMarketplaceModal';

interface NewDrop {
  id: string;
  name: string;
  creator: string;
  image: string;
  price: number;
  currency: string;
  dropTime: Date;
  totalItems: number;
  soldItems: number;
  isLive: boolean;
}

const newDrops: NewDrop[] = [
  {
    id: 'drop-1',
    name: 'Sacred Geometry Collection',
    creator: 'Maria Redfeather',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    price: 0.5,
    currency: 'ETH',
    dropTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    totalItems: 100,
    soldItems: 0,
    isLive: false
  },
  {
    id: 'drop-2',
    name: 'Spirit Animals Series',
    creator: 'ThunderVoice',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    price: 0.3,
    currency: 'ETH',
    dropTime: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago (live)
    totalItems: 50,
    soldItems: 34,
    isLive: true
  },
  {
    id: 'drop-3',
    name: 'Traditional Patterns',
    creator: 'Elena Rivers',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop',
    price: 0.25,
    currency: 'ETH',
    dropTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    totalItems: 75,
    soldItems: 0,
    isLive: false
  },
  {
    id: 'drop-4',
    name: 'Digital Weaving Art',
    creator: 'DesertRose',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
    price: 0.4,
    currency: 'ETH',
    dropTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (live)
    totalItems: 30,
    soldItems: 28,
    isLive: true
  }
];

function CountdownTimer({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = targetTime.getTime() - Date.now();
    if (diff <= 0) return 'LIVE NOW';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = targetTime.getTime() - Date.now();
      if (diff <= 0) return 'LIVE NOW';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m ${seconds}s`;
    };

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <span className={timeLeft === 'LIVE NOW' ? 'text-green-400 animate-pulse' : 'text-[#d4af37]'}>
      {timeLeft}
    </span>
  );
}

export default function NewArrivals() {
  const [activeItem, setActiveItem] = useState<HomeMarketplaceItem | null>(null);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  return (
    <section className="py-12 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
              <Sparkles size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">New Arrivals & Drops</h2>
              <p className="text-gray-400 text-sm">Fresh releases from Indigenous creators</p>
            </div>
          </div>
          <Link 
            href="/drops"
            className="flex items-center gap-1 text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
          >
            View All Drops
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Drops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newDrops.map((drop) => (
            <div 
              key={drop.id}
              className="group bg-[#141414] rounded-xl border border-[#d4af37]/10 overflow-hidden hover:border-[#d4af37]/30 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={drop.image}
                  alt={drop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {drop.isLive ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DC143C] rounded-full">
                      <Zap size={14} className="text-white" />
                      <span className="text-white text-xs font-bold">LIVE</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full">
                      <Clock size={14} className="text-[#d4af37]" />
                      <CountdownTimer targetTime={drop.dropTime} />
                    </div>
                  )}
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                  <span className="text-white font-bold">{drop.price} {drop.currency}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 truncate">{drop.name}</h3>
                <p className="text-gray-400 text-sm mb-3">by {drop.creator}</p>

                {/* Progress */}
                {drop.isLive && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">{drop.soldItems} / {drop.totalItems} sold</span>
                      <span className="text-[#d4af37]">{Math.round((drop.soldItems / drop.totalItems) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#d4af37] to-[#DC143C] rounded-full"
                        style={{ width: `${(drop.soldItems / drop.totalItems) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => {
                    if (drop.isLive) {
                      setActiveItem({
                        id: drop.id,
                        title: drop.name,
                        creator: drop.creator,
                        image: drop.image,
                        price: drop.price,
                        currency: drop.currency,
                        description: `${drop.name} is currently live with ${drop.soldItems} of ${drop.totalItems} editions already claimed.`,
                        detailHref: `/drops`,
                        artistHref: `/artist/${drop.creator.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                      });
                      return;
                    }
                    setReminders((current) => ({ ...current, [drop.id]: !current[drop.id] }));
                  }}
                  className={`block w-full py-2.5 rounded-lg text-center font-medium transition-all ${
                    drop.isLive
                      ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
                      : 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/20'
                  }`}
                >
                  {drop.isLive ? 'Buy Now' : reminders[drop.id] ? 'Reminder Set' : 'Remind Me'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <HomeMarketplaceModal item={activeItem} mode="buy" isOpen={Boolean(activeItem)} onClose={() => setActiveItem(null)} />
    </section>
  );
}
