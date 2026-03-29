'use client';

import { Gem, Sparkles, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Eye, Heart, Clock } from 'lucide-react';

interface UnderpricedGemsProps {
  limit?: number;
}

const underpricedGems = [
  {
    id: 'gem-1',
    title: 'Ancient Wisdom Keeper',
    creator: 'ElderArts',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    price: 180,
    estimatedValue: 450,
    currency: 'INDI',
    discount: '60%',
    likes: 234,
    views: 1200,
    reason: 'Below artist average',
    timeLeft: '4h 30m',
    isAuction: true,
    rarity: 'Rare'
  },
  {
    id: 'gem-2',
    title: 'Spirit Guide Vision',
    creator: 'VisionaryCrafts',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    price: 220,
    estimatedValue: 500,
    currency: 'INDI',
    discount: '56%',
    likes: 189,
    views: 890,
    reason: 'High engagement, low price',
    timeLeft: '12h',
    isAuction: true,
    rarity: 'Epic'
  },
  {
    id: 'gem-3',
    title: 'Traditional Healing',
    creator: 'MedicineArts',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop',
    price: 150,
    estimatedValue: 350,
    currency: 'INDI',
    discount: '57%',
    likes: 156,
    views: 678,
    reason: 'Undervalued collection',
    timeLeft: '2h 15m',
    isAuction: false,
    rarity: 'Uncommon'
  },
  {
    id: 'gem-4',
    title: 'Sacred Earth Connection',
    creator: 'EarthKeepers',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=400&fit=crop',
    price: 195,
    estimatedValue: 420,
    currency: 'INDI',
    discount: '54%',
    likes: 267,
    views: 1450,
    reason: 'Rising artist',
    timeLeft: '6h 45m',
    isAuction: true,
    rarity: 'Rare'
  }
];

export default function UnderpricedGems({ limit = 4 }: UnderpricedGemsProps) {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] via-[#f4e4a6] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Gem size={18} className="text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Underpriced Gems</h3>
            <p className="text-xs text-gray-400">AI-detected value opportunities</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-[#d4af37] bg-[#d4af37]/10 px-2 py-1 rounded-full">
            <Sparkles size={12} />
            Algorithm Powered
          </div>
          <Link 
            href="/marketplace/gems"
            className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {underpricedGems.slice(0, limit).map((item) => (
          <Link 
            key={item.id}
            href={`/marketplace/item/${item.id}`}
            className="group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all hover:shadow-lg hover:shadow-[#d4af37]/10"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent opacity-60" />

              {/* Rarity Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#d4af37] text-black text-xs font-bold rounded">
                {item.rarity}
              </div>

              {/* Discount Badge */}
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1">
                <TrendingUp size={10} />
                {item.discount} off
              </div>

              {/* Auction Badge */}
              {item.isAuction && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-[#DC143C] text-white text-xs font-medium rounded">
                  <Clock size={10} />
                  {item.timeLeft}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Reason */}
              <div className="flex items-center gap-1 mb-2">
                <AlertCircle size={12} className="text-[#d4af37]" />
                <span className="text-xs text-[#d4af37]">{item.reason}</span>
              </div>

              <h4 className="text-white font-medium text-sm mb-1 truncate group-hover:text-[#d4af37] transition-colors">
                {item.title}
              </h4>

              {/* Creator */}
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src={item.creatorAvatar}
                  alt={item.creator}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="text-xs text-gray-400">{item.creator}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {item.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={12} />
                  {item.likes}
                </span>
              </div>

              {/* Price Comparison */}
              <div className="pt-3 border-t border-[#d4af37]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Current</p>
                    <p className="text-[#d4af37] font-bold">{item.price} INDI</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Est. Value</p>
                    <p className="text-gray-400 text-sm line-through">{item.estimatedValue} INDI</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <AlertCircle size={12} />
        <span>Estimated values are algorithmic predictions and not financial advice. DYOR.</span>
      </div>
    </div>
  );
}
