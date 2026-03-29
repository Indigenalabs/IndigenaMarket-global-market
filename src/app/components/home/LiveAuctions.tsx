'use client';

import { useEffect, useState } from 'react';
import { Gavel, Clock, Zap } from 'lucide-react';
import HomeMarketplaceModal, { type HomeMarketplaceItem } from './HomeMarketplaceModal';
import { PlacementSectionHeader, placementSecondaryButtonClass } from '@/app/components/placements/PremiumPlacement';

interface Auction {
  id: string;
  title: string;
  artist: string;
  image: string;
  currentBid: number;
  currency: string;
  timeLeft: number;
  bidCount: number;
  watchers: number;
}

const auctions: Auction[] = [
  {
    id: '1',
    title: 'Eagle Spirit',
    artist: 'ThunderBird',
    image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=400&h=400&fit=crop',
    currentBid: 1250,
    currency: 'INDI',
    timeLeft: 7200,
    bidCount: 18,
    watchers: 234
  },
  {
    id: '2',
    title: 'Medicine Wheel',
    artist: 'LakotaVision',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    currentBid: 890,
    currency: 'INDI',
    timeLeft: 18000,
    bidCount: 12,
    watchers: 156
  },
  {
    id: '3',
    title: 'Wolf Guardian',
    artist: 'NavajoCraft',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    currentBid: 2100,
    currency: 'INDI',
    timeLeft: 3600,
    bidCount: 24,
    watchers: 312
  },
  {
    id: '4',
    title: 'Dreamcatcher',
    artist: 'OjibweArt',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    currentBid: 450,
    currency: 'INDI',
    timeLeft: 5400,
    bidCount: 8,
    watchers: 89
  }
];

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getUrgencyColor(seconds: number): string {
  if (seconds < 3600) return 'text-[#DC143C]';
  if (seconds < 7200) return 'text-[#d4af37]';
  return 'text-white';
}

export default function LiveAuctions() {
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>(Object.fromEntries(auctions.map((a) => [a.id, a.timeLeft])));
  const [activeItem, setActiveItem] = useState<HomeMarketplaceItem | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) updated[key]--;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-[#0a0a0a] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <PlacementSectionHeader
            icon={Gavel}
            title="Live Auctions"
            description="Bid before the window closes on these sponsored auction placements."
            meta="Sponsored auction lane"
            href="/auctions"
            hrefLabel="View all auctions"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {auctions.map((auction) => (
            <div
              key={auction.id}
              className="group overflow-hidden rounded-xl border border-[#DC143C]/10 bg-[#141414] transition-all hover:border-[#DC143C]/30 hover:shadow-xl hover:shadow-[#DC143C]/10"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={auction.image}
                  alt={auction.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#DC143C] px-2 py-1">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-medium text-white">LIVE</span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                  <Zap size={12} className="text-[#d4af37]" />
                  <span className="text-xs text-white">{auction.watchers}</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>

              <div className="p-4">
                <h3 className="mb-1 truncate text-lg font-bold text-white">{auction.title}</h3>
                <p className="mb-3 text-sm text-[#d4af37]">by {auction.artist}</p>

                <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#DC143C]/20 bg-[#DC143C]/10 p-2">
                  <Clock size={16} className={getUrgencyColor(timeLeft[auction.id] || 0)} />
                  <span className={`font-mono font-bold ${getUrgencyColor(timeLeft[auction.id] || 0)}`}>
                    {formatTime(timeLeft[auction.id] || 0)}
                  </span>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Current bid</p>
                    <p className="secondary-gradient text-xl font-bold">
                      {auction.currentBid} {auction.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Bids</p>
                    <p className="font-semibold text-white">{auction.bidCount}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveItem({
                        id: auction.id,
                        title: auction.title,
                        creator: auction.artist,
                        image: auction.image,
                        price: auction.currentBid,
                        currentBid: auction.currentBid,
                        currency: auction.currency,
                        description: `${auction.title} is live with ${auction.bidCount} bids and ${auction.watchers} watchers. Place a bid directly from the homepage.`,
                        isAuction: true,
                        bidIncrement: 50,
                        detailHref: '/auctions',
                        artistHref: `/artist/${auction.artist.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                      })
                    }
                    className="flex-1 rounded-lg bg-[#DC143C] py-2 font-medium text-white transition-colors hover:bg-[#ff1744]"
                  >
                    Place Bid
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveItem({
                        id: auction.id,
                        title: auction.title,
                        creator: auction.artist,
                        image: auction.image,
                        price: auction.currentBid,
                        currentBid: auction.currentBid + 50,
                        currency: auction.currency,
                        description: `Quick-bid ${auction.title} with a ${auction.currency} 50 increment from the homepage.`,
                        isAuction: true,
                        bidIncrement: 50,
                        detailHref: '/auctions',
                        artistHref: `/artist/${auction.artist.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                      })
                    }
                    className={placementSecondaryButtonClass}
                  >
                    +50
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <HomeMarketplaceModal item={activeItem} mode="bid" isOpen={Boolean(activeItem)} onClose={() => setActiveItem(null)} />
    </section>
  );
}
