'use client';

import { Heart, Trash2, ExternalLink, Star } from 'lucide-react';

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

interface SavedServicesProps {
  services: Service[];
  onRemove: (id: string) => void;
  onView: (service: Service) => void;
}

export default function SavedServices({ services, onRemove, onView }: SavedServicesProps) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Heart size={48} className="text-gray-600 mb-4" />
        <p className="text-white font-medium mb-1">No saved services</p>
        <p className="text-gray-500 text-sm">Services you save will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-center gap-4 p-3 bg-[#0f0f0f] rounded-xl border border-white/5 hover:border-[#d4af37]/30 transition-all"
        >
          {/* Image */}
          <img
            src={service.portfolio[0]?.image}
            alt={service.title}
            className="w-16 h-12 rounded-lg object-cover"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{service.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <img
                src={service.freelancerAvatar}
                alt={service.freelancerName}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="text-gray-400 text-xs">{service.freelancerName}</span>
              <span className="text-gray-500 text-xs">• {service.freelancerNation}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
            <span className="text-white text-sm">{service.rating}</span>
            <span className="text-gray-500 text-xs">({service.reviewCount})</span>
          </div>

          {/* Price */}
          <p className="text-[#d4af37] font-bold">${service.pricingTiers[0]?.price}</p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(service)}
              className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors"
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={() => onRemove(service.id)}
              className="p-2 text-gray-400 hover:text-[#DC143C] transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
