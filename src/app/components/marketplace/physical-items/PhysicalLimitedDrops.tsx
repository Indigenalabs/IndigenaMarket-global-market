'use client';

import { useState, useEffect } from 'react';
import { Zap, Clock, ShoppingCart, Heart, AlertTriangle, CheckCircle, ChevronRight, Flame } from 'lucide-react';

interface LimitedDrop {
  id: string;
  title: string;
  maker: string;
  nation: string;
  image: string;
  price: number;
  originalPrice: number;
  currency: string;
  totalStock: number;
  remaining: number;
  endsAt: Date;
  category: string;
  isSacred: boolean;
  badge: 'flash' | 'last-chance' | 'new-drop' | 'exclusive';
}

const BADGE_CONFIG = {
  flash: { label: 'Flash Sale', color: 'bg-orange-500 text-white', icon: <Zap size={10} /> },
  'last-chance': { label: 'Last Chance', color: 'bg-[#DC143C] text-white', icon: <AlertTriangle size={10} /> },
  'new-drop': { label: 'New Drop', color: 'bg-purple-500 text-white', icon: <Flame size={10} /> },
  exclusive: { label: 'Exclusive', color: 'bg-[#d4af37] text-black', icon: <CheckCircle size={10} /> },
};

const MOCK_DROPS: LimitedDrop[] = [
  {
    id: 'd1', title: 'Hand-Beaded Medicine Bag', maker: 'Maria Redfeather', nation: 'Lakota',
    image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&q=80',
    price: 140, originalPrice: 185, currency: 'INDI', totalStock: 10, remaining: 3,
    endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000 + 14 * 60 * 1000),
    category: 'beadwork', isSacred: false, badge: 'flash',
  },
  {
    id: 'd2', title: 'Inuit Soapstone Bear Sculpture', maker: 'CoastalWeaver', nation: 'Inuit',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&q=80',
    price: 540, originalPrice: 540, currency: 'INDI', totalStock: 3, remaining: 1,
    endsAt: new Date(Date.now() + 45 * 60 * 1000),
    category: 'carving', isSacred: false, badge: 'last-chance',
  },
  {
    id: 'd3', title: 'Métis Floral Beaded Moccasins', maker: 'SilverBirch Crafts', nation: 'Métis',
    image: 'https://images.unsplash.com/photo-1601823984263-b87b5972c2c1?w=400&q=80',
    price: 295, originalPrice: 295, currency: 'INDI', totalStock: 5, remaining: 5,
    endsAt: new Date(Date.now() + 23 * 60 * 60 * 1000),
    category: 'textiles', isSacred: false, badge: 'new-drop',
  },
  {
    id: 'd4', title: 'Regalia Dance Fan (Pow-Wow)', maker: 'EagleFeather Works', nation: 'Lakota',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    price: 420, originalPrice: 420, currency: 'INDI', totalStock: 1, remaining: 1,
    endsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    category: 'regalia', isSacred: true, badge: 'exclusive',
  },
];

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      expired: diff === 0,
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  });
  return time;
}

