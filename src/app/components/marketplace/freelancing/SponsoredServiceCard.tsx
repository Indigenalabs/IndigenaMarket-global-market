'use client';

import { ArrowRight, BadgeCheck, Crown, Star } from 'lucide-react';
import { PlacementPill, PlacementSponsorRow, placementSecondaryButtonClass } from '@/app/components/placements/PremiumPlacement';

export default function SponsoredServiceCard() {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-[#d4af37]/40 bg-gradient-to-br from-[#d4af37]/10 to-[#141414] transition-all hover:border-[#d4af37]">
      <div className="relative aspect-video">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop"
          alt="Sponsored Service"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <PlacementPill icon={Crown}>Featured</PlacementPill>
          <PlacementPill tone="neutral">Sponsored</PlacementPill>
        </div>
      </div>

      <div className="p-4">
        <PlacementSponsorRow sponsor="Indigenous Growth Studio" right={<span className="text-[11px] text-gray-500">Priority listing</span>} />

        <div className="mb-2 flex items-center gap-2">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop"
            alt="Sponsored Pro"
            className="h-8 w-8 rounded-full border-2 border-[#d4af37] object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">Jennifer Whitecloud</p>
            <p className="text-xs text-gray-400">Dine Nation</p>
          </div>
          <BadgeCheck size={14} className="text-[#FFD700]" />
        </div>

        <h3 className="mb-2 text-sm font-semibold text-white transition-colors group-hover:text-[#d4af37]">Indigenous Marketing Strategy</h3>

        <div className="mb-3 flex flex-wrap gap-1">
          {['Social Media', 'Brand Storytelling'].map((skill) => (
            <span key={skill} className="rounded-full bg-[#d4af37]/10 px-2 py-0.5 text-xs text-[#d4af37]">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">From</span>
            <p className="font-bold text-[#d4af37]">$200</p>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-[#d4af37] text-[#d4af37]" />
            <span className="text-sm text-white">4.8</span>
            <span className="text-xs text-gray-500">(56)</span>
          </div>
        </div>

        <button className={`mt-4 flex w-full items-center justify-center gap-2 py-2.5 text-sm ${placementSecondaryButtonClass}`}>
          View service
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 bg-[#d4af37]/5" />
      </div>
    </div>
  );
}
