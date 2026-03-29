'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Package, MapPin, Award, UserPlus, Check } from 'lucide-react';

const promotedMakers = [
  {
    id: '1',
    name: 'DesertRose Pottery',
    title: 'Hopi Pottery Artisan',
    nation: 'Hopi',
    hubCity: 'Albuquerque, NM',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    rating: 4.8,
    items: 9,
    sales: 128,
    badge: 'Top Seller',
    isVerified: true,
    topPiece: 'Pueblo Pottery Vessel',
    topPrice: 320,
  },
  {
    id: '2',
    name: 'SilverBear Jewelry',
    title: 'Sterling Silver Jeweler',
    nation: 'Lakota',
    hubCity: 'Rapid City, SD',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop',
    rating: 5.0,
    items: 23,
    sales: 312,
    badge: 'Elder Endorsed',
    isVerified: true,
    topPiece: 'Turquoise Inlay Bracelet',
    topPrice: 420,
  },
  {
    id: '3',
    name: 'James Thundercloud',
    title: 'Spirit Carver',
    nation: 'Haudenosaunee',
    hubCity: 'Vancouver, BC',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 4.9,
    items: 12,
    sales: 156,
    badge: 'Master Artisan',
    isVerified: true,
    topPiece: 'Red Cedar Spirit Carving',
    topPrice: 890,
  },
];

export default function PromotedMakerCard() {
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setFollowed((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c]">
          Promoted makers
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {promotedMakers.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-3 transition-all hover:border-[#d4af37]/50"
          >
            <div className="mb-2 flex items-start gap-2">
              <div className="relative flex-shrink-0">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-10 w-10 rounded-full border border-[#d4af37]/30 object-cover"
                />
                {m.isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#d4af37]">
                    <Award size={9} className="text-black" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{m.name}</p>
                <p className="text-[10px] text-[#d4af37]">{m.nation}</p>
                <span className="text-[10px] text-gray-500">{m.title}</span>
              </div>
            </div>

            <div className="mb-2 flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-0.5">
                <Star size={9} className="fill-[#d4af37] text-[#d4af37]" />
                {m.rating}
              </span>
              <span className="flex items-center gap-0.5">
                <Package size={9} />
                {m.items} items
              </span>
              <span className="flex items-center gap-0.5">
                <MapPin size={9} />
                {m.hubCity.split(',')[0]}
              </span>
            </div>

            <p className="mb-2 line-clamp-1 text-[10px] text-gray-400">
              Top: {m.topPiece} | <span className="text-[#d4af37]">{m.topPrice} INDI</span>
            </p>

            <div className="flex gap-1.5">
              <Link
                href={`/profile/${encodeURIComponent(m.name)}`}
                className="flex-1 rounded-lg border border-[#d4af37]/30 bg-[#0a0a0a] py-1 text-center text-[10px] font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
              >
                View Shop
              </Link>
              <button
                onClick={() => toggle(m.id)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
                  followed.has(m.id)
                    ? 'border border-green-600/30 bg-green-600/20 text-green-400'
                    : 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
                }`}
              >
                {followed.has(m.id) ? <Check size={9} /> : <UserPlus size={9} />}
                {followed.has(m.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
