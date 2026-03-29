'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';

interface BannerAd {
  id: string;
  message: string;
  cta: string;
  link: string;
  sponsor: string;
  color: 'gold' | 'red' | 'purple';
}

const bannerAds: BannerAd[] = [
  {
    id: '1',
    message: 'New collection dropping tomorrow from ThunderVoice.',
    cta: 'Preview Now',
    link: '/drops',
    sponsor: 'ThunderVoice Studio',
    color: 'gold'
  },
  {
    id: '2',
    message: 'Traditional beadwork workshop registration is now open.',
    cta: 'Register',
    link: '/community/events/event-1',
    sponsor: 'Maria Redfeather',
    color: 'red'
  },
  {
    id: '3',
    message: 'Featured event: Indigenous Art Market NYC, March 22 to 24.',
    cta: 'Get Tickets',
    link: '/community/events/event-2',
    sponsor: 'Indigena Events',
    color: 'purple'
  }
];

function getColorClasses(color: string) {
  switch (color) {
    case 'gold':
      return 'bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/10 to-[#d4af37]/20 border-[#d4af37]/30 text-[#d4af37]';
    case 'red':
      return 'bg-gradient-to-r from-[#DC143C]/20 via-[#DC143C]/10 to-[#DC143C]/20 border-[#DC143C]/30 text-[#DC143C]';
    case 'purple':
      return 'bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-purple-500/20 border-purple-500/30 text-purple-400';
    default:
      return 'bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/10 to-[#d4af37]/20 border-[#d4af37]/30 text-[#d4af37]';
  }
}

export default function StickyBanner() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % bannerAds.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [isDismissed]);

  if (isDismissed || !isVisible) return null;

  const currentAd = bannerAds[currentAdIndex];
  const colorClasses = getColorClasses(currentAd.color);

  return (
    <div className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${colorClasses} transition-all duration-500`}>
      <div className="mx-auto max-w-7xl px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center justify-center gap-3 overflow-hidden">
            <Sparkles size={16} className="flex-shrink-0" />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-center text-sm font-medium sm:text-left">{currentAd.message}</span>
              <span className="rounded-full border border-white/10 bg-black/15 px-2 py-0.5 text-[11px] opacity-80">
                Sponsored by {currentAd.sponsor}
              </span>
              <button
                className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white/20"
                onClick={() => {
                  window.location.href = currentAd.link;
                }}
              >
                {currentAd.cta}
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-white/10"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-1 flex justify-center gap-1">
          {bannerAds.map((_, index) => (
            <div
              key={index}
              className={`h-0.5 rounded-full transition-all duration-300 ${index === currentAdIndex ? 'w-6 opacity-100' : 'w-2 opacity-40'}`}
              style={{ backgroundColor: 'currentColor' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
