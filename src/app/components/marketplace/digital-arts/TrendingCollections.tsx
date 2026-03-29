'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Crown, Sparkles, Star, ShoppingCart } from 'lucide-react';

const boostedCollection = {
  id: 'boost-1',
  name: 'Eagle Clan Ancestral Works',
  creator: 'SkyPainter',
  image: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=600&h=400&fit=crop',
  items: 30,
  floorPrice: 220,
  volume: '6.8K',
  owners: 201,
};

const collections = [
  {
    id: '1',
    name: 'Sacred Geometry Series',
    creator: 'ThunderVoice',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
    items: 12,
    floorPrice: 150,
    volume: '2.4K',
    owners: 89,
  },
  {
    id: '2',
    name: 'Coastal Formline',
    creator: 'HaidaMaster',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop',
    items: 24,
    floorPrice: 200,
    volume: '4.1K',
    owners: 156,
  },
  {
    id: '3',
    name: 'Plains Spirit Animals',
    creator: 'LakotaDreams',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&h=300&fit=crop',
    items: 8,
    floorPrice: 300,
    volume: '1.8K',
    owners: 67,
  },
  {
    id: '4',
    name: 'Desert Symbols',
    creator: 'NavajoWeaver',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=300&h=300&fit=crop',
    items: 16,
    floorPrice: 125,
    volume: '3.2K',
    owners: 112,
  },
];

// Inline quick-view modal for a collection
function CollectionModal({ collection, onClose }: { collection: typeof collections[0] | typeof boostedCollection; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#141414] border border-[#d4af37]/20 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-48 overflow-hidden">
          <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80">
            ✕
          </button>
          <div className="absolute bottom-3 left-4">
            <p className="text-white font-bold text-lg">{collection.name}</p>
            <p className="text-gray-400 text-sm">by {collection.creator}</p>
          </div>
        </div>
        {confirmed ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-full flex items-center justify-center">
              <span className="text-[#d4af37] text-2xl">✓</span>
            </div>
            <p className="text-white font-semibold">Added to Watchlist!</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
                <p className="text-[#d4af37] font-bold">{collection.items}</p>
                <p className="text-gray-500 text-xs">Items</p>
              </div>
              <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
                <p className="text-white font-bold">{collection.floorPrice}</p>
                <p className="text-gray-500 text-xs">Floor</p>
              </div>
              <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
                <p className="text-[#d4af37] font-bold">{collection.volume}</p>
                <p className="text-gray-500 text-xs">Volume</p>
              </div>
              <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
                <p className="text-white font-bold">{collection.owners}</p>
                <p className="text-gray-500 text-xs">Owners</p>
              </div>
            </div>
            <button
              onClick={() => { setConfirmed(true); setTimeout(onClose, 1600); }}
              className="w-full py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} /> Browse Collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrendingCollections() {
  const [modalCollection, setModalCollection] = useState<typeof collections[0] | typeof boostedCollection | null>(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <TrendingUp size={20} className="text-[#d4af37]" />
          Trending Collections
        </h3>
        <Link
          href="/digital-arts"
          className="flex items-center gap-1 text-[#d4af37] hover:text-[#f4e4a6] transition-colors text-sm"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Boosted #1 Slot */}
      <div
        className="relative mb-4 rounded-xl overflow-hidden border border-[#d4af37]/50 group cursor-pointer shadow-lg shadow-[#d4af37]/10"
        onClick={() => setModalCollection(boostedCollection)}
      >
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-[#d4af37] text-black text-xs font-bold rounded-full">
          <Crown size={12} />
          #1 Featured · Sponsored
        </div>
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-[#d4af37] text-xs rounded-full border border-[#d4af37]/30">
          <Sparkles size={10} />
          Boosted
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden">
            <img
              src={boostedCollection.image}
              alt={boostedCollection.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141414] hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent md:hidden" />
          </div>
          <div className="flex-1 bg-[#141414] p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-white font-bold text-xl">{boostedCollection.name}</h4>
                <p className="text-gray-400 text-sm">by {boostedCollection.creator}</p>
              </div>
              <Star size={20} className="text-[#d4af37]" fill="currentColor" />
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
                <p className="text-[#d4af37] font-bold">{boostedCollection.items}</p>
                <p className="text-gray-500 text-xs">Items</p>
              </div>
              <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
                <p className="text-white font-bold">{boostedCollection.floorPrice}</p>
                <p className="text-gray-500 text-xs">Floor</p>
              </div>
              <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
                <p className="text-[#d4af37] font-bold">{boostedCollection.volume}</p>
                <p className="text-gray-500 text-xs">Volume</p>
              </div>
              <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
                <p className="text-white font-bold">{boostedCollection.owners}</p>
                <p className="text-gray-500 text-xs">Owners</p>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setModalCollection(boostedCollection); }}
              className="mt-4 w-full py-2.5 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
            >
              View Collection
            </button>
          </div>
        </div>
      </div>

      {/* Regular Collection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {collections.map((collection, idx) => (
          <div
            key={collection.id}
            className="relative bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all group cursor-pointer"
            onClick={() => setModalCollection(collection)}
          >
            <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center">
              <span className="text-[#d4af37] text-xs font-bold">#{idx + 2}</span>
            </div>
            <div className="relative aspect-square overflow-hidden">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 bg-[#d4af37] text-black text-xs font-semibold rounded-lg">View Collection</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h4 className="text-white font-semibold truncate">{collection.name}</h4>
                <p className="text-gray-400 text-xs">by {collection.creator}</p>
              </div>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[#d4af37] font-bold text-sm">{collection.items}</p>
                <p className="text-gray-500 text-xs">Items</p>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{collection.floorPrice} INDI</p>
                <p className="text-gray-500 text-xs">Floor</p>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{collection.owners}</p>
                <p className="text-gray-500 text-xs">Owners</p>
              </div>
            </div>
            <div className="px-3 pb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Volume</span>
                <span className="text-[#d4af37] font-medium">{collection.volume} INDI</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalCollection && <CollectionModal collection={modalCollection} onClose={() => setModalCollection(null)} />}
    </div>
  );
}
