'use client';

import { TrendingUp, Star, BadgeCheck } from 'lucide-react';

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

interface TrendingServicesProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
}

export default function TrendingServices({ services, onServiceSelect }: TrendingServicesProps) {
  // Sort by completed projects for trending
  const trending = [...services]
    .sort((a, b) => b.completedProjects - a.completedProjects)
    .slice(0, 5);

  return (
    <div className="bg-[#141414] border border-[#d4af37]/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-[#d4af37]" />
        <h2 className="text-white text-lg font-bold">Trending Services</h2>
      </div>

      <div className="space-y-3">
        {trending.map((service, idx) => (
          <div
            key={service.id}
            onClick={() => onServiceSelect(service)}
            className="flex items-center gap-4 p-3 bg-[#0f0f0f] rounded-xl hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
          >
            {/* Rank */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              idx === 0 ? 'bg-[#d4af37] text-black' :
              idx === 1 ? 'bg-[#C0C0C0] text-black' :
              idx === 2 ? 'bg-[#CD7F32] text-black' :
              'bg-[#1a1a1a] text-gray-400'
            }`}>
              #{idx + 1}
            </div>

            {/* Avatar */}
            <img
              src={service.freelancerAvatar}
              alt={service.freelancerName}
              className="w-10 h-10 rounded-full object-cover"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-medium text-sm truncate group-hover:text-[#d4af37] transition-colors">
                  {service.title}
                </p>
                <BadgeCheck size={12} className="text-[#d4af37]" />
              </div>
              <p className="text-gray-500 text-xs">
                {service.freelancerName} • {service.freelancerNation}
              </p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
                <span className="text-white text-sm">{service.rating}</span>
              </div>
              <p className="text-gray-500 text-xs">{service.completedProjects} jobs</p>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-gray-400 text-xs">From</p>
              <p className="text-[#d4af37] font-bold">${service.pricingTiers[0]?.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
