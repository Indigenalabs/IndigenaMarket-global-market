'use client';

import { useState } from 'react';
import { BarChart3, Check, Clock, Users, Sparkles, Crown } from 'lucide-react';
import Link from 'next/link';
import { PlacementPill, PlacementSponsorRow } from '../placements/PremiumPlacement';

interface Poll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  totalVotes: number;
  endDate: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  isSponsored?: boolean;
  sponsor?: string;
}

const polls: Poll[] = [
  {
    id: 'poll-1',
    question: 'Which traditional art form should we feature next month?',
    options: [
      { id: 'opt-1', text: 'Navajo Weaving', votes: 234 },
      { id: 'opt-2', text: 'Coastal Carving', votes: 189 },
      { id: 'opt-3', text: 'Plains Beadwork', votes: 312 },
      { id: 'opt-4', text: 'Pottery Making', votes: 156 }
    ],
    totalVotes: 891,
    endDate: '3 days left',
    author: {
      name: 'Community Team',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      verified: true
    },
    isSponsored: true,
    sponsor: 'Heritage Arts Foundation'
  },
  {
    id: 'poll-2',
    question: 'What type of workshop interests you most?',
    options: [
      { id: 'opt-1', text: 'Business & Marketing', votes: 445 },
      { id: 'opt-2', text: 'Advanced Techniques', votes: 378 },
      { id: 'opt-3', text: 'Cultural History', votes: 289 }
    ],
    totalVotes: 1112,
    endDate: '5 days left',
    author: {
      name: 'Elena Rivers',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      verified: true
    }
  }
];

export default function CommunityPolls() {
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});

  const handleVote = (pollId: string, optionId: string) => {
    setVotedPolls(prev => ({
      ...prev,
      [pollId]: optionId
    }));
  };

  const getPercentage = (votes: number, total: number) => {
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
            <BarChart3 size={18} className="text-[#d4af37]" />
          </div>
          <h3 className="text-lg font-bold text-white">Community Polls</h3>
        </div>
        <Link 
          href="/community?view=polls"
          className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Polls */}
      <div className="space-y-4">
        {polls.map((poll) => {
          const hasVoted = votedPolls[poll.id];
          const totalVotes = hasVoted ? poll.totalVotes + 1 : poll.totalVotes;

          return (
            <div 
              key={poll.id}
              className={`bg-[#0a0a0a] rounded-xl p-4 border ${
                poll.isSponsored ? 'border-[#d4af37]/40' : 'border-[#d4af37]/10'
              }`}
            >
              {/* Sponsored Badge */}
              {poll.isSponsored && (
                <PlacementSponsorRow
                  sponsor={poll.sponsor || 'Community Sponsor'}
                  right={<PlacementPill icon={Crown}>Sponsored</PlacementPill>}
                />
              )}

              {/* Author */}
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src={poll.author.avatar}
                  alt={poll.author.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-sm text-gray-300">{poll.author.name}</span>
                {poll.author.verified && (
                  <div className="w-4 h-4 rounded-full bg-[#d4af37] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Question */}
              <h4 className="text-white font-medium mb-4">{poll.question}</h4>

              {/* Options */}
              <div className="space-y-2">
                {poll.options.map((option) => {
                  const isSelected = hasVoted === option.id;
                  const percentage = hasVoted 
                    ? getPercentage(isSelected ? option.votes + 1 : option.votes, totalVotes)
                    : 0;

                  return (
                    <button
                      key={option.id}
                      onClick={() => !hasVoted && handleVote(poll.id, option.id)}
                      disabled={!!hasVoted}
                      className={`w-full relative overflow-hidden rounded-lg transition-all ${
                        hasVoted
                          ? 'cursor-default'
                          : 'hover:bg-[#d4af37]/10 cursor-pointer'
                      } ${
                        isSelected ? 'bg-[#d4af37]/20 border border-[#d4af37]' : 'bg-[#141414]'
                      }`}
                    >
                      {/* Progress Bar (shown after voting) */}
                      {hasVoted && (
                        <div 
                          className="absolute inset-y-0 left-0 bg-[#d4af37]/20 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      )}

                      <div className="relative flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          {hasVoted && isSelected && (
                            <Check size={16} className="text-[#d4af37]" />
                          )}
                          <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {option.text}
                          </span>
                        </div>
                        {hasVoted && (
                          <span className="text-sm text-[#d4af37] font-bold">
                            {percentage}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {totalVotes.toLocaleString()} votes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {poll.endDate}
                  </span>
                </div>
                {hasVoted && (
                  <span className="text-[#d4af37]">Thanks for voting!</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Poll CTA */}
      <Link 
            href="/community?view=polls&action=create"
        className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors"
      >
        <Sparkles size={16} />
        Create a Poll
      </Link>
    </div>
  );
}
