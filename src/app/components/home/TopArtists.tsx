'use client';

import Link from 'next/link';
import { Star, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const topArtists = [
  {
    id: '1',
    name: 'LakotaDreams',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    sales: 1250,
    followers: 3420,
    isVerified: true,
    specialty: 'Digital Art'
  },
  {
    id: '2',
    name: 'WeavingWoman',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    sales: 890,
    followers: 2100,
    isVerified: true,
    specialty: 'Textiles'
  },
  {
    id: '3',
    name: 'CoastalArtist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    sales: 756,
    followers: 1890,
    isVerified: false,
    specialty: 'Paintings'
  },
  {
    id: '4',
    name: 'PlainsElder',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    sales: 634,
    followers: 1560,
    isVerified: true,
    specialty: 'Mixed Media'
  },
  {
    id: '5',
    name: 'HopiVision',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    sales: 521,
    followers: 1230,
    isVerified: true,
    specialty: 'Sculpture'
  },
];

export default function TopArtists() {
  const [followedArtists, setFollowedArtists] = useState<Record<string, boolean>>({});

  return (
    <section className="py-12 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              🔥 Top <span className="secondary-gradient">Artists</span>
            </h2>
            <p className="text-sm text-gray-500">Most successful creators this month · <span className="text-green-400/80">Organic Ranking</span></p>
          </div>
          <Link href="/artists" className="text-[#d4af37] text-sm hover:underline">
            View All Artists
          </Link>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topArtists.map((artist, index) => (
            <div 
              key={artist.id}
              className="group bg-[#141414] rounded-xl p-4 border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all hover:shadow-lg hover:shadow-[#d4af37]/5"
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                {artist.isVerified && (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#f4e4a6] to-[#d4af37] flex items-center justify-center shadow-lg">
                    <Star size={12} className="text-black fill-black" />
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="relative mb-3">
                <Link href={`/artist/${artist.id}`} className="block">
                  <img 
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-[#d4af37]/30 group-hover:border-[#d4af37] transition-colors"
                  />
                </Link>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#141414] flex items-center justify-center">
                  <TrendingUp size={12} className="text-green-500" />
                </div>
              </div>

              {/* Info */}
              <div className="text-center">
                <Link href={`/artist/${artist.id}`} className="mb-0.5 block truncate text-white font-medium hover:text-[#d4af37]">
                  {artist.name}
                </Link>
                <p className="text-xs text-gray-500 mb-2">{artist.specialty}</p>
                
                <div className="flex items-center justify-center gap-4 text-xs">
                  <div>
                    <span className="text-[#d4af37] font-semibold">{artist.sales}</span>
                    <span className="text-gray-500 block">Sales</span>
                  </div>
                  <div className="w-px h-6 bg-[#d4af37]/20" />
                  <div>
                    <span className="text-white font-semibold">{(artist.followers / 1000).toFixed(1)}K</span>
                    <span className="text-gray-500 block">Followers</span>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                type="button"
                onClick={() =>
                  setFollowedArtists((current) => ({
                    ...current,
                    [artist.id]: !current[artist.id]
                  }))
                }
                className="w-full mt-3 py-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-sm font-medium hover:bg-[#d4af37] hover:text-black transition-all"
              >
                {followedArtists[artist.id] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
