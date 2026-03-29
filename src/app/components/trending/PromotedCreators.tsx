'use client';

import { Crown, TrendingUp, Users, ArrowRight, Star, BadgeCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PlacementPill, PlacementSponsorRow, placementPrimaryButtonClass } from '../placements/PremiumPlacement';

interface PromotedCreatorsProps {
  limit?: number;
}

const promotedCreators = [
  {
    id: 'promo-creator-1',
    name: 'Sacred Earth Designs',
    handle: '@sacredearth',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=200&fit=crop',
    bio: 'Contemporary Indigenous art blending traditional and modern techniques.',
    followers: '45.2K',
    sales: 1234,
    items: 89,
    rating: 4.9,
    verification: 'Platinum',
    sponsor: 'Native Arts Alliance',
    promotionDaysLeft: 5,
    featuredItem: {
      title: 'Spirit Wolf',
      price: 450,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop'
    }
  },
  {
    id: 'promo-creator-2',
    name: 'Coastal Dreams Studio',
    handle: '@coastaldreams',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=200&fit=crop',
    bio: 'Pacific Northwest Indigenous art and carvings.',
    followers: '28.7K',
    sales: 892,
    items: 56,
    rating: 4.8,
    verification: 'Gold',
    sponsor: 'PNW Arts Council',
    promotionDaysLeft: 3,
    featuredItem: {
      title: 'Orca Spirit',
      price: 680,
      image: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=200&h=200&fit=crop'
    }
  }
];

export default function PromotedCreators({ limit = 2 }: PromotedCreatorsProps) {
  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/30 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#d4af37]/10 to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#d4af37]" />
          <h3 className="text-sm font-bold text-white">Promoted Creators</h3>
        </div>
        <PlacementPill icon={Crown}>Sponsored</PlacementPill>
      </div>

      {/* Creators */}
      <div className="divide-y divide-[#d4af37]/10">
        {promotedCreators.slice(0, limit).map((creator) => (
          <div key={creator.id} className="p-4">
            {/* Cover */}
            <div className="relative h-20 rounded-lg overflow-hidden mb-3">
              <img 
                src={creator.coverImage}
                alt={creator.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />

              <div className="absolute left-2 top-2">
                <PlacementPill icon={Crown}>Featured</PlacementPill>
              </div>
              <div className="absolute top-2 right-2 rounded-full bg-[#DC143C] px-2 py-0.5 text-xs font-medium text-white">
                {creator.promotionDaysLeft} days
              </div>
            </div>

            {/* Avatar & Info */}
            <div className="relative -mt-8 mb-3 flex items-end justify-between">
              <div className="relative">
                <img 
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-[#141414]"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#d4af37] rounded-full flex items-center justify-center">
                  <BadgeCheck size={12} className="text-black" />
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/20 rounded-lg">
                <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
                <span className="text-[#d4af37] text-sm font-bold">{creator.rating}</span>
              </div>
            </div>

            {/* Name & Handle */}
            <h4 className="text-white font-semibold">{creator.name}</h4>
            <p className="text-xs text-gray-400 mb-2">{creator.handle}</p>

            <PlacementSponsorRow sponsor={creator.sponsor} right={<span className="text-[11px] text-gray-500">Creator rail</span>} />

            {/* Bio */}
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">{creator.bio}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {creator.followers}
              </span>
              <span>{creator.sales} sales</span>
              <span>{creator.items} items</span>
            </div>

            {/* Featured Item */}
            <div className="bg-[#0a0a0a] rounded-lg p-2 mb-3">
              <p className="text-xs text-gray-500 mb-1">Featured Item</p>
              <div className="flex items-center gap-2">
                <img 
                  src={creator.featuredItem.image}
                  alt={creator.featuredItem.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{creator.featuredItem.title}</p>
                  <p className="text-[#d4af37] text-sm font-bold">{creator.featuredItem.price} INDI</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link 
              href={`/creator/${creator.id}`}
              className={`${placementPrimaryButtonClass} w-full text-sm`}
            >
              View Profile
              <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      {/* Promote CTA */}
      <div className="px-4 py-3 bg-[#d4af37]/5 border-t border-[#d4af37]/10">
        <Link 
          href="/creator/promote"
          className="flex items-center justify-center gap-1 text-xs text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
        >
          Promote your profile
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

