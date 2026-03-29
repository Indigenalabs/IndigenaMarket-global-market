'use client';

import { useState } from 'react';
import { TrendingUp, Flame, Clock, Eye, Heart, ShoppingCart, ChevronRight } from 'lucide-react';
import { PhysicalItem } from './ItemDetailModal';

interface TrendingItemsProps {
  items: PhysicalItem[];
  onItemClick: (item: PhysicalItem) => void;
}

const SORT_OPTIONS = [
  { id: 'views', label: 'Most Viewed', icon: <Eye size={12} /> },
  { id: 'likes', label: 'Most Liked', icon: <Heart size={12} /> },
  { id: 'recent', label: 'Recently Added', icon: <Clock size={12} /> },
];

function SparkBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}</span>
    </div>
  );
}

export default function TrendingItems({ items, onItemClick }: TrendingItemsProps) {
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'recent'>('views');

  const sorted = [...items]
    .sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'likes') return b.likes - a.likes;
      return b.id.localeCompare(a.id); // recent: higher ID = newer
    })
    .slice(0, 6);

  const maxViews = Math.max(...items.map((i) => i.views), 1);
  const maxLikes = Math.max(...items.map((i) => i.likes), 1);

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#d4af37]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame size={16} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Trending Now</h3>
            <p className="text-gray-500 text-xs">Most popular items this week</p>
          </div>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-1 bg-[#0a0a0a] rounded-xl p-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id as typeof sortBy)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === opt.id
                  ? 'bg-[#d4af37]/20 text-[#d4af37]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-white/5">
        {sorted.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left group"
          >
            {/* Rank */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              idx === 0 ? 'bg-[#d4af37] text-black' :
              idx === 1 ? 'bg-gray-400/20 text-gray-300' :
              idx === 2 ? 'bg-amber-700/30 text-amber-500' :
              'bg-white/5 text-gray-500'
            }`}>
              {idx === 0 ? <TrendingUp size={14} /> : idx + 1}
            </div>

            {/* Image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a0a0a]">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-white text-sm font-medium truncate">{item.title}</span>
                {item.isSacred && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#DC143C]/20 text-[#DC143C] rounded-full flex-shrink-0">Sacred</span>
                )}
              </div>
              <div className="text-gray-500 text-xs mb-1.5 truncate">{item.maker} · {item.nation}</div>

              {/* Stats bars */}
              <div className="space-y-1">
                {sortBy === 'views' && <SparkBar value={item.views} max={maxViews} />}
                {sortBy === 'likes' && <SparkBar value={item.likes} max={maxLikes} />}
                {sortBy === 'recent' && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={10} />
                    <span>{item.views} views · {item.likes} saves</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price + action */}
            <div className="flex-shrink-0 text-right">
              <div className="text-[#d4af37] font-bold text-sm">{item.price}</div>
              <div className="text-gray-500 text-xs mb-1">{item.currency}</div>
              <div className="flex items-center gap-1 text-gray-600 text-xs group-hover:text-[#d4af37] transition-colors">
                <ShoppingCart size={10} />
                <span>View</span>
                <ChevronRight size={10} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1"><Eye size={10} /> {items.reduce((s, i) => s + i.views, 0).toLocaleString()} total views</span>
          <span className="flex items-center gap-1"><Heart size={10} /> {items.reduce((s, i) => s + i.likes, 0).toLocaleString()} saves</span>
        </div>
        <span className="text-[#d4af37]/60 text-xs">Updated hourly</span>
      </div>
    </div>
  );
}
