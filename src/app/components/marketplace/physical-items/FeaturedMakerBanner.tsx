'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, MapPin, Award, Package, ChevronLeft, ChevronRight } from 'lucide-react';

const featuredMakers = [
  {
    id: '1',
    name: 'Maria Redfeather',
    title: 'Master Beadwork Artist',
    nation: 'Navajo',
    hubCity: 'Phoenix, AZ',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&h=400&fit=crop',
    tagline: 'Five generations of beadwork tradition, now available worldwide.',
    rating: 4.9,
    totalSales: 234,
    items: 18,
    topItem: { title: 'Hand-Beaded Medicine Bag', price: 185 },
    badge: 'Top Maker 2024',
    isVerified: true,
  },
  {
    id: '2',
    name: 'WeavingWoman',
    title: 'Traditional Navajo Weaver',
    nation: 'Navajo',
    hubCity: 'Phoenix, AZ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&h=400&fit=crop',
    tagline: 'Hand-woven Two-Grey-Hills rugs using natural dyes and churro wool.',
    rating: 5.0,
    totalSales: 89,
    items: 6,
    topItem: { title: 'Two-Grey-Hills Rug', price: 650 },
    badge: 'Elder Endorsed',
    isVerified: true,
  },
  {
    id: '3',
    name: 'James Thundercloud',
    title: 'Northwest Coast Carver',
    nation: 'Haudenosaunee',
    hubCity: 'Vancouver, BC',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=1200&h=400&fit=crop',
    tagline: 'Spirit carvings from salvaged old-growth cedar, made with hand tools and traditional process.',
    rating: 4.9,
    totalSales: 156,
    items: 12,
    topItem: { title: 'Red Cedar Spirit Carving', price: 890 },
    badge: 'Master Artisan',
    isVerified: true,
  },
];

export default function FeaturedMakerBanner() {
  const [active, setActive] = useState(0);
  const maker = featuredMakers[active];

  const prev = () => setActive((i) => (i - 1 + featuredMakers.length) % featuredMakers.length);
  const next = () => setActive((i) => (i + 1) % featuredMakers.length);

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-[#d4af37]/30 shadow-lg shadow-[#d4af37]/10">
      <div className="absolute left-4 top-4 z-20 rounded-full border border-[#d4af37]/35 bg-[#0b0b0b]/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c] backdrop-blur-sm">
        Featured maker placement
      </div>

      <button
        onClick={prev}
        className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
      >
        <ChevronRight size={16} />
      </button>

      <div className="relative h-52 overflow-hidden">
        <img src={maker.coverImage} alt={maker.name} className="h-full w-full object-cover transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="absolute inset-0 flex items-end p-6">
        <div className="flex w-full items-end gap-5">
          <div className="relative flex-shrink-0">
            <img
              src={maker.avatar}
              alt={maker.name}
              className="h-16 w-16 rounded-full border-2 border-[#d4af37] object-cover"
            />
            {maker.isVerified && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37]">
                <Award size={11} className="text-black" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-white">{maker.name}</h3>
              <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/20 px-2 py-0.5 text-xs text-[#d4af37]">
                {maker.badge}
              </span>
            </div>
            <p className="mb-1 text-sm text-[#d4af37]">{maker.title}</p>
            <p className="mb-2 max-w-lg line-clamp-1 text-sm text-gray-300">{maker.tagline}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><MapPin size={11} />{maker.hubCity}</span>
              <span className="flex items-center gap-1"><Star size={11} className="fill-[#d4af37] text-[#d4af37]" />{maker.rating}</span>
              <span className="flex items-center gap-1"><Package size={11} />{maker.items} items</span>
              <span className="text-green-400">{maker.totalSales} sales</span>
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-col gap-2">
            <Link
              href={`/profile/${encodeURIComponent(maker.name)}`}
              className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#f4e4a6]"
            >
              View Shop
              <ArrowRight size={14} />
            </Link>
            <p className="text-center text-xs text-gray-500">
              {maker.topItem.title} | {maker.topItem.price} INDI
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {featuredMakers.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${i === active ? 'w-4 bg-[#d4af37]' : 'w-1.5 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}
