'use client';

import { useEffect, useState } from 'react';
import { Zap, Clock, ExternalLink, X } from 'lucide-react';
import { PlacementPill, placementSecondaryButtonClass } from '@/app/components/placements/PremiumPlacement';

interface CollectionLaunchBadgeProps {
  collectionName: string;
  artist: string;
  image: string;
  launchDate?: Date;
  totalItems: number;
  floorPrice: number;
  currency?: string;
  daysRemaining?: number;
  onViewCollection?: () => void;
  onDismiss?: () => void;
}

function LaunchTimer({ daysRemaining }: { daysRemaining: number }) {
  const [timeLeft, setTimeLeft] = useState(() => daysRemaining * 24 * 3600);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);

  return (
    <div className="flex items-center gap-2">
      <Clock size={12} className="text-[#d4af37]" />
      <span className="text-xs text-gray-400">Badge expires in</span>
      <div className="flex items-center gap-1">
        <span className="rounded bg-[#0a0a0a] px-1.5 py-0.5 font-mono text-xs font-bold text-[#d4af37]">{days}d</span>
        <span className="rounded bg-[#0a0a0a] px-1.5 py-0.5 font-mono text-xs font-bold text-[#d4af37]">{String(hours).padStart(2, '0')}h</span>
        <span className="rounded bg-[#0a0a0a] px-1.5 py-0.5 font-mono text-xs font-bold text-[#d4af37]">{String(mins).padStart(2, '0')}m</span>
      </div>
    </div>
  );
}

export default function CollectionLaunchBadge({
  collectionName = 'River Canyon Spirits',
  artist = 'CanyonPainter',
  image = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
  totalItems = 20,
  floorPrice = 180,
  currency = 'INDI',
  daysRemaining = 7,
  onViewCollection,
  onDismiss
}: Partial<CollectionLaunchBadgeProps>) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#DC143C]/50 bg-gradient-to-r from-[#141414] via-[#1a0a0a] to-[#141414] shadow-lg shadow-[#DC143C]/10">
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-gray-400 transition-colors hover:bg-black/80 hover:text-white"
        type="button"
      >
        <X size={12} />
      </button>

      <div className="flex items-center gap-4 p-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
          <img src={image} alt={collectionName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#DC143C] shadow">
            <Zap size={10} className="text-white" fill="white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-[#DC143C] px-2 py-0.5 text-xs font-bold text-white">
              <Zap size={10} fill="white" />
              Featured launch
            </span>
            <PlacementPill className="text-[10px]">Sponsored</PlacementPill>
          </div>
          <h4 className="truncate text-sm font-bold text-white">{collectionName}</h4>
          <p className="text-xs text-gray-400">by {artist} | {totalItems} items | Floor {floorPrice} {currency}</p>
          <div className="mt-1.5">
            <LaunchTimer daysRemaining={daysRemaining} />
          </div>
        </div>

        <button type="button" onClick={onViewCollection} className={`flex-shrink-0 text-xs ${placementSecondaryButtonClass}`}>
          <ExternalLink size={12} />
          Explore
        </button>
      </div>
    </div>
  );
}
