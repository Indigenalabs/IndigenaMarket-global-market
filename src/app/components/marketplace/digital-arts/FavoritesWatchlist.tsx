'use client';

import { useState } from 'react';
import { Heart, Eye, Bell, BellOff, Trash2, ExternalLink, Clock, TrendingUp } from 'lucide-react';

interface FavoriteItem {
  id: string;
  artworkId: string;
  title: string;
  creator: string;
  image: string;
  price: number;
  currency: string;
  priceChange?: number;
  isAuction: boolean;
  auctionEnds?: string;
  isWatched: boolean;
  addedAt: string;
}

interface FavoritesWatchlistProps {
  items?: FavoriteItem[];
  onRemoveFavorite: (artworkId: string) => void;
  onToggleWatch: (artworkId: string) => void;
  onViewArtwork: (artworkId: string) => void;
}

export default function FavoritesWatchlist({
  items = [],
  onRemoveFavorite,
  onToggleWatch,
  onViewArtwork
}: FavoritesWatchlistProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchlist'>('favorites');
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'ending'>('recent');

  const favorites = items.filter(i => !i.isAuction || i.isWatched === false);
  const watchlist = items.filter(i => i.isAuction || i.isWatched);

  const displayItems = activeTab === 'favorites' ? favorites : watchlist;

  const sorted = [...displayItems].sort((a, b) => {
    if (sortBy === 'price') return b.price - a.price;
    return 0;
  });

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#d4af37]/10">
        <h2 className="text-white font-bold text-lg mb-3">My Saved Items</h2>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0a0a0a] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-[#d4af37] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart size={14} fill={activeTab === 'favorites' ? 'currentColor' : 'none'} />
            Favorites ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'watchlist'
                ? 'bg-[#DC143C] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye size={14} />
            Watchlist ({watchlist.length})
          </button>
        </div>
      </div>

      {/* Sort */}
      <div className="px-4 py-2 border-b border-[#d4af37]/10 flex items-center justify-between">
        <span className="text-gray-400 text-xs">{sorted.length} items</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded px-2 py-1 text-white text-xs focus:outline-none"
        >
          <option value="recent">Recently Added</option>
          <option value="price">Highest Price</option>
          <option value="ending">Ending Soon</option>
        </select>
      </div>

      {/* Items */}
      <div className="divide-y divide-[#d4af37]/10 max-h-[500px] overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="p-8 text-center">
            <Heart size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {activeTab === 'favorites' ? 'No favorites yet' : 'Watchlist is empty'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {activeTab === 'favorites'
                ? 'Heart artworks you love to save them here'
                : 'Watch auctions to track their progress'}
            </p>
          </div>
        ) : (
          sorted.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 hover:bg-[#1a1a1a] transition-colors group"
            >
              {/* Image */}
              <div
                className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => onViewArtwork(item.artworkId)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-white font-medium truncate text-sm cursor-pointer hover:text-[#d4af37] transition-colors"
                  onClick={() => onViewArtwork(item.artworkId)}
                >
                  {item.title}
                </p>
                <p className="text-gray-500 text-xs truncate">by {item.creator}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#d4af37] font-semibold text-sm">
                    {item.price} {item.currency}
                  </span>
                  {item.priceChange !== undefined && (
                    <span className={`text-xs flex items-center gap-0.5 ${
                      item.priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendingUp size={10} />
                      {item.priceChange >= 0 ? '+' : ''}{item.priceChange}%
                    </span>
                  )}
                  {item.isAuction && item.auctionEnds && (
                    <span className="text-xs text-[#DC143C] flex items-center gap-1">
                      <Clock size={10} />
                      {item.auctionEnds}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleWatch(item.artworkId)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    item.isWatched
                      ? 'text-[#d4af37] hover:text-gray-400'
                      : 'text-gray-400 hover:text-[#d4af37]'
                  }`}
                  title={item.isWatched ? 'Unwatch' : 'Watch'}
                >
                  {item.isWatched ? <BellOff size={14} /> : <Bell size={14} />}
                </button>
                <button
                  onClick={() => onViewArtwork(item.artworkId)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="View artwork"
                >
                  <ExternalLink size={14} />
                </button>
                <button
                  onClick={() => onRemoveFavorite(item.artworkId)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#DC143C] transition-colors"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
