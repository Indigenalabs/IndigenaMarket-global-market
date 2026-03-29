'use client';

import { Star, TrendingUp, ArrowRight, Award, Zap } from 'lucide-react';
import Link from 'next/link';

interface RisingStarsProps {
  limit?: number;
}

const risingStars = [
  {
    id: 'rising-1',
    name: 'Northern Lights Studio',
    handle: '@northernlights',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=200&fit=crop',
    specialty: 'Arctic Indigenous Art',
    followers: '2.3K',
    sales: 89,
    growth: '+245%',
    items: 24,
    featuredWork: {
      title: 'Aurora Spirit',
      price: 380,
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&h=200&fit=crop'
    },
    badge: 'Trending'
  },
  {
    id: 'rising-2',
    name: 'Desert Bloom Collective',
    handle: '@desertbloom',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=200&fit=crop',
    specialty: 'Southwest Jewelry',
    followers: '1.8K',
    sales: 67,
    growth: '+198%',
    items: 18,
    featuredWork: {
      title: 'Turquoise Dreams',
      price: 295,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&h=200&fit=crop'
    },
    badge: 'Rising'
  },
  {
    id: 'rising-3',
    name: 'Pacific Wave Arts',
    handle: '@pacificwave',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=200&fit=crop',
    specialty: 'Coastal Carvings',
    followers: '3.1K',
    sales: 156,
    growth: '+167%',
    items: 42,
    featuredWork: {
      title: 'Ocean Spirit',
      price: 520,
      image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop'
    },
    badge: 'Hot'
  },
  {
    id: 'rising-4',
    name: 'Prairie Wind Designs',
    handle: '@prairiewind',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=200&fit=crop',
    specialty: 'Plains Beadwork',
    followers: '1.2K',
    sales: 45,
    growth: '+134%',
    items: 15,
    featuredWork: {
      title: 'Wind Dancer',
      price: 225,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
    },
    badge: 'New'
  }
];

export default function RisingStars({ limit = 4 }: RisingStarsProps) {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Rising Stars</h3>
            <p className="text-xs text-gray-400">New creators trending up fast</p>
          </div>
        </div>
        <Link 
          href="/creators/rising"
          className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {risingStars.slice(0, limit).map((creator) => (
          <Link 
            key={creator.id}
            href={`/creator/${creator.id}`}
            className="group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all"
          >
            {/* Cover */}
            <div className="relative h-20 overflow-hidden">
              <img 
                src={creator.coverImage}
                alt={creator.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#d4af37] text-black text-xs font-bold rounded">
                {creator.badge}
              </div>

              {/* Growth */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                <TrendingUp size={10} />
                {creator.growth}
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              {/* Avatar */}
              <div className="relative -mt-6 mb-3 flex items-end justify-between">
                <img 
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full object-cover border-4 border-[#141414]"
                />
                <div className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/20 rounded-lg">
                  <Award size={12} className="text-[#d4af37]" />
                  <span className="text-[#d4af37] text-xs font-bold">New</span>
                </div>
              </div>

              {/* Name */}
              <h4 className="text-white font-semibold text-sm mb-0.5">{creator.name}</h4>
              <p className="text-xs text-gray-400 mb-2">{creator.handle}</p>
              <p className="text-xs text-[#d4af37] mb-3">{creator.specialty}</p>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span>{creator.followers} followers</span>
                <span>{creator.sales} sales</span>
              </div>

              {/* Featured Work */}
              <div className="bg-[#0a0a0a] rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">Featured Work</p>
                <div className="flex items-center gap-2">
                  <img 
                    src={creator.featuredWork.image}
                    alt={creator.featuredWork.title}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{creator.featuredWork.title}</p>
                    <p className="text-[#d4af37] text-xs font-bold">{creator.featuredWork.price} INDI</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
