'use client';

import { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Verified } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: 'buyer' | 'seller' | 'collector';
  avatar: string;
  rating: number;
  text: string;
  itemName?: string;
  itemImage?: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    role: 'collector',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Indigena has completely transformed how I collect Indigenous art. The authenticity verification gives me confidence, and knowing my purchases directly support the artists and their communities makes each piece even more meaningful.',
    itemName: 'Sacred Eagle NFT',
    itemImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
    verified: true
  },
  {
    id: '2',
    name: 'James Blackwood',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    text: 'As someone new to NFTs, I was worried about getting started. The platform is incredibly intuitive, and the community is so welcoming. I\'ve discovered amazing artists I never would have found otherwise.',
    verified: true
  },
  {
    id: '3',
    name: 'Maria Redfeather',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
    text: 'As an Indigenous artist, Indigena has given me a platform to share my culture with the world while maintaining control of my work. The 0% fees for creators is unheard of in this industry. Truly a game-changer.',
    verified: true
  },
  {
    id: '4',
    name: 'David Chen',
    role: 'collector',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 5,
    text: 'The curation quality is exceptional. Every piece tells a story, and the artist profiles help me understand the cultural significance behind the art. It\'s more than collecting - it\'s preserving heritage.',
    itemName: 'Dream Catcher Collection',
    itemImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop',
    verified: true
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-10 px-6 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4af37]/10 rounded-full mb-3">
            <Quote size={14} className="text-[#d4af37]" />
            <span className="text-[#d4af37] text-xs font-medium">Community Stories</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">What Our Community Says</h2>
        </div>

        {/* Testimonial Card */}
        <div className="relative bg-[#141414] rounded-xl border border-[#d4af37]/10 p-6">
          <div className="flex flex-col gap-4">
            {/* Content */}
            <div className="text-center">
              {/* Rating */}
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < current.rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-base text-gray-300 leading-relaxed mb-4">
                &ldquo;{current.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-white font-semibold text-sm">{current.name}</span>
                    {current.verified && (
                      <div className="w-3 h-3 bg-[#d4af37] rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-[#d4af37] text-xs capitalize">{current.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#d4af37]/10">
            <div className="flex items-center gap-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-4 bg-[#d4af37]' : 'w-1.5 bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrev}
                className="w-8 h-8 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-full flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNext}
                className="w-8 h-8 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-full flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
