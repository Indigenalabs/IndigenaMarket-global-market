'use client';

import { useState } from 'react';
import {
  X, Star, BadgeCheck, MapPin, Globe, Clock, Briefcase,
  MessageCircle, Calendar, Award, Users, ExternalLink
} from 'lucide-react';

interface PortfolioItem {
  title: string;
  image: string;
  description: string;
}

interface Service {
  id: string;
  title: string;
  category: string;
  pricingTiers: { name: string; price: number; deliveryDays: number; features: string[] }[];
  rating: number;
  reviewCount: number;
  completedProjects: number;
}

interface FreelancerProfile {
  id: string;
  name: string;
  avatar: string;
  nation: string;
  title: string;
  bio: string;
  location: string;
  languages: string[];
  verification: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  rating: number;
  reviewCount: number;
  completedProjects: number;
  responseTime: string;
  memberSince: string;
  skills: string[];
  portfolio: PortfolioItem[];
  services: Service[];
  socialLinks?: { type: string; url: string }[];
}

interface FreelancerProfileModalProps {
  freelancer: FreelancerProfile;
  onClose: () => void;
  onContact: () => void;
  onServiceSelect: (service: Service) => void;
}

const verificationColors: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2'
};

// Mock data for profile
const mockProfile: FreelancerProfile = {
  id: 'f1',
  name: 'Dr. Sarah Whitehorse',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  nation: 'Lakota',
  title: 'Cultural Consultant & Indigenous Rights Advocate',
  bio: 'With over 15 years of experience in cultural consulting, I specialize in ensuring authentic Indigenous representation in media, film, and educational materials. As a member of the Lakota Nation, I bring deep cultural knowledge combined with academic expertise to every project.',
  location: 'Rapid City, South Dakota',
  languages: ['English', 'Lakota', 'Dakota'],
  verification: 'Platinum',
  rating: 4.9,
  reviewCount: 47,
  completedProjects: 32,
  responseTime: '< 2 hours',
  memberSince: 'March 2021',
  skills: ['Cultural Advisory', 'Script Review', 'Set Consultation', 'Indigenous Protocols', 'Language Preservation', 'Educational Content'],
  portfolio: [
    { title: 'Echoes of the Plains Documentary', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', description: 'Full production cultural consulting' },
    { title: 'Sacred Waters Feature Film', image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop', description: 'Script review and set consultation' },
    { title: 'Tribal History Museum Exhibit', image: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?w=400&h=300&fit=crop', description: 'Content development and verification' }
  ],
  services: [
    { id: 's1', title: 'Cultural Consulting for Film & Media', category: 'consulting', pricingTiers: [{ name: 'Script Review', price: 250, deliveryDays: 5, features: [] }], rating: 4.9, reviewCount: 47, completedProjects: 32 }
  ],
  socialLinks: [
    { type: 'linkedin', url: '#' },
    { type: 'twitter', url: '#' }
  ]
};

export default function FreelancerProfileModal({ freelancer = mockProfile, onClose, onContact, onServiceSelect }: FreelancerProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'services' | 'reviews'>('about');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#0f0f0f] border border-[#d4af37]/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-[#d4af37]/20 via-[#141414] to-[#DC143C]/20" />
          
          {/* Avatar & Actions */}
          <div className="absolute top-16 left-6 right-6 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={freelancer.avatar}
                  alt={freelancer.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#0f0f0f]"
                  style={{ boxShadow: `0 0 0 2px ${verificationColors[freelancer.verification]}` }}
                />
                <div
                  className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: verificationColors[freelancer.verification], color: 'black' }}
                >
                  {freelancer.verification}
                </div>
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-xl font-bold">{freelancer.name}</h2>
                  <BadgeCheck size={18} style={{ color: verificationColors[freelancer.verification] }} />
                </div>
                <p className="text-gray-400 text-sm">{freelancer.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 pt-20 pb-4 border-b border-white/5">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
              <span className="text-white font-medium">{freelancer.rating}</span>
              <span className="text-gray-500">({freelancer.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Briefcase size={14} />
              <span>{freelancer.completedProjects} jobs completed</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Clock size={14} />
              <span>{freelancer.responseTime} response</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin size={14} />
              <span>{freelancer.location}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Calendar size={14} />
              <span>Member since {freelancer.memberSince}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 bg-[#141414] border-b border-white/5">
          {(['about', 'portfolio', 'services', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[#d4af37] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'about' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-white font-medium mb-2">About</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{freelancer.bio}</p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-white font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill) => (
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
                  <div className="flex gap-3">
                    {freelancer.languages.map((lang) => (
                      <span key={lang} className="flex items-center gap-1 text-gray-300 text-sm">
                        <Globe size={14} className="text-[#d4af37]" />
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Stats Card */}
                <div className="bg-[#141414] rounded-xl p-4 border border-white/5">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-[#d4af37] font-bold text-xl">{freelancer.completedProjects}</p>
                      <p className="text-gray-500 text-xs">Jobs</p>
                    </div>
                    <div>
                      <p className="text-[#d4af37] font-bold text-xl">{freelancer.rating}</p>
                      <p className="text-gray-500 text-xs">Rating</p>
                    </div>
                    <div>
                      <p className="text-[#d4af37] font-bold text-xl">{freelancer.reviewCount}</p>
                      <p className="text-gray-500 text-xs">Reviews</p>
                    </div>
                    <div>
                      <p className="text-[#d4af37] font-bold text-xl">{freelancer.responseTime}</p>
                      <p className="text-gray-500 text-xs">Response</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={onContact}
                  className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Contact Me
                </button>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {freelancer.portfolio.map((item, idx) => (
                <div
                  key={idx}
                  className="group rounded-xl overflow-hidden border border-white/5 hover:border-[#d4af37]/30 transition-all cursor-pointer"
                >
                  <div className="aspect-video relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-gray-500 text-xs">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="grid gap-4">
              {freelancer.services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => onServiceSelect(service)}
                  className="flex items-center gap-4 p-4 bg-[#141414] rounded-xl border border-white/5 hover:border-[#d4af37]/30 transition-all cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{service.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                      <span className="capitalize">{service.category}</span>
                      <span>•</span>
                      <span>{service.completedProjects} completed</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">From</p>
                    <p className="text-[#d4af37] font-bold">${service.pricingTiers[0]?.price}</p>
                  </div>
                  <ExternalLink size={16} className="text-gray-400" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {[
                { id: '1', author: 'Documentary Film Co.', rating: 5, comment: 'Exceptional cultural consulting. Dr. Whitehorse provided invaluable guidance.', date: '2 weeks ago' },
                { id: '2', author: 'Tribal Arts Gallery', rating: 5, comment: 'Professional, responsive, and deeply knowledgeable.', date: '1 month ago' },
                { id: '3', author: 'Northern Lights Films', rating: 4, comment: 'Great consultation session. Would recommend for any media project.', date: '2 months ago' }
              ].map((review) => (
                <div key={review.id} className="bg-[#141414] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{review.author}</span>
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
                  <p className="text-gray-500 text-xs mt-2">{review.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
