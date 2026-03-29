'use client';

import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Flame, Award } from 'lucide-react';
import Link from 'next/link';

interface TopGainersLosersProps {
  limit?: number;
}

const gainers = [
  {
    id: 'gainer-1',
    title: 'Sacred Buffalo Spirit',
    creator: 'LakotaDreams',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
    price: 450,
    previousPrice: 250,
    change: +80.0,
    volume: 89,
    isHot: true
  },
  {
    id: 'gainer-2',
    title: 'Thunderbird Rising',
    creator: 'CoastalArtist',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop',
    price: 620,
    previousPrice: 420,
    change: +47.6,
    volume: 67,
    isHot: true
  },
  {
    id: 'gainer-3',
    title: 'Medicine Wheel',
    creator: 'PlainsElder',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop',
    price: 750,
    previousPrice: 500,
    change: +50.0,
    volume: 45,
    isHot: false
  },
  {
    id: 'gainer-4',
    title: 'Eagle Feather Ceremony',
    creator: 'HopiVision',
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=200&h=200&fit=crop',
    price: 520,
    previousPrice: 350,
    change: +48.6,
    volume: 34,
    isHot: false
  }
];

const losers = [
  {
    id: 'loser-1',
    title: 'Winter Solstice',
    creator: 'ArcticVisions',
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=200&h=200&fit=crop',
    price: 180,
    previousPrice: 220,
    change: -18.2,
    volume: 12
  },
  {
    id: 'loser-2',
    title: 'Desert Bloom',
    creator: 'SouthwestArt',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    price: 145,
    previousPrice: 175,
    change: -17.1,
    volume: 8
  },
  {
    id: 'loser-3',
    title: 'Forest Spirit',
    creator: 'WoodlandCrafts',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=200&h=200&fit=crop',
    price: 200,
    previousPrice: 240,
    change: -16.7,
    volume: 15
  }
];

export default function TopGainersLosers({ limit = 4 }: TopGainersLosersProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gainers */}
      <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Top Gainers</h3>
          </div>
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
            24h
          </span>
        </div>

        <div className="space-y-3">
          {gainers.slice(0, limit).map((item, index) => (
            <Link 
              key={item.id}
              href={`/marketplace/item/${item.id}`}
              className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors group"
            >
              <span className="text-[#d4af37] font-bold w-5">{index + 1}</span>
              <div className="relative">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                {item.isHot && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC143C] rounded-full flex items-center justify-center">
                    <Flame size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate group-hover:text-[#d4af37] transition-colors">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-xs">{item.creator}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-400 text-sm font-bold">
                  <ArrowUpRight size={14} />
                  +{item.change.toFixed(1)}%
                </div>
                <p className="text-[#d4af37] text-xs">{item.price} INDI</p>
              </div>
            </Link>
          ))}
        </div>

        <Link 
          href="/trending/gainers"
          className="flex items-center justify-center gap-1 w-full mt-4 py-2 text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
        >
          View all gainers
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Losers */}
      <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <TrendingDown size={18} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Top Losers</h3>
          </div>
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
            24h
          </span>
        </div>

        <div className="space-y-3">
          {losers.slice(0, limit).map((item, index) => (
            <Link 
              key={item.id}
              href={`/marketplace/item/${item.id}`}
              className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors group"
            >
              <span className="text-gray-500 font-bold w-5">{index + 1}</span>
              <img 
                src={item.image}
                alt={item.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate group-hover:text-[#d4af37] transition-colors">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-xs">{item.creator}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-red-400 text-sm font-bold">
                  <ArrowDownRight size={14} />
                  {item.change.toFixed(1)}%
                </div>
                <p className="text-[#d4af37] text-xs">{item.price} INDI</p>
              </div>
            </Link>
          ))}
        </div>

        <Link 
          href="/trending/losers"
          className="flex items-center justify-center gap-1 w-full mt-4 py-2 text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
        >
          View all losers
          <ArrowDownRight size={14} />
        </Link>
      </div>
    </div>
  );
}
