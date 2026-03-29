'use client';

import { useState, useEffect } from 'react';
import { Crown, X, ArrowRight, Sparkles, Flame, Clock } from 'lucide-react';
import Link from 'next/link';

interface TrendingTakeoverProps {
  autoRotate?: boolean;
  rotationInterval?: number;
}

const takeoverAds = [
  {
    id: 'takeover-1',
    title: 'Thunderbird Rising Collection',
    subtitle: 'Limited Edition Drop',
    description: 'Exclusive collection from award-winning Indigenous artist. Only 50 pieces available.',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&h=500&fit=crop',
    cta: 'Explore Collection',
    link: '/collection/thunderbird-rising',
    sponsor: 'Heritage Arts Foundation',
    price: 'From 299 INDI',
    badge: 'Featured Drop',
    countdown: '2 days left',
    stats: {
      items: 50,
      sold: 32,
      collectors: 89
    }
  },
  {
    id: 'takeover-2',
    title: 'Sacred Geometry Series',
    subtitle: 'Artist Spotlight',
    description: 'Master artisan Maria Begay presents her most ambitious work yet.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=500&fit=crop',
    cta: 'View Collection',
    link: '/artist/maria-begay',
    sponsor: 'Southwest Arts Council',
    price: 'From 450 INDI',
    badge: 'Artist Spotlight',
    countdown: '5 days left',
    stats: {
      items: 24,
      sold: 18,
      collectors: 45
    }
  },
  {
    id: 'takeover-3',
    title: 'Coastal Nations Festival',
    subtitle: 'Event Promotion',
    description: 'Virtual art festival featuring 50+ Indigenous artists. Live now!',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=1200&h=500&fit=crop',
    cta: 'Join Festival',
    link: '/events/coastal-festival',
    sponsor: 'Pacific Arts Network',
    price: 'Free Entry',
    badge: 'Live Event',
    countdown: 'Happening now',
    stats: {
      items: 200,
      artists: 50,
      viewers: 3400
    }
  }
];

export default function TrendingTakeover({ autoRotate = true, rotationInterval = 8000 }: TrendingTakeoverProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const currentAd = takeoverAds[currentIndex];

  useEffect(() => {
    if (!autoRotate || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % takeoverAds.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, isPaused, rotationInterval]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % takeoverAds.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + takeoverAds.length) % takeoverAds.length);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="relative mb-8 rounded-2xl overflow-hidden border border-[#d4af37]/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image */}
      <div className="relative h-80">
        <img 
          src={currentAd.image}
          alt={currentAd.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Sponsored Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[#d4af37]/20 backdrop-blur-sm border border-[#d4af37]/40 rounded-full">
          <Crown size={14} className="text-[#d4af37]" />
          <span className="text-[#d4af37] text-xs font-medium">SPONSORED</span>
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-32 flex items-center gap-1 px-3 py-1.5 bg-[#DC143C] rounded-full">
          <Flame size={14} className="text-white" />
          <span className="text-white text-xs font-bold">{currentAd.badge}</span>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Countdown */}
        <div className="absolute top-4 right-16 flex items-center gap-1 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
          <Clock size={14} className="text-[#d4af37]" />
          <span className="text-white text-xs">{currentAd.countdown}</span>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center p-8">
          <div className="max-w-lg">
            <p className="text-[#d4af37] text-sm font-medium mb-2">{currentAd.subtitle}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{currentAd.title}</h2>
            <p className="text-gray-300 mb-6 line-clamp-2">{currentAd.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6">
              <div>
                <p className="text-2xl font-bold text-white">{currentAd.stats.items}</p>
                <p className="text-xs text-gray-400">Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{currentAd.stats.sold || currentAd.stats.artists}</p>
                <p className="text-xs text-gray-400">{currentAd.stats.sold ? 'Sold' : 'Artists'}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{currentAd.stats.collectors || currentAd.stats.viewers}</p>
                <p className="text-xs text-gray-400">{currentAd.stats.collectors ? 'Collectors' : 'Viewers'}</p>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400">{currentAd.sponsor}</p>
                <p className="text-xl font-bold text-[#d4af37]">{currentAd.price}</p>
              </div>
              <Link 
                href={currentAd.link}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
              >
                {currentAd.cta}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {takeoverAds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'w-6 bg-[#d4af37]' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Promote CTA Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#141414] border-t border-[#d4af37]/20">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#d4af37]" />
          <span className="text-sm text-gray-400">Want premium visibility?</span>
        </div>
        <Link 
          href="/marketplace/promote?type=takeover"
          className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
        >
          Book a Trending Takeover
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

