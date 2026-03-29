'use client';

import { useState } from 'react';
import { X, ExternalLink, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';
import { PlacementPill, PlacementSponsorRow, placementSecondaryButtonClass } from '../placements/PremiumPlacement';

interface CourseSidebarAdProps {
  position?: 'top' | 'middle' | 'bottom';
}

const sidebarAds = [
  {
    id: 'ad-1',
    type: 'course',
    title: 'Master Indigenous Beadwork',
    subtitle: 'New Advanced Course',
    description: 'Learn from award-winning artists',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=200&fit=crop',
    cta: 'View Course',
    link: '/courses/beadwork-master',
    sponsor: 'Heritage Arts Academy',
    price: 'From 299 INDI',
    badge: 'New'
  },
  {
    id: 'ad-2',
    type: 'bundle',
    title: 'Language Preservation Bundle',
    subtitle: 'Save 40%',
    description: '5 courses | 12 months access',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop',
    cta: 'Get Bundle',
    link: '/courses/bundles/language',
    sponsor: 'Tribal Education Fund',
    price: '799 INDI',
    originalPrice: '1,299 INDI',
    badge: 'Best Value'
  },
  {
    id: 'ad-3',
    type: 'membership',
    title: 'Join Elder\'s Circle',
    subtitle: 'Unlimited Learning',
    description: 'Access all courses + live sessions',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&h=200&fit=crop',
    cta: 'Learn More',
    link: '/courses/membership',
    sponsor: 'Indigena Learning',
    price: '49 INDI/month',
    badge: 'Popular'
  },
  {
    id: 'ad-4',
    type: 'event',
    title: 'Live: Navajo Weaving Demo',
    subtitle: 'This Saturday',
    description: 'With master weaver Maria Begay',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&h=200&fit=crop',
    cta: 'Reserve Spot',
    link: '/courses/live/weaving-demo',
    sponsor: 'Cultural Events Co',
    price: 'Free for members',
    badge: 'Live'
  }
];

export default function CourseSidebarAd({ position = 'middle' }: CourseSidebarAdProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const ad = sidebarAds[currentAdIndex];

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % sidebarAds.length);
  };

  if (!isVisible) {
    return (
      <div className="p-4 bg-[#141414] border border-[#d4af37]/10 rounded-xl text-center">
        <button 
          onClick={() => setIsVisible(true)}
          className="text-xs text-gray-500 hover:text-[#d4af37] transition-colors"
        >
          Show sponsored content
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#d4af37]/10">
        <div className="flex items-center gap-1.5">
          <PlacementPill icon={Sparkles}>Sponsored</PlacementPill>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 text-gray-500 hover:text-[#d4af37] transition-colors"
          >
            <Info size={12} />
          </button>
          <button 
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="px-3 py-2 bg-[#d4af37]/5 border-b border-[#d4af37]/10">
          <p className="text-xs text-gray-400">
            Sponsored by {ad.sponsor}. 
            <Link href="/advertising" className="text-[#d4af37] hover:underline ml-1">
              Learn more
            </Link>
          </p>
        </div>
      )}

      {/* Ad Content */}
      <div className="relative">
        <div className="absolute top-2 left-2 z-10">
          <PlacementPill>{ad.badge}</PlacementPill>
        </div>

        {/* Image */}
        <Link href={ad.link}>
          <div className="relative h-32 overflow-hidden">
            <img 
              src={ad.image}
              alt={ad.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          </div>
        </Link>

        {/* Content */}
        <div className="p-3">
          <PlacementSponsorRow sponsor={ad.sponsor} right={<span className="text-[11px] text-gray-500">Sidebar slot</span>} />
          <p className="text-xs text-[#d4af37] mb-1">{ad.subtitle}</p>
          <h4 className="text-sm font-semibold text-white mb-1">{ad.title}</h4>
          <p className="text-xs text-gray-400 mb-3">{ad.description}</p>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#d4af37] font-bold text-sm">{ad.price}</span>
            {ad.originalPrice && (
              <span className="text-xs text-gray-500 line-through">{ad.originalPrice}</span>
            )}
          </div>

          {/* CTA */}
          <Link 
            href={ad.link}
            className={`${placementSecondaryButtonClass} w-full text-xs`}
          >
            {ad.cta}
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Ad Navigation */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[#d4af37]/10">
        <div className="flex items-center gap-1">
          {sidebarAds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentAdIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === currentAdIndex ? 'bg-[#d4af37]' : 'bg-[#d4af37]/20'
              }`}
            />
          ))}
        </div>
        <button 
          onClick={handleNextAd}
          className="text-xs text-gray-500 hover:text-[#d4af37] transition-colors"
        >
          Next ad
        </button>
      </div>

      {/* Promote CTA */}
      <div className="px-3 py-2 bg-[#d4af37]/5 border-t border-[#d4af37]/10 text-center">
        <Link 
          href="/courses/promote"
          className="text-xs text-[#d4af37]/70 hover:text-[#d4af37] transition-colors"
        >
          Advertise here
        </Link>
      </div>
    </div>
  );
}

