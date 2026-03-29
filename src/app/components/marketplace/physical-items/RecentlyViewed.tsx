'use client';

import { useEffect, useRef } from 'react';
import { Eye, X, Star, Clock } from 'lucide-react';
import { PhysicalItem } from './ItemDetailModal';

interface RecentlyViewedProps {
  items: PhysicalItem[];
  onSelect: (item: PhysicalItem) => void;
  onClear: () => void;
}

export default function RecentlyViewed({ items, onSelect, onClear }: RecentlyViewedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to most recent (leftmost)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10">
      <div className="max-w-screen-2xl mx-auto px-4 py-2">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-gray-500" />
            <span className="text-gray-400 text-xs font-medium">Recently Viewed</span>
            <span className="text-gray-600 text-xs">({items.length})</span>
          </div>
          <button
            onClick={onClear}
            className="text-gray-600 hover:text-gray-400 text-xs flex items-center gap-1 transition-colors"
          >
            <X size={11} /> Clear
          </button>
        </div>

        {/* Horizontal scroll row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 no-scrollbar"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => onSelect(item)}
              className="group flex-shrink-0 flex items-center gap-2 bg-[#141414] hover:bg-[#1a1a1a] border border-white/10 hover:border-[#d4af37]/40 rounded-xl px-2 py-1.5 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {/* Recently viewed overlay dot */}
                <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#d4af37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Info */}
              <div className="text-left min-w-0">
                <p className="text-white text-xs font-medium leading-tight line-clamp-1 max-w-[120px]">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[#d4af37] text-xs font-semibold">{item.price} {item.currency}</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={9} className="text-[#d4af37] fill-[#d4af37]" />
                    <span className="text-gray-500 text-xs">{item.rating}</span>
                  </div>
                </div>
              </div>

              {/* View icon hint */}
              <Eye size={12} className="text-gray-600 group-hover:text-[#d4af37] transition-colors flex-shrink-0 ml-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook to manage recently viewed state (can be used by parent)
export function useRecentlyViewed(maxItems = 8) {
  const storageKey = 'physical-recently-viewed';

  const getItems = (): PhysicalItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const addItem = (item: PhysicalItem) => {
    if (typeof window === 'undefined') return;
    const current = getItems().filter((i) => i.id !== item.id);
    const updated = [item, ...current].slice(0, maxItems);
    sessionStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const clearItems = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(storageKey);
  };

  return { getItems, addItem, clearItems };
}
