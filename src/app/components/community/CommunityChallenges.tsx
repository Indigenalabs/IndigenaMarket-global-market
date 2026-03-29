'use client';

import { useState } from 'react';
import { Trophy, Target, Clock, Users, ArrowRight, Flame, Star, Zap, Crown, Gift } from 'lucide-react';
import Link from 'next/link';

interface Challenge {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'art' | 'skill' | 'community';
  prize: string;
  prizeValue: number;
  participants: number;
  endDate: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sponsor?: string;
  isFeatured?: boolean;
  progress?: number;
  joined?: boolean;
}

const challenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: '30-Day Beadwork Challenge',
    description: 'Create a new beadwork piece every day for 30 days. Share your progress and win amazing prizes!',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=300&fit=crop',
    type: 'art',
    prize: '1st Place: 1000 INDI + Featured Spot',
    prizeValue: 1000,
    participants: 456,
    endDate: '15 days left',
    difficulty: 'Medium',
    sponsor: 'Heritage Arts Foundation',
    isFeatured: true,
    progress: 45,
    joined: true
  },
  {
    id: 'challenge-2',
    title: 'Digital Art Masterpiece',
    description: 'Create digital art that blends traditional Indigenous symbols with modern aesthetics.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=300&fit=crop',
    type: 'art',
    prize: 'Grand Prize: 2000 INDI',
    prizeValue: 2000,
    participants: 234,
    endDate: '7 days left',
    difficulty: 'Hard',
    sponsor: 'Native Arts Council',
    isFeatured: true
  },
  {
    id: 'challenge-3',
    title: 'Community Helper Challenge',
    description: 'Help 5 new members of the community by answering their questions and providing feedback.',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=300&fit=crop',
    type: 'community',
    prize: 'Helper Badge + 500 INDI',
    prizeValue: 500,
    participants: 189,
    endDate: 'Ongoing',
    difficulty: 'Easy'
  },
  {
    id: 'challenge-4',
    title: 'Language Preservation',
    description: 'Learn and share 10 words in an endangered Indigenous language. Record pronunciation!',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=300&fit=crop',
    type: 'skill',
    prize: 'Cultural Keeper Badge + 750 INDI',
    prizeValue: 750,
    participants: 312,
    endDate: '21 days left',
    difficulty: 'Medium',
    sponsor: 'Tribal Education Initiative'
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'text-green-400 bg-green-500/10';
    case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
    case 'Hard': return 'text-red-400 bg-red-500/10';
    default: return 'text-gray-400 bg-gray-500/10';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'art': return <Star size={14} />;
    case 'skill': return <Zap size={14} />;
    case 'community': return <Users size={14} />;
    default: return <Target size={14} />;
  }
};

export default function CommunityChallenges() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'art' | 'skill' | 'community'>('all');
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set(['challenge-1']));

  const filteredChallenges = challenges.filter(c => 
    activeFilter === 'all' || c.type === activeFilter
  );

  const handleJoin = (challengeId: string) => {
    setJoinedChallenges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(challengeId)) {
        newSet.delete(challengeId);
      } else {
        newSet.add(challengeId);
      }
      return newSet;
    });
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] via-[#f4e4a6] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Trophy size={18} className="text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Community Challenges</h3>
            <p className="text-xs text-gray-400">Compete, create, and win rewards</p>
          </div>
        </div>
        <Link 
          href="/community?view=challenges"
          className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'art', 'skill', 'community'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              activeFilter === filter
                ? 'bg-[#d4af37] text-black'
                : 'bg-[#141414] text-gray-400 hover:text-white border border-[#d4af37]/20'
            }`}
          >
            {filter === 'all' ? 'All' : filter}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChallenges.map((challenge) => (
          <div 
            key={challenge.id}
            className={`relative bg-[#141414] rounded-xl overflow-hidden border ${
              challenge.isFeatured ? 'border-[#d4af37]/40' : 'border-[#d4af37]/10'
            } hover:border-[#d4af37]/30 transition-all group`}
          >
            {/* Featured Badge */}
            {challenge.isFeatured && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#d4af37] text-black text-xs font-bold rounded">
                <Crown size={10} />
                FEATURED
              </div>
            )}

            {/* Image */}
            <div className="relative h-32 overflow-hidden">
              <img 
                src={challenge.image}
                alt={challenge.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
              
              {/* Type Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white">
                {getTypeIcon(challenge.type)}
                <span className="capitalize">{challenge.type}</span>
              </div>

              {/* Difficulty */}
              <div className={`absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Sponsor */}
              {challenge.sponsor && (
                <p className="text-xs text-[#d4af37]/70 mb-1">
                  Sponsored by {challenge.sponsor}
                </p>
              )}

              <h4 className="text-white font-semibold mb-2 group-hover:text-[#d4af37] transition-colors">
                {challenge.title}
              </h4>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{challenge.description}</p>

              {/* Progress Bar (if joined) */}
              {joinedChallenges.has(challenge.id) && challenge.progress && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Your Progress</span>
                    <span className="text-[#d4af37]">{challenge.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] rounded-full transition-all"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Prize */}
              <div className="flex items-center gap-2 mb-3 p-2 bg-[#d4af37]/5 rounded-lg">
                <Gift size={16} className="text-[#d4af37]" />
                <span className="text-sm text-[#d4af37]">{challenge.prize}</span>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {challenge.participants} joined
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {challenge.endDate}
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={() => handleJoin(challenge.id)}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  joinedChallenges.has(challenge.id)
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black hover:shadow-lg hover:shadow-[#d4af37]/30'
                }`}
              >
                {joinedChallenges.has(challenge.id) ? 'Joined ✓' : 'Join Challenge'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Challenge CTA */}
      <div className="mt-4 p-4 bg-gradient-to-r from-[#d4af37]/10 via-[#141414] to-[#DC143C]/10 rounded-xl border border-[#d4af37]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
              <Flame size={20} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="text-white font-medium">Create a Challenge</p>
              <p className="text-gray-400 text-sm">Engage your community with fun contests</p>
            </div>
          </div>
          <Link 
            href="/community?view=challenges&action=create"
            className="px-4 py-2 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] text-sm font-medium rounded-lg hover:bg-[#d4af37]/30 transition-colors"
          >
            Create Challenge
          </Link>
        </div>
      </div>
    </div>
  );
}
