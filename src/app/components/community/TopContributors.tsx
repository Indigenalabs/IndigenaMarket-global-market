'use client';

import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Contributor {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  verified: boolean;
  contributions: number;
  change: 'up' | 'down' | 'same';
}

const topContributors: Contributor[] = [
  {
    id: 'user-1',
    rank: 1,
    name: 'Maria Redfeather',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    verified: true,
    contributions: 456,
    change: 'same'
  },
  {
    id: 'user-2',
    rank: 2,
    name: 'ThunderVoice',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    verified: true,
    contributions: 389,
    change: 'up'
  },
  {
    id: 'user-3',
    rank: 3,
    name: 'Elena Rivers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    verified: true,
    contributions: 312,
    change: 'up'
  },
  {
    id: 'user-4',
    rank: 4,
    name: 'DesertRose',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    verified: false,
    contributions: 278,
    change: 'down'
  },
  {
    id: 'user-5',
    rank: 5,
    name: 'MountainEagle',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    verified: true,
    contributions: 234,
    change: 'same'
  }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy size={14} className="text-[#d4af37]" />;
    case 2:
      return <Medal size={14} className="text-gray-300" />;
    case 3:
      return <Award size={14} className="text-amber-600" />;
    default:
      return <span className="text-gray-500 text-xs font-bold w-4 text-center">{rank}</span>;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-[#d4af37]/10 border-[#d4af37]/30';
    case 2:
      return 'bg-gray-500/5 border-gray-400/20';
    case 3:
      return 'bg-amber-600/5 border-amber-600/20';
    default:
      return 'bg-transparent border-transparent hover:bg-[#1a1a1a]';
  }
};

export default function TopContributors() {
  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Trophy size={18} className="text-black" />
          </div>
          <h3 className="text-white font-semibold">Top Contributors</h3>
        </div>
        <Link 
            href="/community?view=leaderboard"
          className="text-[#d4af37] text-xs hover:underline"
        >
          View All
        </Link>
      </div>

      {/* List */}
      <div className="space-y-2">
        {topContributors.map((user) => (
          <div 
            key={user.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${getRankStyle(user.rank)}`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-6 flex justify-center">
              {getRankIcon(user.rank)}
            </div>

            {/* Avatar */}
            <img 
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-white text-sm font-medium truncate">{user.name}</span>
                {user.verified && (
                  <div className="w-3 h-3 rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0">
                    <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Contributions */}
            <div className="flex items-center gap-1 text-gray-400 text-xs flex-shrink-0">
              <span>{user.contributions}</span>
              {user.change === 'up' && <TrendingUp size={12} className="text-green-400" />}
              {user.change === 'down' && <TrendingUp size={12} className="text-red-400 rotate-180" />}
            </div>
          </div>
        ))}
      </div>

      {/* Your Rank */}
      <div className="mt-3 pt-3 border-t border-[#d4af37]/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Your rank: <span className="text-[#d4af37] font-bold">#47</span></span>
          <span className="text-gray-500 text-xs">234 contributions</span>
        </div>
      </div>
    </div>
  );
}