function CountdownChip({ endsAt, urgent }: { endsAt: Date; urgent: boolean }) {
  const { h, m, s, expired } = useCountdown(endsAt);
  if (expired) return <span className="text-gray-500 text-xs">Ended</span>;
  return (
    <div className={`flex items-center gap-1 text-xs font-mono font-bold ${urgent ? 'text-[#DC143C]' : 'text-[#d4af37]'}`}>
      <Clock size={11} />
      {h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`}
    </div>
  );
}

function DropCard({ drop, onBuy }: { drop: LimitedDrop; onBuy: (drop: LimitedDrop) => void }) {
  const [saved, setSaved] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);
  const pctUsed = Math.round(((drop.totalStock - drop.remaining) / drop.totalStock) * 100);
  const discount = drop.originalPrice > drop.price ? Math.round(((drop.originalPrice - drop.price) / drop.originalPrice) * 100) : 0;
  const urgent = drop.endsAt.getTime() - now < 60 * 60 * 1000;
  const badge = BADGE_CONFIG[drop.badge];

  return (
    <div className={`group bg-[#141414] rounded-xl border overflow-hidden transition-all hover:border-[#d4af37]/50 ${urgent ? 'border-[#DC143C]/40' : 'border-[#d4af37]/20'}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0a0a0a]">
        <img src={drop.image} alt={drop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
            {badge.icon}{badge.label}
          </span>
          {discount > 0 && (
            <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-[10px] font-bold">
              -{discount}%
            </span>
          )}
          {drop.isSacred && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#DC143C]/80 text-white rounded-full text-[10px]">
              <AlertTriangle size={9} /> Sacred
            </span>
          )}
        </div>

        {/* Countdown overlay */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-xl backdrop-blur-sm ${urgent ? 'bg-[#DC143C]/80' : 'bg-black/60'}`}>
          <CountdownChip endsAt={drop.endsAt} urgent={urgent} />
        </div>

        {/* Save button */}
        <button
          onClick={() => setSaved((s) => !s)}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <Heart size={14} fill={saved ? '#DC143C' : 'none'} className={saved ? 'text-[#DC143C]' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full">{drop.nation}</span>
          <span className="text-gray-500 text-xs capitalize">{drop.category}</span>
        </div>
        <h3 className="text-white font-semibold text-sm mb-0.5 truncate">{drop.title}</h3>
        <p className="text-gray-500 text-xs mb-3">by {drop.maker}</p>

        {/* Stock bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">{drop.remaining} of {drop.totalStock} remaining</span>
            <span className={drop.remaining <= 2 ? 'text-[#DC143C] font-medium' : 'text-gray-500'}>{pctUsed}% claimed</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pctUsed > 80 ? 'bg-[#DC143C]' : 'bg-gradient-to-r from-[#d4af37] to-[#f4e4a6]'}`}
              style={{ width: `${pctUsed}%` }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#d4af37] font-bold text-lg">{drop.price}</span>
              <span className="text-[#d4af37] text-sm">INDI</span>
            </div>
            {discount > 0 && (
              <span className="text-gray-600 text-xs line-through">{drop.originalPrice} INDI</span>
            )}
          </div>
          <button
            onClick={() => onBuy(drop)}
            disabled={drop.remaining === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#d4af37] text-black text-xs font-semibold rounded-xl hover:bg-[#f4e4a6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={12} />
            {drop.remaining === 0 ? 'Sold Out' : 'Buy Drop'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PhysicalLimitedDrops() {
  const [bought, setBought] = useState<Set<string>>(new Set());

  const handleBuy = (drop: LimitedDrop) => {
    setBought((prev) => new Set(prev).add(drop.id));
  };

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#d4af37]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Zap size={16} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Limited Drops &amp; Flash Sales</h3>
            <p className="text-gray-500 text-xs">Time-sensitive — items that won&apos;t be restocked</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-[#d4af37] text-xs hover:underline">
          View all drops <ChevronRight size={12} />
        </button>
      </div>

      {/* Drop grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_DROPS.map((drop) =>
          bought.has(drop.id) ? (
            <div key={drop.id} className="bg-[#0a0a0a] rounded-xl border border-green-500/20 p-6 flex flex-col items-center justify-center gap-2 text-center">
              <CheckCircle size={28} className="text-green-400" />
              <p className="text-white text-sm font-medium">{drop.title}</p>
              <p className="text-green-400 text-xs">Added to cart!</p>
            </div>
          ) : (
            <DropCard key={drop.id} drop={drop} onBuy={handleBuy} />
          )
        )}
      </div>

      {/* Footer note */}
      <div className="px-5 pb-4 flex items-center gap-2 text-xs text-gray-600">
        <Zap size={11} className="text-orange-400" />
        Drops are verified authentic. Sacred items require cultural protocol confirmation before purchase.
      </div>
    </div>
  );
}
