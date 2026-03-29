'use client';

import { useState } from 'react';
import { Award, Trophy, Star, Zap, Target, Crown, Medal, Flame, Gem, Heart, Users, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earned: boolean;
  earnedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface KarmaLevel {
  level: number;
  title: string;
  points: number;
  nextLevel: number;
  progress: number;
}

const badges: Badge[] = [
  {
    id: 'badge-1',
    name: 'First Steps',
    description: 'Created your first post',
    icon: <Star size={16} />,
    color: 'from-gray-400 to-gray-600',
    earned: true,
    earnedDate: '2024-01-15',
    rarity: 'common'
  },
  {
    id: 'badge-2',
    name: 'Rising Star',
    description: 'Reached 100 followers',
    icon: <Zap size={16} />,
    color: 'from-[#d4af37] to-[#b8941f]',
    earned: true,
    earnedDate: '2024-02-01',
    rarity: 'rare'
  },
  {
    id: 'badge-3',
    name: 'Community Champion',
    description: 'Helped 50 community members',
    icon: <Heart size={16} />,
    color: 'from-[#DC143C] to-red-600',
    earned: true,
    earnedDate: '2024-02-10',
    rarity: 'rare'
  },
  {
    id: 'badge-4',
    name: 'Trendsetter',
    description: 'Had a post trend #1',
    icon: <TrendingUp size={16} />,
    color: 'from-purple-400 to-purple-600',
    earned: true,
    earnedDate: '2024-02-15',
    rarity: 'epic'
  },
  {
    id: 'badge-5',
    name: 'Master Artisan',
    description: 'Sold 50 artworks',
    icon: <Gem size={16} />,
    color: 'from-emerald-400 to-emerald-600',
    earned: false,
    rarity: 'epic'
  },
  {
    id: 'badge-6',
    name: 'Legend',
    description: 'Reached 10,000 karma points',
    icon: <Crown size={16} />,
    color: 'from-[#d4af37] via-[#f4e4a6] to-[#d4af37]',
    earned: false,
    rarity: 'legendary'
  }
];

const karmaLevel: KarmaLevel = {
  level: 12,
  title: 'Culture Bearer',
  points: 3450,
  nextLevel: 5000,
  progress: 69
};

const awards = [
  { id: 1, name: 'Helpful', icon: <Heart size={12} />, count: 234, color: 'text-red-400' },
  { id: 2, name: 'Insightful', icon: <Target size={12} />, count: 189, color: 'text-blue-400' },
  { id: 3, name: 'Creative', icon: <Zap size={12} />, count: 156, color: 'text-yellow-400' },
  { id: 4, name: 'Inspiring', icon: <Flame size={12} />, count: 123, color: 'text-orange-400' }
];

export default function ReputationSystem() {
  const [showAllBadges, setShowAllBadges] = useState(false);

  const earnedBadges = badges.filter(b => b.earned);
  const unearnedBadges = badges.filter(b => !b.earned);
  const displayBadges = showAllBadges ? badges : earnedBadges.slice(0, 4);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-400';
      case 'rare':
        return 'text-blue-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-[#d4af37]';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Trophy size={18} className="text-black" />
          </div>
          <h3 className="text-white font-semibold">Reputation</h3>
        </div>
        <Link 
          href="/community/reputation"
          className="text-[#d4af37] text-sm hover:underline flex items-center gap-1"
        >
          View All
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Karma Level */}
      <div className="bg-gradient-to-r from-[#d4af37]/10 to-[#DC143C]/10 rounded-xl p-4 mb-5 border border-[#d4af37]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Lvl {karmaLevel.level}</span>
            <span className="text-[#d4af37] font-medium">• {karmaLevel.title}</span>
          </div>
          <span className="text-gray-400 text-sm">{karmaLevel.points.toLocaleString()} pts</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#d4af37] to-[#DC143C] rounded-full transition-all duration-500"
            style={{ width: `${karmaLevel.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">Level {karmaLevel.level}</span>
          <span className="text-xs text-gray-500">{karmaLevel.progress}% to Level {karmaLevel.level + 1}</span>
        </div>
      </div>

      {/* Awards Received */}
      <div className="mb-5">
        <h4 className="text-gray-400 text-sm mb-3">Awards Received</h4>
        <div className="flex items-center gap-3">
          {awards.map((award) => (
            <div 
              key={award.id}
              className="flex items-center gap-1.5 bg-[#0a0a0a] rounded-full px-3 py-1.5"
              title={award.name}
            >
              <span className={award.color}>{award.icon}</span>
              <span className="text-white text-sm font-medium">{award.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-gray-400 text-sm">Badges</h4>
          <span className="text-xs text-[#d4af37]">{earnedBadges.length}/{badges.length} Earned</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {displayBadges.map((badge) => (
            <button
              key={badge.id}
              className={`group relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all ${
                badge.earned 
                  ? 'bg-gradient-to-br ' + badge.color + ' hover:scale-105' 
                  : 'bg-[#0a0a0a] opacity-50 grayscale'
              }`}
              title={badge.description}
            >
              <div className={`mb-1 ${badge.earned ? 'text-white' : 'text-gray-500'}`}>
                {badge.icon}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight ${badge.earned ? 'text-white' : 'text-gray-500'}`}>
                {badge.name}
              </span>
              
              {/* Rarity Indicator */}
              {badge.earned && (
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center ${getRarityColor(badge.rarity)}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black rounded-lg text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="font-medium">{badge.name}</p>
                <p className="text-gray-400">{badge.description}</p>
                {badge.earnedDate && (
                  <p className="text-[#d4af37] mt-1">Earned {badge.earnedDate}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Show More/Less */}
        <button 
          onClick={() => setShowAllBadges(!showAllBadges)}
          className="w-full mt-3 py-2 text-[#d4af37] text-sm hover:bg-[#d4af37]/5 rounded-lg transition-colors"
        >
          {showAllBadges ? 'Show Less' : `Show All Badges (${badges.length})`}
        </button>
      </div>

      {/* Next Badge Progress */}
      <div className="mt-5 pt-4 border-t border-[#d4af37]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0a0a0a] rounded-lg flex items-center justify-center opacity-50 grayscale">
            <Gem size={20} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Master Artisan</p>
            <p className="text-gray-500 text-xs">38/50 artworks sold</p>
            <div className="mt-1 h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
              <div className="w-[76%] h-full bg-gradient-to-r from-[#d4af37] to-[#DC143C] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
