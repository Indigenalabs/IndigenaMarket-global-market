'use client';

import { Heart, Eye } from 'lucide-react';
import { useState } from 'react';

interface NFTCardProps {
  id: string;
  title: string;
  creator: string;
  price: number;
  currency: string;
  image: string;
  likes: number;
  views: number;
  isVerified?: boolean;
  onViewDetails?: (id: string) => void;
}

export default function NFTCard({ 
  id,
  title, 
  creator, 
  price, 
  currency, 
  image, 
  likes, 
  views,
  isVerified = false,
  onViewDetails
}: NFTCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="group bg-[#141414] rounded-xl overflow-hidden border border-[#DC143C]/10 hover:border-[#DC143C]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#DC143C]/10">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3">
            <button
              type="button"
              onClick={() => onViewDetails?.(id)}
              className="w-full py-2.5 bg-gradient-to-r from-[#DC143C] to-[#8B0000] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#DC143C]/30 transition-all"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Verified Badge - Gold Secondary */}
        {isVerified && (
          <div className="absolute top-3 left-3 w-6 h-6 bg-gradient-to-br from-[#f4e4a6] to-[#d4af37] rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold truncate mb-1">{title}</h3>
        <p className="text-gray-400 text-sm mb-3">by {creator}</p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Current Price</p>
            <p className="text-[#d4af37] font-bold">
              {price} {currency}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
              <span className="text-xs">{likeCount}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-400">
              <Eye size={16} />
              <span className="text-xs">{views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
