'use client';

import { Star, Flame, TrendingUp, ArrowRight, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Eye, Heart } from 'lucide-react';
import { PlacementSectionHeader, placementPrimaryButtonClass, placementSecondaryButtonClass } from '../placements/PremiumPlacement';

interface FeaturedTrendingProps {
  timeFilter?: string;
}

const featuredItems = [
  {
    id: 'featured-1',
    title: 'Sacred Eagle Collection',
    creator: 'Thunderbird Arts',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=400&fit=crop',
    price: 850,
    currency: 'INDI',
    likes: 2341,
    views: 15600,
    sales: 89,
    change24h: +45.2,
    isVerified: true,
    sponsor: 'Heritage Arts Foundation',
    badge: 'Trending #1',
    promotionDaysLeft: 3,
    description: 'Limited edition eagle spirit artwork with traditional symbolism.'
  },
  {
    id: 'featured-2',
    title: 'Dreamweaver Series',
    creator: 'Navajo Masters',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
    price: 620,
    currency: 'INDI',
    likes: 1892,
    views: 12300,
    sales: 67,
    change24h: +32.8,
    isVerified: true,
    sponsor: 'Southwest Arts Council',
    badge: 'Hot Pick',
    promotionDaysLeft: 5,
    description: 'Contemporary interpretation of traditional dreamcatcher designs.'
  },
  {
    id: 'featured-3',
    title: 'Spirit Bear Totem',
    creator: 'Coastal Nations',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=400&fit=crop',
    price: 1200,
    currency: 'INDI',
    likes: 3156,
    views: 22100,
    sales: 45,
    change24h: +28.5,
    isVerified: true,
    sponsor: 'Pacific Northwest Arts',
    badge: 'Rising Star',
    promotionDaysLeft: 7,
    description: 'Hand-carved cedar totem representing strength and wisdom.'
  }
];

export default function FeaturedTrending({ timeFilter = '24h' }: FeaturedTrendingProps) {
  return (
    <div className="mb-8">
      <PlacementSectionHeader
        icon={Crown}
        title="Featured Trending"
        description={`Premium placements by verified sponsors in the ${timeFilter} window`}
        meta="Sponsored discovery lane"
        right={
          <Link href="/marketplace/promote" className="flex items-center gap-1 text-sm text-[#d4af37] transition-colors hover:text-[#f4e4a6]">
            Promote yours
            <ArrowRight size={14} />
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {featuredItems.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-xl border border-[#d4af37]/40 bg-[#141414] transition-all hover:border-[#d4af37] hover:shadow-lg hover:shadow-[#d4af37]/20"
          >
            <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
              <div className="inline-flex max-w-[68%] items-center gap-1.5 rounded-full border border-[#d4af37]/35 bg-[#0b0b0b]/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c] backdrop-blur-sm">
                <Sparkles size={10} />
                Sponsored
              </div>
              <div className="rounded-full bg-[#0a0a0a]/80 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                {item.promotionDaysLeft} days
              </div>
            </div>

            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full bg-[#7f1325]/90 px-2.5 py-1">
              <Flame size={12} className="text-white" />
              <span className="text-[11px] font-bold text-white">{item.badge}</span>
            </div>

            <div className="relative h-48 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
            </div>

            <div className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/8 px-2.5 py-1 text-[11px] text-[#d4af37]/80">
                  Sponsored by {item.sponsor}
                </span>
                {item.isVerified && (
                  <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/12 px-2.5 py-1 text-[11px] text-[#f3d57c]">
                    Verified creator
                  </span>
                )}
              </div>

              <h3 className="mb-1 text-base font-semibold text-white transition-colors group-hover:text-[#d4af37]">{item.title}</h3>

              <div className="mb-3 flex items-center gap-2">
                <img src={item.creatorAvatar} alt={item.creator} className="h-5 w-5 rounded-full object-cover" />
                <span className="text-sm text-[#d4af37]">{item.creator}</span>
              </div>

              <p className="mb-3 line-clamp-2 text-sm text-gray-400">{item.description}</p>

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {(item.views / 1000).toFixed(1)}K
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={14} />
                    {item.likes}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-400">
                  <TrendingUp size={14} />
                  +{item.change24h}%
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#d4af37]/10 pt-3">
                <div>
                  <p className="text-xs text-gray-500">Current Price</p>
                  <p className="text-xl font-bold text-[#d4af37]">{item.price} {item.currency}</p>
                </div>
                <Link
                  href={`/marketplace/item/${item.id}`}
                  className={placementPrimaryButtonClass}
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-gradient-to-r from-[#d4af37]/10 via-[#141414] to-[#DC143C]/10 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4af37]/20">
              <TrendingUp size={20} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="font-medium text-white">Get featured on Trending</p>
              <p className="text-sm text-gray-400">Reach 50,000+ daily visitors</p>
            </div>
          </div>
          <Link href="/marketplace/promote" className={placementSecondaryButtonClass}>
            Start Promotion
          </Link>
        </div>
      </div>
    </div>
  );
}

