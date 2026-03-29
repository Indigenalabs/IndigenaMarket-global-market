'use client';

import { Sparkles, Pin, ExternalLink, ArrowUpRight } from 'lucide-react';
import { PlacementPill, placementPrimaryButtonClass } from '@/app/components/placements/PremiumPlacement';

interface NewArrivalsPinnedCardProps {
  title: string;
  artist: string;
  image: string;
  price: number;
  currency?: string;
  nation?: string;
  onViewArtwork?: () => void;
}

export default function NewArrivalsPinnedCard({
  title = 'Morning Prayer Digital Print',
  artist = 'CoastalElder',
  image = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  price = 140,
  currency = 'INDI',
  nation = 'Coast Salish',
  onViewArtwork
}: Partial<NewArrivalsPinnedCardProps>) {
  return (
    <div className="group relative mb-4 cursor-pointer overflow-hidden rounded-xl border border-[#d4af37]/50 shadow-lg shadow-[#d4af37]/10 transition-all hover:border-[#d4af37]/80">
      <div className="absolute top-3 left-3 z-10">
        <PlacementPill icon={Pin}>Featured</PlacementPill>
      </div>
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-[#d4af37]/30 bg-black/60 px-2 py-1 text-xs text-[#d4af37] backdrop-blur-sm">
        <Sparkles size={10} />
        New arrival
      </div>

      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 overflow-hidden sm:h-auto sm:w-56 sm:flex-shrink-0">
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent to-[#141414] sm:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent sm:hidden" />
        </div>

        <div className="flex flex-1 flex-col justify-between bg-[#141414] p-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-lg font-bold leading-tight text-white">{title}</h4>
                <p className="mt-0.5 text-sm text-gray-400">by {artist}</p>
                {nation ? (
                  <span className="mt-1 inline-block rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-2 py-0.5 text-xs text-[#d4af37]">
                    {nation}
                  </span>
                ) : null}
              </div>
              <ArrowUpRight size={18} className="mt-1 flex-shrink-0 text-[#d4af37]" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-[#d4af37]">
                {price} <span className="text-sm font-medium">{currency}</span>
              </p>
              <p className="text-xs text-gray-500">Fixed price</p>
            </div>
            <button type="button" onClick={onViewArtwork} className={`${placementPrimaryButtonClass} px-4 py-2`}>
              <ExternalLink size={14} />
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
