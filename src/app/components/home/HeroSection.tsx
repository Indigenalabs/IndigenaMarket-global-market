'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Volume2 } from 'lucide-react';
import HomeMarketplaceModal, { type HomeMarketplaceItem } from './HomeMarketplaceModal';

const featuredNFTs = [
  {
    id: '1',
    title: 'Sacred Buffalo Spirit',
    artist: 'LakotaDreams',
    price: 250,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&h=600&fit=crop',
    description: 'A powerful representation of the buffalo spirit, symbolizing abundance and gratitude in Lakota tradition.',
    hasVoiceStory: true
  },
  {
    id: '2',
    title: 'Thunderbird Rising',
    artist: 'CoastalArtist',
    price: 420,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=600&fit=crop',
    description: 'The Thunderbird brings storms and renewal, a guardian of the Pacific Northwest tribes.',
    hasVoiceStory: true
  },
  {
    id: '3',
    title: 'Grandmother Moon',
    artist: 'LunarTales',
    price: 275,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&h=600&fit=crop',
    description: 'Grandmother Moon watches over us, guiding through cycles of change and renewal.',
    hasVoiceStory: false
  }
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeModal, setActiveModal] = useState<null | 'details' | 'offer'>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPlaying && !activeModal) {
        setCurrentIndex((prev) => (prev + 1) % featuredNFTs.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [activeModal, isPlaying]);

  const currentNFT = featuredNFTs[currentIndex];
  const currentModalItem: HomeMarketplaceItem = {
    id: currentNFT.id,
    title: currentNFT.title,
    creator: currentNFT.artist,
    image: currentNFT.image,
    price: currentNFT.price,
    currency: currentNFT.currency,
    description: currentNFT.description,
    detailHref: `/marketplace/item/${currentNFT.id}`,
    artistHref: `/artist/${currentNFT.artist.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  };

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featuredNFTs.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featuredNFTs.length) % featuredNFTs.length);

  return (
    <section className="relative h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${currentNFT.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
        <div className="max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#0b0b0b]/75 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-sm font-medium text-[#d4af37]">Featured Artwork</span>
            <span className="text-xs uppercase tracking-[0.18em] text-[#d4af37]/60">Sponsored</span>
          </div>

          <h1 className="mb-4 text-5xl font-bold leading-tight text-white md:text-6xl">{currentNFT.title}</h1>

          <p className="mb-4 text-xl text-[#d4af37]">
            by <span className="font-semibold">{currentNFT.artist}</span>
          </p>

          <p className="mb-6 text-lg leading-relaxed text-gray-300">{currentNFT.description}</p>

          {currentNFT.hasVoiceStory && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="mb-6 flex items-center gap-2 text-gray-400 transition-colors hover:text-[#d4af37]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#d4af37]/20">
                {isPlaying ? <Volume2 size={18} className="text-[#d4af37]" /> : <Play size={18} className="ml-0.5 text-[#d4af37]" />}
              </div>
              <span className="text-sm">Listen to Artist Story</span>
            </button>
          )}

          <div className="flex items-center gap-6">
            <div>
              <p className="mb-1 text-sm text-gray-500">Current Price</p>
              <p className="text-3xl font-bold secondary-gradient">
                {currentNFT.price} {currentNFT.currency}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('details')}
              className="rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] px-8 py-3 font-semibold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#d4af37]/30"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('offer')}
              className="primary-glow rounded-full border border-[#DC143C] px-8 py-3 font-semibold text-[#DC143C] transition-all hover:bg-[#DC143C]/10"
            >
              Make Offer
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#DC143C]/30 bg-black/50 text-[#DC143C] transition-all hover:bg-[#DC143C]/20"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#DC143C]/30 bg-black/50 text-[#DC143C] transition-all hover:bg-[#DC143C]/20"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {featuredNFTs.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-[#DC143C]' : 'w-2 bg-[#DC143C]/30 hover:bg-[#DC143C]/50'}`}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 shimmer" />
      <HomeMarketplaceModal
        item={currentModalItem}
        mode={activeModal || 'details'}
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
      />
    </section>
  );
}
