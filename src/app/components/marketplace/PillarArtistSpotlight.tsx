'use client';

import Link from 'next/link';
import { Star, Award, MapPin, ArrowRight } from 'lucide-react';

interface PillarArtistSpotlightProps {
  pillar: string;
}

export default function PillarArtistSpotlight({ pillar }: PillarArtistSpotlightProps) {
  const artists: Record<string, { name: string; avatar: string; specialty: string; works: number; sales: string }> = {
    'digital-arts': {
      name: 'ThunderVoice',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      specialty: 'Digital Illustration',
      works: 47,
      sales: '234'
    },
    'physical-items': {
      name: 'Maria Redfeather',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      specialty: 'Traditional Beadwork',
      works: 32,
      sales: '189'
    },
    'courses': {
      name: 'Dr. Sarah Whitehorse',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      specialty: 'Language Preservation',
      works: 12,
      sales: '1.2K'
    },
    'freelancing': {
      name: 'James Eagle',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      specialty: 'Graphic Design',
      works: 89,
      sales: '456'
    },
    'cultural-tourism': {
      name: 'Elena Rivers',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      specialty: 'Cultural Guide',
      works: 24,
      sales: '312'
    }
  };

  const artist = artists[pillar] || artists['digital-arts'];

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-[#141414] to-[#1a1a1a] rounded-xl border border-[#d4af37]/20">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <img 
            src={artist.avatar}
            alt={artist.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#d4af37]"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center">
            <Award size={14} className="text-black" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{artist.name}</h3>
            <span className="px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-xs rounded-full">⭐ SPOTLIGHT</span>
          </div>
          <p className="text-[#d4af37] text-sm mb-2">{artist.specialty}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{artist.works} Works</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>{artist.sales} Sales</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/profile/${encodeURIComponent(artist.name)}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all"
        >
          View Profile
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
