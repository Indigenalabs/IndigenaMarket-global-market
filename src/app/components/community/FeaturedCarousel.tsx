'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Flame, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PlacementPill } from '../placements/PremiumPlacement';

interface FeaturedPost {
  id: string;
  type: 'trending' | 'popular' | 'staff_pick' | 'sponsored';
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image: string;
  likes: number;
  comments: number;
  engagement: string;
  badge: string;
}

const featuredPosts: FeaturedPost[] = [
  {
    id: 'featured-1',
    type: 'trending',
    author: {
      name: 'Maria Redfeather',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      verified: true
    },
    content: 'Just finished this 40-hour beadwork masterpiece representing the four directions!',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=400&fit=crop',
    likes: 2341,
    comments: 456,
    engagement: 'Trending #1',
    badge: 'Hot'
  },
  {
    id: 'featured-2',
    type: 'staff_pick',
    author: {
      name: 'ThunderVoice',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      verified: true
    },
    content: 'My journey blending traditional Lakota symbolism with digital art techniques',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop',
    likes: 1892,
    comments: 234,
    engagement: 'Staff Pick',
    badge: 'Featured'
  },
  {
    id: 'featured-3',
    type: 'popular',
    author: {
      name: 'Elena Rivers',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      verified: true
    },
    content: 'Teaching traditional plant medicine - preserving knowledge for future generations',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=400&fit=crop',
    likes: 3421,
    comments: 567,
    engagement: 'Most Popular',
    badge: 'Top'
  },
  {
    id: 'featured-4',
    type: 'sponsored',
    author: {
      name: 'Heritage Arts',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      verified: true
    },
    content: 'Exclusive: Master Artisan Workshop Series - Limited spots available!',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=400&fit=crop',
    likes: 892,
    comments: 123,
    engagement: 'Sponsored',
    badge: 'Promoted'
  }
];

const getBadgeIcon = (badge: string) => {
  switch (badge) {
    case 'Hot':
      return <Flame size={14} className="text-white" />;
    case 'Featured':
      return <Star size={14} className="text-white" />;
    case 'Top':
      return <Crown size={14} className="text-white" />;
    case 'Promoted':
      return <Sparkles size={14} className="text-white" />;
    default:
      return null;
  }
};

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case 'Hot':
      return 'bg-[#DC143C]';
    case 'Featured':
      return 'bg-[#d4af37]';
    case 'Top':
      return 'bg-purple-500';
    case 'Promoted':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export default function FeaturedCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
  };

  const currentPost = featuredPosts[currentIndex];

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] via-[#f4e4a6] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Star size={18} className="text-black" />
          </div>
          <h3 className="text-lg font-bold text-white">Featured Content</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrev}
            className="w-8 h-8 bg-[#141414] border border-[#d4af37]/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={handleNext}
            className="w-8 h-8 bg-[#141414] border border-[#d4af37]/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative bg-[#141414] rounded-2xl overflow-hidden border border-[#d4af37]/20">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={currentPost.image}
            alt="Featured"
            className="w-full h-full object-cover transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />

          <div className={`absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 ${getBadgeColor(currentPost.badge)} rounded-full`}>
            {getBadgeIcon(currentPost.badge)}
            <span className="text-white text-xs font-bold">{currentPost.badge}</span>
          </div>

          {/* Engagement Tag */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {currentPost.type === 'sponsored' ? <PlacementPill icon={Crown}>Sponsored</PlacementPill> : null}
            <div className="px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              {currentPost.engagement}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Author */}
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={currentPost.author.avatar}
              alt={currentPost.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{currentPost.author.name}</span>
                {currentPost.author.verified && (
                  <div className="w-4 h-4 rounded-full bg-[#d4af37] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-300 mb-4">{currentPost.content}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {currentPost.likes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {currentPost.comments.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {featuredPosts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-[#d4af37]' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
