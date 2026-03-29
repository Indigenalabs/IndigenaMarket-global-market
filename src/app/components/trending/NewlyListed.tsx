'use client';

import { Sparkles, Clock, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { Eye, Heart } from 'lucide-react';

interface NewlyListedProps {
  limit?: number;
}

const newlyListed = [
  {
    id: 'new-1',
    title: 'Northern Lights Spirit',
    creator: 'ArcticVisions',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=400&fit=crop',
    price: 350,
    currency: 'INDI',
    likes: 45,
    views: 234,
    listedAt: '5 min ago',
    isAuction: true,
    auctionEnds: '2h 30m',
    isVerified: true
  },
  {
    id: 'new-2',
    title: 'Desert Rose Collection',
    creator: 'SouthwestJewelry',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
    price: 280,
    currency: 'INDI',
    likes: 32,
    views: 156,
    listedAt: '12 min ago',
    isAuction: false,
    isVerified: true
  },
  {
    id: 'new-3',
    title: 'Coastal Wolf Pack',
    creator: 'PacificNorthwest',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop',
    price: 520,
    currency: 'INDI',
    likes: 67,
    views: 389,
    listedAt: '18 min ago',
    isAuction: true,
    auctionEnds: '5h 45m',
    isVerified: false
  },
  {
    id: 'new-4',
    title: 'Prairie Thunder',
    creator: 'PlainsArtistry',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    price: 195,
    currency: 'INDI',
    likes: 23,
    views: 98,
    listedAt: '25 min ago',
    isAuction: false,
    isVerified: true
  },
  {
    id: 'new-5',
    title: 'Mountain Spirit Guide',
    creator: 'RockyMountain',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=400&fit=crop',
    price: 425,
    currency: 'INDI',
    likes: 41,
    views: 267,
    listedAt: '32 min ago',
    isAuction: true,
    auctionEnds: '8h 15m',
    isVerified: true
  },
  {
    id: 'new-6',
    title: 'River Otter Play',
    creator: 'WetlandsArt',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=400&h=400&fit=crop',
    price: 165,
    currency: 'INDI',
    likes: 19,
    views: 87,
    listedAt: '45 min ago',
    isAuction: false,
    isVerified: false
  }
];

export default function NewlyListed({ limit = 6 }: NewlyListedProps) {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-[#d4af37]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Newly Listed</h3>
            <p className="text-xs text-gray-400">Fresh drops from the community</p>
          </div>
        </div>
        <Link 
          href="/marketplace/new"
          className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {newlyListed.slice(0, limit).map((item) => (
          <Link 
            key={item.id}
            href={`/marketplace/item/${item.id}`}
            className="group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent opacity-60" />

              {/* New Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-[#d4af37] text-black text-xs font-bold rounded">
                <Zap size={10} />
                NEW
              </div>

              {/* Auction Badge */}
              {item.isAuction && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-[#DC143C] text-white text-xs font-medium rounded">
                  <Clock size={10} />
                  {item.auctionEnds}
                </div>
              )}

              {/* Verified Badge */}
              {item.isVerified && (
                <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-[#d4af37] flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Listed Time */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-xs text-white">
                {item.listedAt}
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <h4 className="text-white font-medium text-sm mb-1 truncate group-hover:text-[#d4af37] transition-colors">
                {item.title}
              </h4>
              <p className="text-[#d4af37] text-xs mb-2">{item.creator}</p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {item.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={12} />
                  {item.likes}
                </span>
              </div>

              {/* Price */}
              <div className="mt-2 pt-2 border-t border-[#d4af37]/10">
                <p className="text-[#d4af37] font-bold">{item.price} {item.currency}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
