'use client';

import { Sparkles, ExternalLink, Heart, MessageCircle, Share2, Bookmark, Crown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { PlacementPill, PlacementSponsorRow, placementPrimaryButtonClass } from '../placements/PremiumPlacement';

interface PromotedPostProps {
  post: {
    id: string;
    sponsor: string;
    sponsorLogo?: string;
    title: string;
    content: string;
    image?: string;
    cta: string;
    ctaLink: string;
    likes: number;
    comments: number;
    promotionDaysLeft: number;
  };
}

export default function PromotedPost({ post }: PromotedPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/40 overflow-hidden relative mb-6">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#d4af37]/10 via-[#141414] to-[#d4af37]/5 border-b border-[#d4af37]/20">
        <div className="flex items-center gap-2">
          <PlacementPill icon={Crown}>Sponsored</PlacementPill>
          <span className="text-sm text-[#d4af37]">{post.sponsor}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] text-gray-400">{post.promotionDaysLeft} days left</span>
          <button className="text-gray-500 hover:text-gray-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-5">
        <PlacementSponsorRow sponsor={post.sponsor} right={<span className="text-[11px] text-gray-500">Community placement</span>} />
        <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
        <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>

        {post.image && (
          <div className="relative mb-4 rounded-lg overflow-hidden group">
            <img
              src={post.image}
              alt={post.title}
              className="w-full max-h-80 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        <Link
          href={post.ctaLink}
          className={`${placementPrimaryButtonClass} mb-4`}
        >
          {post.cta}
          <ExternalLink size={18} />
        </Link>

        <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/10">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-[#DC143C]' : 'text-gray-400 hover:text-[#DC143C]'}`}
            >
              <Heart size={20} fill={isLiked ? '#DC143C' : 'none'} />
              <span className="text-sm">{likeCount}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors">
              <MessageCircle size={20} />
              <span className="text-sm">{post.comments}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors">
              <Share2 size={20} />
              <span className="text-sm">Share</span>
            </button>
          </div>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`transition-colors ${isBookmarked ? 'text-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37]'}`}
          >
            <Bookmark size={20} fill={isBookmarked ? '#d4af37' : 'none'} />
          </button>
        </div>
      </div>

      <div className="px-5 py-3 bg-[#d4af37]/5 border-t border-[#d4af37]/10">
        <Link
          href="/creator-hub"
          className="flex items-center justify-center gap-2 text-sm text-[#d4af37]/70 hover:text-[#d4af37] transition-colors"
        >
          <Sparkles size={14} />
          Promote your content from 50 INDI/post
        </Link>
      </div>
    </div>
  );
}
