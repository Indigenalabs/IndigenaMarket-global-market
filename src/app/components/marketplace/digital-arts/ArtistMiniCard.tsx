'use client';

import { useState, useEffect, useRef } from 'react';
import { X, BadgeCheck, MapPin, Heart, Eye, Star, ExternalLink, UserPlus, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface ArtistMiniCardProps {
  name: string;
  nation?: string;
  isVerified?: boolean;
  /** Position the card anchors to — caller passes the trigger ref */
  anchorRef?: React.RefObject<HTMLElement>;
  onClose: () => void;
}

// Mock per-artist data — in production this comes from /api/artists/:name
const ARTIST_PROFILES: Record<string, {
  bio: string;
  avatar: string;
  nation: string;
  totalSales: number;
  followers: number;
  topWorks: { id: string; title: string; image: string; price: number; currency: string }[];
  rating: number;
  joinedYear: number;
}> = {
  default: {
    bio: 'Indigenous digital artist preserving ancestral stories through modern creative tools.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
    nation: 'Lakota',
    totalSales: 42,
    followers: 318,
    rating: 4.8,
    joinedYear: 2022,
    topWorks: [
      { id: 'tw-1', title: 'Sacred Spirit', image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=80&h=80&fit=crop', price: 250, currency: 'INDI' },
      { id: 'tw-2', title: 'Ancestors Calling', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=80&h=80&fit=crop', price: 180, currency: 'INDI' },
      { id: 'tw-3', title: 'Buffalo Dream', image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=80&h=80&fit=crop', price: 320, currency: 'INDI' },
    ],
  },
};

function getArtistData(name: string) {
  return ARTIST_PROFILES[name] ?? { ...ARTIST_PROFILES.default, nation: 'Indigenous Nation' };
}

export default function ArtistMiniCard({ name, isVerified = false, onClose }: ArtistMiniCardProps) {
  const [followed, setFollowed] = useState(false);
  const artist = getArtistData(name);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={cardRef}
        className="relative w-full max-w-sm bg-[#141414] border border-[#d4af37]/20 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header banner */}
        <div
          className="h-20 w-full"
          style={{ background: 'linear-gradient(135deg, #1a1000 0%, #3d2a00 50%, #1a1000 100%)' }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Avatar — overlapping banner */}
        <div className="px-5 pb-4 -mt-10">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-[#141414] mb-3 shadow-lg">
            <img src={artist.avatar} alt={name} className="w-full h-full object-cover" />
          </div>

          {/* Name + badges */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-lg leading-tight">{name}</span>
                {isVerified && <BadgeCheck size={16} className="text-[#d4af37]" />}
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-sm mt-0.5">
                <MapPin size={12} />
                <span>{artist.nation}</span>
              </div>
            </div>

            {/* Follow button */}
            <button
              onClick={() => setFollowed(!followed)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                followed
                  ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30'
                  : 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
              }`}
            >
              {followed ? <UserCheck size={14} /> : <UserPlus size={14} />}
              {followed ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Bio */}
          <p className="text-gray-400 text-sm leading-relaxed mb-4">{artist.bio}</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#0a0a0a] rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-[#d4af37] font-bold text-base">
                <Heart size={13} />
                {artist.followers.toLocaleString()}
              </div>
              <p className="text-gray-500 text-xs mt-0.5">Followers</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-white font-bold text-base">
                <Eye size={13} />
                {artist.totalSales}
              </div>
              <p className="text-gray-500 text-xs mt-0.5">Sales</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold text-base">
                <Star size={13} fill="currentColor" />
                {artist.rating}
              </div>
              <p className="text-gray-500 text-xs mt-0.5">Rating</p>
            </div>
          </div>

          {/* Top 3 works */}
          <div className="mb-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Top Works</p>
            <div className="grid grid-cols-3 gap-2">
              {artist.topWorks.map((work) => (
                <div key={work.id} className="group relative aspect-square rounded-lg overflow-hidden bg-[#0a0a0a] cursor-pointer">
                  <img src={work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-semibold truncate">{work.price} {work.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full profile link */}
          <Link
            href={`/profile/${encodeURIComponent(name)}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-xl text-[#d4af37] text-sm font-medium hover:bg-[#d4af37]/10 transition-colors"
            onClick={onClose}
          >
            <ExternalLink size={14} />
            View Full Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
