'use client';

import { Sparkles, ArrowRight, Crown } from 'lucide-react';

interface FeaturedBannerProps {
  pillar: string;
}

export default function FeaturedBanner({ pillar }: FeaturedBannerProps) {
  const featuredContent: Record<string, { title: string; subtitle: string; artist: string; image: string; cta: string; label?: string }> = {
    'digital-arts': {
      title: 'Sacred Geometry Collection',
      subtitle: 'Featured Digital Art Series',
      artist: 'ThunderVoice',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=300&fit=crop',
      cta: 'Explore Collection'
    },
    'physical-items': {
      title: 'Handcrafted Beadwork',
      subtitle: 'Traditional Lakota Patterns',
      artist: 'SilverNeedle',
      image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=300&fit=crop',
      cta: 'Shop Now'
    },
    courses: {
      title: 'Learn Indigenous Languages',
      subtitle: 'New Course Series Available',
      artist: 'ElderTeaches',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=300&fit=crop',
      cta: 'Start Learning'
    },
    freelancing: {
      title: 'Hire Indigenous Creatives',
      subtitle: 'Verified Artists & Designers',
      artist: 'CreativeHub',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=300&fit=crop',
      cta: 'Find Talent'
    },
    'cultural-tourism': {
      title: 'Walk With Indigenous Knowledge Keepers',
      subtitle: 'Featured Destination Banner',
      artist: 'Yolngu Sea Country Collective',
      image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1600&h=700&fit=crop',
      cta: 'Explore Featured Journey',
      label: 'Destination Highlight'
    }
  };

  const content = featuredContent[pillar] || featuredContent['digital-arts'];
  const isTourism = pillar === 'cultural-tourism';

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/40 group shadow-lg shadow-[#d4af37]/10">
      <div className={`relative ${isTourism ? 'h-60' : 'h-52'}`}>
        <img
          src={content.image}
          alt={content.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-[#d4af37] text-black text-xs font-bold rounded-full shadow">
          <Crown size={11} />
          Hero Banner · Sponsored
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm text-[#d4af37] text-xs rounded-full border border-[#d4af37]/30">
          <Sparkles size={10} />
          {content.label || 'Featured'}
        </div>

        <div className="absolute inset-0 flex items-center p-8">
          <div className="max-w-md">
            <p className="text-[#d4af37] text-sm font-medium mb-1">{content.subtitle}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{content.title}</h2>
            <p className="text-gray-300 text-xs mb-4">by {content.artist}</p>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#d4af37] text-black font-semibold rounded-full hover:bg-[#f4e4a6] transition-colors group/btn">
              {content.cta}
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
