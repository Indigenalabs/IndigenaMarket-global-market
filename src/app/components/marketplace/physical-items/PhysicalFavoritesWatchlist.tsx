'use client';

import { useState } from 'react';
import { Heart, Bell, BellOff, TrendingDown, TrendingUp, Minus, Eye, Trash2, ShoppingCart, Package, AlertCircle } from 'lucide-react';
import { PhysicalItem } from './ItemDetailModal';

interface WatchEntry {
  item: PhysicalItem;
  savedAt: string;
  priceAtSave: number;
  alertThreshold: number | null;
  notifyOnDrop: boolean;
}

interface PhysicalFavoritesWatchlistProps {
  onViewItem: (item: PhysicalItem) => void;
  onAddToCart: (item: PhysicalItem) => void;
}

// Simulate price movement for demo
function getPriceDelta(item: PhysicalItem, savedPrice: number): number {
  const seed = item.id.charCodeAt(0);
  const deltas = [-20, -10, 0, 0, 5, 15, -5];
  return deltas[seed % deltas.length];
}

const MOCK_ENTRIES: WatchEntry[] = [
  {
    item: {
      id: '5', title: 'Regalia Dance Fan (Pow-Wow)', maker: 'EagleFeather Works',
      makerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      price: 420, currency: 'INDI',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'],
      nation: 'Lakota', category: 'regalia', material: 'Eagle feathers', dimensions: '55cm spread',
      weight: '220g', isVerified: true, isHandmade: true, inStock: true, stockCount: 1,
      hubName: 'Denver', hubCity: 'Denver, CO', hubOnline: true, shipsInternational: false,
      likes: 89, views: 740, hasARPreview: false, isSacred: true,
      storyQuote: 'Made from molted feathers gifted to me by the eagles themselves.',
      storyFull: '', certificationNumber: 'LAK-2024-RG-0003',
      xrplTxId: 'E1J7F6G5H4I3C2', ipfsHash: 'QmB1O3qV7rL6tP2', rating: 5.0, reviewCount: 14,
    },
    savedAt: '3 days ago', priceAtSave: 440, alertThreshold: 400, notifyOnDrop: true,
  },
  {
    item: {
      id: '6', title: 'Red Cedar Spirit Carving', maker: 'James Thundercloud',
      makerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      price: 890, currency: 'INDI',
      images: ['https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=600&fit=crop'],
      nation: 'Haudenosaunee', category: 'carving', material: 'Western red cedar',
      dimensions: '45cm × 12cm', weight: '1.1kg', isVerified: true, isHandmade: true,
      inStock: true, stockCount: 1, hubName: 'Vancouver', hubCity: 'Vancouver, BC',
      hubOnline: true, shipsInternational: true, likes: 278, views: 2670,
      hasARPreview: true, isSacred: false,
      storyQuote: 'The figure was already inside the wood.',
      storyFull: '', certificationNumber: 'HAU-2024-CV-0015',
      xrplTxId: 'F2K8G7H6I5J4D3', ipfsHash: 'QmC2P4rW8sM7uQ3', rating: 4.9, reviewCount: 28,
    },
    savedAt: '1 week ago', priceAtSave: 890, alertThreshold: 800, notifyOnDrop: false,
  },
  {
    item: {
      id: '3', title: 'Navajo Two-Grey-Hills Rug', maker: 'WeavingWoman',
      makerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      price: 650, currency: 'INDI',
      images: ['https://images.unsplash.com/photo-1605218427368-35b0f996d2e6?w=600&h=600&fit=crop'],
      nation: 'Navajo', category: 'weaving', material: 'Churro wool',
      dimensions: '120cm × 80cm', weight: '1.4kg', isVerified: true, isHandmade: true,
      inStock: true, stockCount: 1, hubName: 'Phoenix', hubCity: 'Phoenix, AZ',
      hubOnline: true, shipsInternational: true, likes: 412, views: 3201,
      hasARPreview: true, isSacred: false,
      storyQuote: 'A rug takes months. The warp is the world, the weft is the story.',
      storyFull: '', certificationNumber: 'NAV-2024-WV-0009',
      xrplTxId: 'C9H5D4E3F2G1A0', ipfsHash: 'QmZ9M1oT5pJ4rN0', rating: 5.0, reviewCount: 89,
    },
    savedAt: '2 weeks ago', priceAtSave: 680, alertThreshold: 600, notifyOnDrop: true,
  },
];

