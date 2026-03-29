'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Star } from 'lucide-react';

const makerActivities = [
  { maker: 'Maria Redfeather', action: 'just shipped 3 Navajo rugs from', hub: 'Phoenix Hub', time: '2m ago' },
  { maker: 'James Thundercloud', action: 'listed new hand-carved totem from', hub: 'Vancouver Hub', time: '8m ago' },
  { maker: 'SilverBirch Crafts', action: 'fulfilled 5 beadwork orders via', hub: 'Winnipeg Hub', time: '15m ago' },
  { maker: 'CoastalWeaver', action: 'received 5-star review. Ships from', hub: 'Seattle Hub', time: '22m ago' },
  { maker: 'DesertRose Pottery', action: 'added AR preview for new collection at', hub: 'Albuquerque Hub', time: '31m ago' },
  { maker: 'EagleFeather Works', action: 'opened pre-orders shipping from', hub: 'Denver Hub', time: '45m ago' },
];

export default function MakerSpotlight() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    let position = 0;
    const speed = 0.5;

    const animate = () => {
      position -= speed;
      const halfWidth = ticker.scrollWidth / 2;
      if (Math.abs(position) >= halfWidth) {
        position = 0;
      }
      ticker.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(animate);
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const doubled = [...makerActivities, ...makerActivities];

  return (
    <div className="bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414] border-y border-[#d4af37]/20 py-3 mb-6 overflow-hidden">
      <div className="flex items-center">
        {/* Static label */}
        <div className="flex items-center gap-2 px-4 flex-shrink-0 border-r border-[#d4af37]/20 mr-4">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
            <Package size={16} className="text-[#d4af37]" />
          </div>
          <span className="text-[#d4af37] text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Maker Activity
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div ref={tickerRef} className="flex items-center gap-8 whitespace-nowrap will-change-transform">
            {doubled.map((activity, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[#d4af37] text-sm font-medium">{activity.maker}</span>
                <span className="text-gray-400 text-sm">{activity.action}</span>
                <span className="text-white text-sm font-medium">{activity.hub}</span>
                <span className="text-gray-600 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature CTA */}
        <Link
          href="/creator-hub"
          className="flex items-center gap-2 px-4 py-1.5 mx-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full text-[#d4af37] text-xs font-medium hover:bg-[#d4af37]/20 transition-colors whitespace-nowrap flex-shrink-0"
        >
          <Star size={12} />
          Feature Your Work
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
