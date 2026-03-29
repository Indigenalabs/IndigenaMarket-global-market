'use client';

import { Star, Clock, CheckCircle, Heart, MapPin, BadgeCheck, Eye } from 'lucide-react';
import { getMarketplaceCardMerchandising } from '../marketplaceCardMerchandising';

interface PricingTier {
  name: string;
  price: number;
  deliveryDays: number;
  features: string[];
}

interface Service {
  id: string;
  title: string;
  description: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerNation: string;
  category: string;
  skills: string[];
  pricingTiers: PricingTier[];
  portfolio: { title: string; image: string; description: string }[];
  rating: number;
  reviewCount: number;
  completedProjects: number;
  responseTime: string;
  verification: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  isVerified: boolean;
  languages: string[];
  location: string;
  available: boolean;
  featured?: boolean;
}

interface ServiceCardProps {
  service: Service;
  viewMode: 'grid' | 'list';
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: (e: React.MouseEvent) => void;
  onToggleSave: (e: React.MouseEvent) => void;
  onSelect: () => void;
}

const verificationColors = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2'
};

export default function ServiceCard({
  service,
  viewMode,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onSelect
}: ServiceCardProps) {
  const lowestPrice = service.pricingTiers[0]?.price || 0;
  const verificationColor = verificationColors[service.verification];
  const merch = getMarketplaceCardMerchandising({
    title: service.title,
    pillarLabel: 'Freelancing',
    image: service.portfolio[0]?.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
    coverImage: service.portfolio[0]?.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
    galleryOrder: service.portfolio.map((entry) => entry.image),
    ctaMode: service.available ? 'quote' : 'message',
    ctaPreset: service.available ? 'request-quote' : 'message-first',
    availabilityLabel: service.available ? 'Open for work' : 'Unavailable',
    availabilityTone: service.available ? 'success' : 'danger',
    featured: Boolean(service.featured),
    merchandisingRank: service.featured ? 4 : 10,
    status: service.available ? 'Active' : 'Unavailable',
    priceLabel: `From ${lowestPrice}`,
    blurb: service.description,
  });

  if (viewMode === 'list') {
    return (
      <div
        onClick={onSelect}
        className="group bg-[#141414] border border-[#d4af37]/20 rounded-xl overflow-hidden hover:border-[#d4af37]/50 transition-all cursor-pointer flex"
      >
        {/* Image */}
        <div className="relative w-48 flex-shrink-0">
          <img
            src={merch.image}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          {service.featured && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-[#d4af37] text-black text-xs font-semibold rounded">
              Featured
            </span>
          )}
          {!service.available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-medium">Unavailable</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate group-hover:text-[#d4af37] transition-colors">
                {service.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={service.freelancerAvatar}
                  alt={service.freelancerName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-gray-400 text-sm">{service.freelancerName}</span>
                {service.isVerified && (
                  <BadgeCheck size={14} style={{ color: verificationColor }} />
                )}
                <span className="text-gray-500 text-xs">• {service.freelancerNation}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#d4af37] font-bold text-lg">From ${lowestPrice}</p>
              <div className="flex items-center gap-1 justify-end mt-1">
                <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
                <span className="text-white text-sm">{service.rating}</span>
                <span className="text-gray-500 text-xs">({service.reviewCount})</span>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{service.description}</p>

          <div className="flex items-center justify-between mt-auto pt-3">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {service.responseTime}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={12} />
                {service.completedProjects} jobs
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {service.location}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleLike}
                className={`p-2 rounded-lg transition-colors ${isLiked ? 'text-[#DC143C]' : 'text-gray-500 hover:text-white'}`}
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={onToggleSave}
                className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-[#d4af37]' : 'text-gray-500 hover:text-white'}`}
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={onSelect}
      className="group bg-[#141414] border border-[#d4af37]/20 rounded-xl overflow-hidden hover:border-[#d4af37]/50 transition-all cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-video">
        <img
          src={merch.image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {service.featured && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-[#d4af37] text-black text-xs font-semibold rounded">
            Featured
          </span>
        )}
        {!service.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-medium">Unavailable</span>
          </div>
        )}
        
        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleLike}
            className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors ${
              isLiked ? 'bg-[#DC143C] text-white' : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onToggleSave}
            className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors ${
              isSaved ? 'bg-[#d4af37] text-black' : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Verification badge */}
        <div
          className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
          style={{ backgroundColor: verificationColor, color: service.verification === 'Gold' ? 'black' : 'white' }}
        >
          {service.verification}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={service.freelancerAvatar}
            alt={service.freelancerName}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-gray-300 text-sm truncate">{service.freelancerName}</span>
          {service.isVerified && (
            <BadgeCheck size={14} style={{ color: verificationColor }} />
          )}
        </div>

        <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-[#d4af37] transition-colors mb-2">
          {service.title}
        </h3>

        <div className="flex flex-wrap gap-1 mb-3">
          {service.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {service.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-full">
              +{service.skills.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-xs">Starting at</span>
            <p className="text-[#d4af37] font-bold">${lowestPrice}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
            <span className="text-white text-sm">{service.rating}</span>
            <span className="text-gray-500 text-xs">({service.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {service.responseTime}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={10} />
            {service.completedProjects} jobs
          </span>
        </div>
      </div>
    </div>
  );
}
