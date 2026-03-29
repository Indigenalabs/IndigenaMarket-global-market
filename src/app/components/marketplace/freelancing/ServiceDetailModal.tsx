'use client';

import { useState } from 'react';
import {
  X, Star, Clock, CheckCircle, Heart, MapPin, BadgeCheck, Share2,
  ChevronLeft, ChevronRight, MessageCircle, Calendar, Shield, Globe
} from 'lucide-react';
import QuickHireModal from './QuickHireModal';

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
}

interface ServiceDetailModalProps {
  service: Service;
  onClose: () => void;
}

const verificationColors = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2'
};

// Mock reviews
const mockReviews = [
  {
    id: '1',
    author: 'Tribal Council Office',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
    rating: 5,
    comment: 'Exceptional cultural consulting. Dr. Whitehorse provided invaluable guidance that transformed our documentary project.',
    date: '2 weeks ago',
    tier: 'Production Package'
  },
  {
    id: '2',
    author: 'Indigenous Media Group',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
    rating: 5,
    comment: 'Professional, responsive, and deeply knowledgeable. Our production benefited greatly from this collaboration.',
    date: '1 month ago',
    tier: 'Full Production'
  },
  {
    id: '3',
    author: 'Northern Lights Films',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop',
    rating: 4,
    comment: 'Great consultation session. Would recommend for any media project requiring authentic Indigenous representation.',
    date: '2 months ago',
    tier: 'Script Review'
  }
];

export default function ServiceDetailModal({ service, onClose }: ServiceDetailModalProps) {
  const [selectedTier, setSelectedTier] = useState(0);
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'portfolio' | 'reviews'>('description');
  const [isLiked, setIsLiked] = useState(false);
  const [showQuickHire, setShowQuickHire] = useState(false);

  const verificationColor = verificationColors[service.verification];
  const currentTier = service.pricingTiers[selectedTier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#0f0f0f] border border-[#d4af37]/30 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={service.freelancerAvatar}
              alt={service.freelancerName}
              className="w-10 h-10 rounded-full object-cover border-2"
              style={{ borderColor: verificationColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-semibold">{service.freelancerName}</h2>
                {service.isVerified && (
                  <BadgeCheck size={16} style={{ color: verificationColor }} />
                )}
              </div>
              <p className="text-gray-400 text-sm">{service.freelancerNation} Nation • {service.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-lg transition-colors ${isLiked ? 'text-[#DC143C]' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
              <Share2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-3 gap-6 p-6">
            {/* Left Column - Service Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{service.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-[#d4af37] fill-[#d4af37]" />
                    <span className="text-white font-medium">{service.rating}</span>
                    <span className="text-gray-400">({service.reviewCount} reviews)</span>
                  </div>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">{service.completedProjects} jobs completed</span>
                  <span className="text-gray-500">|</span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock size={14} />
                    {service.responseTime} response
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-[#141414] rounded-lg p-1">
                {(['description', 'portfolio', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-[#d4af37] text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'reviews' && ` (${service.reviewCount})`}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {activeTab === 'description' && (
                  <div className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">{service.description}</p>

                    {/* Skills */}
                    <div>
                      <h3 className="text-white font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {service.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-sm rounded-full border border-[#d4af37]/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="text-white font-medium mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {service.languages.map((lang) => (
                          <span key={lang} className="flex items-center gap-1 text-gray-300 text-sm">
                            <Globe size={14} className="text-[#d4af37]" />
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* About Freelancer */}
                    <div className="bg-[#141414] rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={service.freelancerAvatar}
                          alt={service.freelancerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white font-medium">{service.freelancerName}</p>
                          <p className="text-gray-400 text-sm">{service.freelancerNation} Nation</p>
                        </div>
                        <div
                          className="ml-auto px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: verificationColor, color: service.verification === 'Gold' ? 'black' : 'white' }}
                        >
                          {service.verification} Verified
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <p className="text-[#d4af37] font-bold">{service.completedProjects}</p>
                          <p className="text-gray-500">Jobs</p>
                        </div>
                        <div>
                          <p className="text-[#d4af37] font-bold">{service.rating}</p>
                          <p className="text-gray-500">Rating</p>
                        </div>
                        <div>
                          <p className="text-[#d4af37] font-bold">{service.responseTime}</p>
                          <p className="text-gray-500">Response</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#141414]">
                      <img
                        src={service.portfolio[portfolioIndex]?.image}
                        alt={service.portfolio[portfolioIndex]?.title}
                        className="w-full h-full object-cover"
                      />
                      {service.portfolio.length > 1 && (
                        <>
                          <button
                            onClick={() => setPortfolioIndex((prev) => (prev === 0 ? service.portfolio.length - 1 : prev - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={() => setPortfolioIndex((prev) => (prev === service.portfolio.length - 1 ? 0 : prev + 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white font-medium">{service.portfolio[portfolioIndex]?.title}</h3>
                        <p className="text-gray-400 text-sm">{service.portfolio[portfolioIndex]?.description}</p>
                      </div>
                    </div>

                    {/* Thumbnails */}
                    {service.portfolio.length > 1 && (
                      <div className="flex gap-2">
                        {service.portfolio.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPortfolioIndex(idx)}
                            className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                              idx === portfolioIndex ? 'border-[#d4af37]' : 'border-transparent'
                            }`}
                          >
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="bg-[#141414] rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={review.avatar} alt={review.author} className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{review.author}</p>
                            <p className="text-gray-500 text-xs">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < review.rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{review.comment}</p>
                        <p className="text-[#d4af37] text-xs mt-2">Purchased: {review.tier}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Pricing */}
            <div className="space-y-4">
              {/* Pricing Tiers */}
              <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <h3 className="text-white font-semibold">Select Package</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {service.pricingTiers.map((tier, idx) => (
                    <button
                      key={tier.name}
                      onClick={() => setSelectedTier(idx)}
                      className={`w-full p-4 text-left transition-colors ${
                        selectedTier === idx
                          ? 'bg-[#d4af37]/10 border-l-2 border-[#d4af37]'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{tier.name}</span>
                        <span className="text-[#d4af37] font-bold">${tier.price}</span>
                      </div>
                      <p className="text-gray-400 text-xs">{tier.deliveryDays} days delivery</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Tier Details */}
              <div className="bg-[#141414] rounded-xl p-4 border border-white/5">
                <h4 className="text-white font-medium mb-3">{currentTier.name} - ${currentTier.price}</h4>
                <ul className="space-y-2">
                  {currentTier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={14} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="flex items-center gap-2 text-gray-400 text-sm mt-4">
                  <Clock size={14} />
                  {currentTier.deliveryDays} days delivery
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowQuickHire(true)}
                  className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
                >
                  Continue (${currentTier.price})
                </button>
                <button className="w-full py-3 bg-[#141414] border border-[#d4af37]/30 text-[#d4af37] font-medium rounded-xl hover:bg-[#d4af37]/10 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={16} />
                  Contact Seller
                </button>
              </div>

              {/* Guarantees */}
              <div className="bg-[#141414] rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield size={14} className="text-[#d4af37]" />
                  <span className="text-gray-300">Money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-[#d4af37]" />
                  <span className="text-gray-300">Delivery protection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BadgeCheck size={14} className="text-[#d4af37]" />
                  <span className="text-gray-300">Verified professional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showQuickHire && (
        <QuickHireModal
          service={service}
          selectedTier={selectedTier}
          onClose={() => setShowQuickHire(false)}
          onComplete={() => undefined}
        />
      )}
    </div>
  );
}
