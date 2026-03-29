'use client';

import { useState } from 'react';
import { Target, Check, Clock, Zap, Award, Gift, ChevronRight, Flame, Star } from 'lucide-react';
import Link from 'next/link';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  reward: {
    type: 'karma' | 'badge' | 'featured';
    value: string;
  };
  progress: number;
  total: number;
  completed: boolean;
  timeLeft: string;
  difficulty: 'easy' | 'medium' | 'hard';
  streak?: number;
}

const challenges: Challenge[] = [
  {
    id: 'daily-1',
    title: 'Daily Engagement',
    description: 'Like 5 posts from community members',
    type: 'daily',
    reward: { type: 'karma', value: '+50 Karma' },
    progress: 3,
    total: 5,
    completed: false,
    timeLeft: '18h 45m',
    difficulty: 'easy',
    streak: 7
  },
  {
    id: 'daily-2',
    title: 'Share Your Story',
    description: 'Post an update about your creative journey',
    type: 'daily',
    reward: { type: 'karma', value: '+100 Karma' },
    progress: 0,
    total: 1,
    completed: false,
    timeLeft: '18h 45m',
    difficulty: 'medium'
  },
  {
    id: 'weekly-1',
    title: 'Community Helper',
    description: 'Answer 10 questions from other members',
    type: 'weekly',
    reward: { type: 'badge', value: 'Helper Badge' },
    progress: 7,
    total: 10,
    completed: false,
    timeLeft: '3d 18h',
    difficulty: 'medium'
  },
  {
    id: 'weekly-2',
    title: 'Trending Creator',
    description: 'Get 500 likes on your posts this week',
    type: 'weekly',
    reward: { type: 'featured', value: 'Featured Spot' },
    progress: 342,
    total: 500,
    completed: false,
    timeLeft: '3d 18h',
    difficulty: 'hard',
    streak: 2
  }
];

export default function DailyChallenges() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>(['daily-1']);

  const filteredChallenges = challenges.filter(c => c.type === activeTab);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 bg-green-400/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'hard':
        return 'text-[#DC143C] bg-[#DC143C]/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'karma':
        return <Zap size={14} className="text-[#d4af37]" />;
      case 'badge':
        return <Award size={14} className="text-purple-400" />;
      case 'featured':
        return <Star size={14} className="text-[#DC143C]" />;
      default:
        return <Gift size={14} className="text-gray-400" />;
    }
  };

  const toggleJoin = (challengeId: string) => {
    setJoinedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#DC143C] to-red-600 rounded-lg flex items-center justify-center">
            <Target size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Challenges</h3>
            <p className="text-gray-500 text-xs">Complete for rewards</p>
          </div>
        </div>
        <Link 
            href="/community?view=challenges"
          className="text-[#d4af37] text-sm hover:underline flex items-center gap-1"
        >
          All
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['daily', 'weekly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[#d4af37] text-black'
                : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'daily' ? (
              <span className="flex items-center justify-center gap-1.5">
                <Flame size={14} />
                Daily
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Clock size={14} />
                Weekly
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Challenge Cards */}
      <div className="space-y-3">
        {filteredChallenges.map((challenge) => {
          const isJoined = joinedChallenges.includes(challenge.id);
          const progressPercent = (challenge.progress / challenge.total) * 100;

          return (
            <div 
              key={challenge.id}
              className={`bg-[#0a0a0a] rounded-xl p-4 border transition-all ${
                challenge.completed 
                  ? 'border-green-500/30' 
                  : isJoined 
                    ? 'border-[#d4af37]/30' 
                    : 'border-transparent hover:border-[#d4af37]/20'
              }`}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium text-sm">{challenge.title}</h4>
                    {challenge.streak && challenge.streak > 1 && (
                      <span className="flex items-center gap-0.5 text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                        <Flame size={10} />
                        {challenge.streak} streak
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">{challenge.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">
                    {challenge.progress}/{challenge.total}
                  </span>
                  <span className="text-[#d4af37]">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-[#141414] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      challenge.completed 
                        ? 'bg-green-500' 
                        : 'bg-gradient-to-r from-[#d4af37] to-[#DC143C]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Reward */}
                  <div className="flex items-center gap-1.5 bg-[#141414] rounded-full px-2.5 py-1">
                    {getRewardIcon(challenge.reward.type)}
                    <span className="text-xs text-gray-300">{challenge.reward.value}</span>
                  </div>
                  
                  {/* Time Left */}
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock size={12} />
                    {challenge.timeLeft}
                  </div>
                </div>

                {/* Action Button */}
                {challenge.completed ? (
                  <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <Check size={16} />
                    Done
                  </div>
                ) : (
                  <button
                    onClick={() => toggleJoin(challenge.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isJoined
                        ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30'
                        : 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="mt-4 pt-4 border-t border-[#d4af37]/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#d4af37]">12</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#DC143C]">7</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}
