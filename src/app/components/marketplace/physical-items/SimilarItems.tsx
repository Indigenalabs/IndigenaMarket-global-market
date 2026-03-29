'use client';

import { Star, MapPin, CheckCircle, Package } from 'lucide-react';
import { PhysicalItem } from './ItemDetailModal';

interface SimilarItemsProps {
  currentItem: PhysicalItem;
  allItems: PhysicalItem[];
  onSelect: (item: PhysicalItem) => void;
}

function scoreSimilarity(current: PhysicalItem, candidate: PhysicalItem): number {
  let score = 0;
  if (candidate.id === current.id) return -1;
  if (candidate.nation === current.nation) score += 3;
  if (candidate.category === current.category) score += 5;
  const priceDiff = Math.abs(candidate.price - current.price) / current.price;
  if (priceDiff < 0.2) score += 2;
  else if (priceDiff < 0.5) score += 1;
  if (candidate.isVerified) score += 1;
  if (candidate.rating >= 4.5) score += 1;
  return score;
}

export default function SimilarItems({ currentItem, allItems, onSelect }: SimilarItemsProps) {
  const similar = allItems
    .map((item) => ({ item, score: scoreSimilarity(currentItem, item) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.item);

  if (similar.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Package size={14} className="text-[#d4af37]" />
        <h3 className="text-white text-sm font-semibold">Similar Items</h3>
        <span className="text-gray-600 text-xs ml-auto">{similar.length} found</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {similar.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-[#d4af37]/40 transition-all text-left"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Badges */}
              <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                {item.isVerified && (
                  <span className="flex items-center gap-0.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-green-400 text-xs">
                    <CheckCircle size={9} /> Verified
                  </span>
                )}
                {item.isSacred && (
                  <span className="bg-purple-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-purple-300 text-xs">
                    Sacred
                  </span>
                )}
              </div>
              {/* Price */}
              <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[#d4af37] text-xs font-bold">
                {item.price} {item.currency}
              </div>
            </div>

            {/* Info */}
            <div className="p-2">
              <p className="text-white text-[11px] font-medium leading-tight line-clamp-1 mb-0.5">{item.title}</p>
              <p className="text-gray-500 text-[10px] truncate">{item.maker}</p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-0.5">
                  <MapPin size={8} className="text-gray-600" />
                  <span className="text-gray-600 text-[10px]">{item.nation}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Star size={8} className="text-[#d4af37] fill-[#d4af37]" />
                  <span className="text-gray-400 text-[10px]">{item.rating}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Same maker */}
      <p className="text-center text-gray-600 text-xs mt-3">
        <button
          onClick={() => {/* handled by parent navigation */}}
          className="text-[#d4af37]/70 hover:text-[#d4af37] transition-colors"
        >
          See all items from {currentItem.maker} →
        </button>
      </p>
    </div>
  );
}
