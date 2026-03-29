'use client';

import { useState } from 'react';
import { Heart, Bell, BellOff, Trash2, Eye, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { PhysicalItem } from './ItemDetailModal';

interface SavedEntry {
  item: PhysicalItem;
  savedAt: string;
  priceAtSave: number;
  notify: boolean;
}

interface SavedItemsProps {
  entries: SavedEntry[];
  onRemove: (itemId: string) => void;
  onToggleNotify: (itemId: string) => void;
  onView: (item: PhysicalItem) => void;
  onAddToCart: (item: PhysicalItem) => void;
}

export default function SavedItems({ entries, onRemove, onToggleNotify, onView, onAddToCart }: SavedItemsProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'watching'>('saved');
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'nation'>('recent');

  const saved = entries.filter((e) => !e.notify);
  const watching = entries.filter((e) => e.notify);
  const display = activeTab === 'saved' ? saved : watching;

  const sorted = [...display].sort((a, b) => {
    if (sortBy === 'price') return b.item.price - a.item.price;
    if (sortBy === 'nation') return a.item.nation.localeCompare(b.item.nation);
    return 0;
  });

  const priceChange = (entry: SavedEntry) => {
    const diff = entry.item.price - entry.priceAtSave;
    return diff;
  };

  if (entries.length === 0) {
    return (
      <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-8 text-center">
        <Heart size={36} className="text-gray-700 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">No saved items yet</p>
        <p className="text-gray-500 text-sm">Heart items to save them here for later</p>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/10">
        <div className="flex gap-1">
          {(['saved', 'watching'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                activeTab === tab ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'saved' ? `Saved (${saved.length})` : `Watching (${watching.length})`}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-2 py-1 text-xs text-gray-400 focus:outline-none focus:border-[#d4af37]"
        >
          <option value="recent">Recent</option>
          <option value="price">Price</option>
          <option value="nation">Nation</option>
        </select>
      </div>

      {/* List */}
      <div className="divide-y divide-[#d4af37]/5">
        {sorted.map(({ item, savedAt, priceAtSave, notify }) => {
          const diff = priceChange({ item, savedAt, priceAtSave, notify });
          return (
            <div key={item.id} className="flex gap-3 p-3 hover:bg-white/[0.02] transition-colors">
              {/* Thumbnail */}
              <div
                onClick={() => onView(item)}
                className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
              >
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      onClick={() => onView(item)}
                      className="text-white text-sm font-semibold line-clamp-1 cursor-pointer hover:text-[#d4af37] transition-colors"
                    >
                      {item.title}
                    </p>
                    <p className="text-gray-500 text-xs">by {item.maker} · <span className="text-[#d4af37]/80">{item.nation}</span></p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#d4af37] font-bold text-sm">{item.price} {item.currency}</p>
                    {diff !== 0 && (
                      <p className={`text-xs flex items-center justify-end gap-0.5 ${diff < 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp size={9} className={diff > 0 ? '' : 'rotate-180'} />
                        {diff > 0 ? '+' : ''}{diff}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1 text-gray-600 text-[10px]">
                    <Clock size={9} />
                    {savedAt}
                    {!item.inStock && <span className="ml-1.5 text-[#DC143C]">Out of stock</span>}
                    {item.stockCount <= 2 && item.inStock && <span className="ml-1.5 text-yellow-400">Only {item.stockCount} left</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleNotify(item.id)}
                      title={notify ? 'Stop watching' : 'Watch for price change'}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        notify ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-600 hover:text-[#d4af37]'
                      }`}
                    >
                      {notify ? <Bell size={11} /> : <BellOff size={11} />}
                    </button>
                    <button
                      onClick={() => onView(item)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-white transition-colors"
                    >
                      <Eye size={11} />
                    </button>
                    {item.inStock && (
                      <button
                        onClick={() => onAddToCart(item)}
                        className="flex items-center gap-1 px-2 py-1 bg-[#d4af37] text-black text-[10px] font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
                      >
                        <ShoppingCart size={9} />
                        Add
                      </button>
                    )}
                    <button
                      onClick={() => onRemove(item.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-700 hover:text-[#DC143C] transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