export default function PhysicalFavoritesWatchlist({ onViewItem, onAddToCart }: PhysicalFavoritesWatchlistProps) {
  const [entries, setEntries] = useState<WatchEntry[]>(MOCK_ENTRIES);
  const [activeTab, setActiveTab] = useState<'saved' | 'alerts'>('saved');

  const toggleNotify = (id: string) =>
    setEntries((prev) => prev.map((e) => e.item.id === id ? { ...e, notifyOnDrop: !e.notifyOnDrop } : e));

  const setThreshold = (id: string, val: number) =>
    setEntries((prev) => prev.map((e) => e.item.id === id ? { ...e, alertThreshold: val } : e));

  const remove = (id: string) => setEntries((prev) => prev.filter((e) => e.item.id !== id));

  const alertEntries = entries.filter((e) => e.notifyOnDrop);
  const priceDropEntries = entries.filter((e) => getPriceDelta(e.item, e.priceAtSave) < 0);

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#d4af37]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#DC143C]/10 flex items-center justify-center">
            <Heart size={16} className="text-[#DC143C]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Saved &amp; Watchlist</h3>
            <p className="text-gray-500 text-xs">{entries.length} items · {alertEntries.length} price alerts active</p>
          </div>
        </div>
        {priceDropEntries.length > 0 && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full">
            <TrendingDown size={11} />
            {priceDropEntries.length} price drop{priceDropEntries.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(['saved', 'alerts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'text-[#d4af37] border-b-2 border-[#d4af37]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'saved' ? `Saved Items (${entries.length})` : `Price Alerts (${alertEntries.length})`}
          </button>
        ))}
      </div>

      {/* Saved Items tab */}
      {activeTab === 'saved' && (
        <div className="divide-y divide-white/5">
          {entries.length === 0 ? (
            <div className="py-12 text-center">
              <Package size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No saved items yet</p>
            </div>
          ) : entries.map((entry) => {
            const delta = getPriceDelta(entry.item, entry.priceAtSave);
            const pct = entry.priceAtSave > 0 ? Math.round((delta / entry.priceAtSave) * 100) : 0;
            return (
              <div key={entry.item.id} className="flex items-start gap-3 p-4 group">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a0a0a]">
                  <img src={entry.item.images[0]} alt={entry.item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{entry.item.title}</p>
                      <p className="text-gray-500 text-xs">{entry.item.maker} · {entry.item.nation}</p>
                    </div>
                    <button onClick={() => remove(entry.item.id)} className="text-gray-700 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Price info */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[#d4af37] font-bold text-sm">{entry.item.price} INDI</span>
                    {delta !== 0 && (
                      <span className={`flex items-center gap-0.5 text-xs font-medium ${delta < 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {delta < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                        {delta > 0 ? '+' : ''}{pct}% from save
                      </span>
                    )}
                    {delta === 0 && <span className="flex items-center gap-0.5 text-gray-600 text-xs"><Minus size={10} /> No change</span>}
                  </div>

                  {/* Alert threshold */}
                  {entry.notifyOnDrop && entry.alertThreshold !== null && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <Bell size={11} className="text-[#d4af37]" />
                      <span className="text-gray-500 text-xs">Alert at</span>
                      <input
                        type="number"
                        value={entry.alertThreshold}
                        onChange={(e) => setThreshold(entry.item.id, Number(e.target.value))}
                        className="w-20 bg-[#0a0a0a] border border-[#d4af37]/20 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      />
                      <span className="text-gray-500 text-xs">INDI</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => onViewItem(entry.item)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg hover:bg-white/10 transition-colors">
                      <Eye size={11} /> View
                    </button>
                    <button onClick={() => onAddToCart(entry.item)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs rounded-lg hover:bg-[#d4af37]/20 transition-colors">
                      <ShoppingCart size={11} /> Add to Cart
                    </button>
                    <button onClick={() => toggleNotify(entry.item.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        entry.notifyOnDrop
                          ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]'
                          : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                      }`}>
                      {entry.notifyOnDrop ? <Bell size={11} /> : <BellOff size={11} />}
                      {entry.notifyOnDrop ? 'Alert On' : 'Alert Off'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Price Alerts tab */}
      {activeTab === 'alerts' && (
        <div className="divide-y divide-white/5">
          {alertEntries.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No price alerts set</p>
              <p className="text-gray-600 text-xs mt-1">Enable alerts on saved items to track price drops</p>
            </div>
          ) : alertEntries.map((entry) => {
            const delta = getPriceDelta(entry.item, entry.priceAtSave);
            const triggered = entry.alertThreshold !== null && entry.item.price <= entry.alertThreshold;
            return (
              <div key={entry.item.id} className={`flex items-center gap-3 p-4 ${triggered ? 'bg-green-500/5' : ''}`}>
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a0a0a]">
                  <img src={entry.item.images[0]} alt={entry.item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{entry.item.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[#d4af37] text-xs">{entry.item.price} INDI now</span>
                    <span className="text-gray-500 text-xs">Target: {entry.alertThreshold} INDI</span>
                  </div>
                </div>
                {triggered ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs rounded-full font-medium">
                    <TrendingDown size={10} /> Triggered!
                  </span>
                ) : (
                  <span className="text-gray-600 text-xs">
                    {delta < 0 ? `↓${Math.abs(delta)} INDI closer` : 'Watching…'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-white/5 text-center">
        <p className="text-gray-600 text-xs">Price alerts check every 30 minutes · INDI only</p>
      </div>
    </div>
  );
}
