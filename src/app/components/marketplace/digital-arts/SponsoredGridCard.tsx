'use client';

import { Crown, ExternalLink, Tag } from 'lucide-react';

interface SponsoredGridCardProps {
  title: string;
  artist: string;
  image: string;
  price: number;
  currency?: string;
  tag?: string;
  ctaLabel?: string;
  onViewArtwork?: () => void;
}

export default function SponsoredGridCard({
  title = 'Celestial Dreamcatcher Series',
  artist = 'NightSkyWeaver',
  image = 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=600&fit=crop',
  price = 195,
  currency = 'INDI',
  tag = 'Mystic | Ojibwe',
  ctaLabel = 'View Artwork',
  onViewArtwork,
}: Partial<SponsoredGridCardProps>) {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#d4af37]/40 bg-[#141414] shadow-md shadow-[#d4af37]/10 transition-all hover:border-[#d4af37]/70">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#0b0b0b]/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c] backdrop-blur-sm">
          <Crown size={10} />
          Featured placement
        </div>

        {tag && (
          <div className="absolute right-3 top-3 z-10 flex max-w-[42%] items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1 text-xs text-gray-300 backdrop-blur-sm">
            <Tag size={10} />
            <span className="truncate">{tag}</span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={onViewArtwork}
            className="flex items-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2.5 font-semibold text-black shadow-lg transition-colors hover:bg-[#f4e4a6]"
          >
            <ExternalLink size={15} />
            {ctaLabel}
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold text-white">{title}</p>
            <p className="mt-0.5 text-xs text-gray-400">by {artist}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#d4af37]">{price} {currency}</p>
            <p className="text-[11px] text-gray-500">Buy now</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/8 pt-3">
          <span className="rounded-full bg-[#d4af37]/8 px-2.5 py-1 text-[11px] text-[#d4af37]/75">
            Sponsored artist spotlight
          </span>
          <button
            onClick={onViewArtwork}
            className="text-xs font-medium text-[#d4af37] transition-colors hover:text-[#f4e4a6]"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
