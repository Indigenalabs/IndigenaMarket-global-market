'use client';

import { Trophy, Medal, Award, Star, TrendingUp, ArrowRight, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  verified: boolean;
  specialty: string;
  reputation: number;
  contributions: number;
  badges: string[];
  change: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

const topContributors: LeaderboardUser[] = [
  {
    id: 'user-1',
    rank: 1,
    name: 'Maria Redfeather',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    verified: true,
    specialty: 'Master Beadworker',
    reputation: 15234,
    contributions: 456,
    badges: ['Top Contributor', 'Mentor', 'Influencer'],
    change: 'same'
  },
  {
    id: 'user-2',
    rank: 2,
    name: 'ThunderVoice',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    verified: true,
    specialty: 'Digital Artist',
    reputation: 12890,
    contributions: 389,
    badges: ['Rising Star', 'Creator'],
    change: 'up'
  },
  {
    id: 'user-3',
    rank: 3,
    name: 'Elena Rivers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    verified: true,
    specialty: 'Cultural Guide',
    reputation: 11567,
    contributions: 312,
    badges: ['Expert', 'Helper'],
    change: 'up'
  },
  {
    id: 'user-4',
    rank: 4,
    name: 'DesertRose',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    verified: false,
    specialty: 'Pottery Artist',
    reputation: 9823,
    contributions: 278,
    badges: ['Active Member'],
    change: 'down'
  },
  {
    id: 'user-5',
    rank: 5,
    name: 'MountainEagle',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    verified: true,
    specialty: 'Sculptor',
    reputation: 8756,
    contributions: 234,
    badges: ['Artist', 'Mentor'],
    change: 'same'
  }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown size={20} className="text-[#d4af37]" />;
    case 2:
      return <Medal size={20} className="text-gray-300" />;
    case 3:
      return <Award size={20} className="text-amber-600" />;
    default:
      return <span className="text-gray-500 font-bold w-6 text-center">{rank}</span>;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-[#d4af37]/20 to-transparent border-l-4 border-[#d4af37]';
    case 2:
      return 'bg-gradient-to-r from-gray-500/10 to-transparent border-l-4 border-gray-400';
    case 3:
      return 'bg-gradient-to-r from-amber-600/10 to-transparent border-l-4 border-amber-600';
    default:
      return 'hover:bg-[#1a1a1a]';
  }
};

export default function Leaderboard() {
  const currentUserRank = 47;
  const currentUserReputation = 2341;

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] via-[#f4e4a6] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Trophy size={18} className="text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Top Contributors</h3>
            <p className="text-xs text-gray-400">This month&apos;s community champions</p>
          </div>
        </div>
        <Link 
          href="/community?view=leaderboard"
          className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
        >
          Full ranking
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-6 py-4">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <img 
              src={topContributors[1].avatar}
              alt={topContributors[1].name}
              className="w-14 h-14 rounded-full object-cover border-4 border-gray-400"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-black text-xs font-bold">
              2
            </div>
          </div>
          <span className="text-white text-sm font-medium truncate max-w-[80px]">{topContributors[1].name}</span>
          <span className="text-gray-400 text-xs">{(topContributors[1].reputation / 1000).toFixed(1)}k pts</span>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center -mt-4">
          <div className="relative mb-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Crown size={24} className="text-[#d4af37]" />
            </div>
            <img 
              src={topContributors[0].avatar}
              alt={topContributors[0].name}
              className="w-20 h-20 rounded-full object-cover border-4 border-[#d4af37]"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center text-black text-sm font-bold">
              1
            </div>
          </div>
          <span className="text-white font-semibold truncate max-w-[100px]">{topContributors[0].name}</span>
          <span className="text-[#d4af37] text-sm">{(topContributors[0].reputation / 1000).toFixed(1)}k pts</span>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <img 
              src={topContributors[2].avatar}
              alt={topContributors[2].name}
              className="w-14 h-14 rounded-full object-cover border-4 border-amber-600"
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-black text-xs font-bold">
              3
            </div>
          </div>
          <span className="text-white text-sm font-medium truncate max-w-[80px]">{topContributors[2].name}</span>
          <span className="text-gray-400 text-xs">{(topContributors[2].reputation / 1000).toFixed(1)}k pts</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {topContributors.map((user) => (
          <div 
            key={user.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${getRankStyle(user.rank)}`}
          >
            {/* Rank */}
            <div className="flex-shrink-0">
              {getRankIcon(user.rank)}
            </div>

            {/* Avatar */}
            <img 
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{user.name}</span>
                {user.verified && (
                  <div className="w-4 h-4 rounded-full bg-[#d4af37] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-xs">{user.specialty}</p>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center justify-end gap-1 text-[#d4af37] text-sm font-bold whitespace-nowrap">
                <Star size={12} />
                {user.reputation >= 1000 ? `${(user.reputation / 1000).toFixed(1)}k` : user.reputation}
              </div>
              <p className="text-gray-500 text-xs whitespace-nowrap">{user.contributions} contrib</p>
            </div>

            {/* Change Indicator */}
            <div className="flex-shrink-0">
              {user.change === 'up' && <TrendingUp size={16} className="text-green-400" />}
              {user.change === 'down' && <TrendingUp size={16} className="text-red-400 rotate-180" />}
            </div>
          </div>
        ))}
      </div>

      {/* Current User Position */}
      <div className="mt-4 p-3 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 font-bold w-6">#{currentUserRank}</span>
          <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
            <span className="text-[#d4af37] font-bold">You</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm">Your Ranking</p>
            <p className="text-gray-400 text-xs">{currentUserReputation.toLocaleString()} reputation points</p>
          </div>
          <Link 
              href="/community?view=leaderboard"
            className="text-[#d4af37] text-sm hover:text-[#f4e4a6] transition-colors"
          >
            View
          </Link>
        </div>
      </div>

      {/* How to Earn */}
      <div className="mt-4 p-3 bg-[#0a0a0a] rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-[#d4af37]" />
          <span className="text-sm text-gray-300">How to earn reputation:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-[#141414] text-gray-400 rounded">Post content (+10)</span>
          <span className="px-2 py-1 bg-[#141414] text-gray-400 rounded">Get likes (+2)</span>
          <span className="px-2 py-1 bg-[#141414] text-gray-400 rounded">Help others (+5)</span>
          <span className="px-2 py-1 bg-[#141414] text-gray-400 rounded">Win challenges (+50)</span>
        </div>
      </div>
    </div>
  );
}
