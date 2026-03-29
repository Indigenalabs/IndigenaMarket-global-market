'use client';

import { useState, useEffect } from 'react';
import { Star, BadgeCheck, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const featuredPros = [
  {
    id: '1',
    name: 'Dr. Sarah Whitehorse',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    nation: 'Lakota',
    title: 'Cultural Consulting for Film & Media',
    rating: 4.9,
    reviews: 47,
    verification: 'Platinum',
    startingPrice: 250,
    category: 'Consulting'
  },
  {
    id: '2',
    name: 'Eleanor Black Elk',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    nation: 'Lakota',
    title: 'Lakota Language Translation & Interpretation',
    rating: 5.0,
    reviews: 34,
    verification: 'Platinum',
    startingPrice: 35,
    category: 'Translation'
  },
  {
    id: '3',
    name: 'Joseph Firekeeper',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    nation: 'Cherokee',
    title: 'Traditional Storytelling & Performance',
    rating: 4.9,
    reviews: 89,
    verification: 'Platinum',
    startingPrice: 150,
    category: 'Cultural Guidance'
  }
];

const verificationColors: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2'
};

export default function FeaturedProBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPros.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const pro = featuredPros[currentIndex];

  return (
    <div className="relative bg-gradient-to-r from-[#d4af37]/20 via-[#141414] to-[#DC143C]/20 rounded-2xl p-6 mb-8 overflow-hidden border border-[#d4af37]/30">
      {/* Premium badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-[#d4af37] text-black text-xs font-semibold rounded-full">
        <Zap size={10} />
        FEATURED • $300/wk
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#DC143C] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={pro.avatar}
            alt={pro.name}
            className="w-20 h-20 rounded-full object-cover border-4"
            style={{ borderColor: verificationColors[pro.verification] }}
          />
          <div
            className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: verificationColors[pro.verification], color: 'black' }}
          >
            {pro.verification}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-lg">{pro.name}</h3>
            <BadgeCheck size={16} style={{ color: verificationColors[pro.verification] }} />
            <span className="text-gray-400 text-sm">• {pro.nation} Nation</span>
          </div>
          <p className="text-gray-300 text-sm mb-2">{pro.title}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
              <span className="text-white font-medium">{pro.rating}</span>
              <span className="text-gray-500">({pro.reviews} reviews)</span>
            </span>
            <span className="px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-xs rounded-full">
              {pro.category}
            </span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="text-right">
          <p className="text-gray-400 text-xs mb-1">Starting at</p>
          <p className="text-[#d4af37] font-bold text-2xl">${pro.startingPrice}</p>
          <button className="mt-2 px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all">
            View Service
          </button>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredPros.length - 1 : prev - 1))}
            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredPros.length)}
            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {featuredPros.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'w-6 bg-[#d4af37]' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 left-3 p-1 text-gray-500 hover:text-white transition-colors"
      >
        ×
      </button>
    </div>
  );
}
