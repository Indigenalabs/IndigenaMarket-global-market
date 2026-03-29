'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { getStoredWalletAddress } from '@/app/lib/walletStorage';
import {
  Grid3X3, List, ChevronDown, Briefcase, Heart, Search, X
} from 'lucide-react';
import FeaturedBanner from './FeaturedBanner';
import FreelancingStickyBanner from './FreelancingStickyBanner';
import PillarArtistSpotlight from './PillarArtistSpotlight';
import FreelancingCategoryFilter from './freelancing/FreelancingCategoryFilter';
import ServiceCard from './freelancing/ServiceCard';
import ServiceDetailModal from './freelancing/ServiceDetailModal';
import FeaturedProBanner from './freelancing/FeaturedProBanner';
import CategorySpotlightStrip from './freelancing/CategorySpotlightStrip';
import TopRatedProSidebar from './freelancing/TopRatedProSidebar';
import SponsoredServiceCard from './freelancing/SponsoredServiceCard';
import ServiceLaunchBadge from './freelancing/ServiceLaunchBadge';
import SkillHubPartners from './freelancing/SkillHubPartners';
import TrendingServices from './freelancing/TrendingServices';
import FreelancingWallet from './freelancing/FreelancingWallet';
import SavedServices from './freelancing/SavedServices';
import {
  fetchFreelancingDemandHeatmap,
  fetchFreelancingServices,
  shortlistFreelanceService,
  trackFreelancingMarketplaceEvent,
  type FreelancingMarketplaceService,
} from '@/app/lib/freelancingMarketplaceApi';
import { isGlobalMockFallbackEnabled } from '@/app/lib/mockMode';

const ALLOW_MOCK_FALLBACK = isGlobalMockFallbackEnabled();

// Service categories
export const serviceCategories = [
  { id: 'all', name: 'All Services', icon: '??' },
  { id: 'consulting', name: 'Consulting', icon: '??' },
  { id: 'design', name: 'Design', icon: '??' },
  { id: 'translation', name: 'Translation', icon: '???' },
  { id: 'cultural-guidance', name: 'Cultural Guidance', icon: '??' },
  { id: 'craftsmanship', name: 'Craftsmanship', icon: '??' },
  { id: 'tech', name: 'Tech', icon: '??' },
  { id: 'marketing', name: 'Marketing', icon: '??' },
];

// Verification badges
export const verificationBadges = {
  Bronze: { color: '#CD7F32', label: 'Bronze' },
  Silver: { color: '#C0C0C0', label: 'Silver' },
  Gold: { color: '#FFD700', label: 'Gold' },
  Platinum: { color: '#E5E4E2', label: 'Platinum' }
};


const getWalletAddress = () => {
  if (typeof window === 'undefined') return '';
  return getStoredWalletAddress();
};

// Service type definition
export type ServiceVerification = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

type PricingTier = {
  name: string;
  price: number;
  deliveryDays: number;
  features: string[];
};

type MarketplaceService = {
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
  verification: ServiceVerification;
  isVerified: boolean;
  languages: string[];
  location: string;
  available: boolean;
  featured?: boolean;
};

// Mock services data
export const mockServices: MarketplaceService[] = [
  {
    id: '1',
    title: 'Cultural Consulting for Film & Media',
    description: 'Authentic Indigenous representation consulting for film, TV, and media productions. Ensure cultural accuracy and respectful storytelling.',
    freelancerId: 'f1',
    freelancerName: 'Dr. Sarah Whitehorse',
    freelancerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    freelancerNation: 'Lakota',
    category: 'consulting',
    skills: ['Cultural Advisory', 'Script Review', 'Set Consultation', 'Indigenous Protocols'],
    pricingTiers: [
      { name: 'Script Review', price: 250, deliveryDays: 5, features: ['Single script review', 'Cultural accuracy report', 'Recommendations'] },
      { name: 'Production Package', price: 750, deliveryDays: 14, features: ['Full script review', 'Set consultation', 'Cultural protocols guide', 'On-call support'] },
      { name: 'Full Production', price: 2500, deliveryDays: 30, features: ['Complete consulting', 'On-set presence', 'Crew training', 'Full documentation'] }
    ],
    portfolio: [
      { title: 'Echoes of the Plains', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop', description: 'Documentary consulting' },
      { title: 'Sacred Waters', image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&h=200&fit=crop', description: 'Feature film advisory' }
    ],
    rating: 4.9,
    reviewCount: 47,
    completedProjects: 32,
    responseTime: '< 2 hours',
    verification: 'Platinum' as const,
    isVerified: true,
    languages: ['English', 'Lakota'],
    location: 'Rapid City, SD',
    available: true,
    featured: true
  },
  {
    id: '2',
    title: 'Indigenous Brand Identity Design',
    description: 'Authentic brand identity design that honors Indigenous aesthetics while creating modern, professional visual systems.',
    freelancerId: 'f2',
    freelancerName: 'Marcus Thunderbird',
    freelancerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    freelancerNation: 'Navajo',
    category: 'design',
    skills: ['Brand Identity', 'Logo Design', 'Visual Systems', 'Cultural Design'],
    pricingTiers: [
      { name: 'Logo Package', price: 180, deliveryDays: 7, features: ['3 concepts', '2 revisions', 'Source files', 'Brand guidelines'] },
      { name: 'Brand Identity', price: 450, deliveryDays: 14, features: ['Logo suite', 'Color palette', 'Typography', 'Brand book'] },
      { name: 'Full Brand System', price: 1200, deliveryDays: 21, features: ['Complete identity', 'Marketing materials', 'Social templates', 'Style guide'] }
    ],
    portfolio: [
      { title: 'Sacred Threads Branding', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop', description: 'Textile company identity' },
      { title: 'Four Directions Media', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=200&fit=crop', description: 'Media company brand' }
    ],
    rating: 4.8,
    reviewCount: 89,
    completedProjects: 67,
    responseTime: '< 4 hours',
    verification: 'Gold' as const,
    isVerified: true,
    languages: ['English', 'Navajo'],
    location: 'Phoenix, AZ',
    available: true,
    featured: false
  },
  {
    id: '3',
    title: 'Lakota Language Translation & Interpretation',
    description: 'Professional Lakota language translation services for documents, audio, video, and live interpretation. Preserving language through accurate translation.',
    freelancerId: 'f3',
    freelancerName: 'Eleanor Black Elk',
    freelancerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    freelancerNation: 'Lakota',
    category: 'translation',
    skills: ['Lakota Translation', 'Interpretation', 'Document Translation', 'Audio/Video'],
    pricingTiers: [
      { name: 'Document', price: 35, deliveryDays: 3, features: ['Per page', 'Certified translation', 'Proofreading included'] },
      { name: 'Audio/Video', price: 75, deliveryDays: 5, features: ['Per hour of content', 'Timestamped', 'Subtitles available'] },
      { name: 'Live Interpretation', price: 150, deliveryDays: 1, features: ['Per hour', 'On-site or virtual', 'Technical vocabulary'] }
    ],
    portfolio: [
      { title: 'Treaty Documents', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop', description: 'Historical document translation' },
      { title: 'Educational Series', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop', description: 'Video series subtitles' }
    ],
    rating: 5.0,
    reviewCount: 34,
    completedProjects: 89,
    responseTime: '< 1 hour',
    verification: 'Platinum' as const,
    isVerified: true,
    languages: ['English', 'Lakota', 'Dakota'],
    location: 'Pine Ridge, SD',
    available: true,
    featured: true
  },
  {
    id: '4',
    title: 'Traditional Ceremony Guidance',
    description: 'Respectful guidance on traditional ceremonies, protocols, and cultural practices. Available for educational and community events.',
    freelancerId: 'f4',
    freelancerName: 'Grandfather William Crow',
    freelancerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    freelancerNation: 'Crow',
    category: 'cultural-guidance',
    skills: ['Ceremony Protocols', 'Cultural Education', 'Traditional Knowledge', 'Community Events'],
    pricingTiers: [
      { name: 'Consultation', price: 100, deliveryDays: 1, features: ['1-hour session', 'Q&A format', 'Follow-up notes'] },
      { name: 'Workshop', price: 400, deliveryDays: 1, features: ['Half-day workshop', 'Materials included', 'Group setting'] },
      { name: 'Event Guidance', price: 800, deliveryDays: 1, features: ['Full event support', 'Protocol oversight', 'Community liaison'] }
    ],
    portfolio: [
      { title: 'University Lecture Series', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop', description: 'Academic presentations' },
      { title: 'Community Gathering', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&h=200&fit=crop', description: 'Event guidance' }
    ],
    rating: 5.0,
    reviewCount: 28,
    completedProjects: 156,
    responseTime: '< 6 hours',
    verification: 'Platinum' as const,
    isVerified: true,
    languages: ['English', 'Crow', 'Lakota'],
    location: 'Billings, MT',
    available: true,
    featured: false
  },
  {
    id: '5',
    title: 'Custom Regalia & Ceremonial Items',
    description: 'Handcrafted regalia and ceremonial items made with traditional techniques and materials. Each piece created with cultural integrity.',
    freelancerId: 'f5',
    freelancerName: 'Rose Many Feathers',
    freelancerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    freelancerNation: 'Haudenosaunee',
    category: 'craftsmanship',
    skills: ['Regalia Making', 'Beadwork', 'Leatherwork', 'Traditional Crafts'],
    pricingTiers: [
      { name: 'Small Item', price: 150, deliveryDays: 14, features: ['Beaded accessories', 'Small pouches', 'Hair ornaments'] },
      { name: 'Regalia Piece', price: 600, deliveryDays: 45, features: ['Dance regalia', 'Custom design', 'Traditional materials'] },
      { name: 'Full Set', price: 2500, deliveryDays: 90, features: ['Complete regalia set', 'Consultation included', 'Documentation'] }
    ],
    portfolio: [
      { title: 'Jingle Dress', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop', description: 'Traditional jingle dress' },
      { title: 'Fancy Shawl', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=200&fit=crop', description: 'Competition shawl' }
    ],
    rating: 4.9,
    reviewCount: 67,
    completedProjects: 45,
    responseTime: '< 12 hours',
    verification: 'Gold' as const,
    isVerified: true,
    languages: ['English', 'Mohawk'],
    location: 'Toronto, ON',
    available: true,
    featured: false
  },
  {
    id: '6',
    title: 'Indigenous Web Development',
    description: 'Custom web development with focus on Indigenous organizations, artists, and businesses. Culturally-informed design and accessibility-first approach.',
    freelancerId: 'f6',
    freelancerName: 'Alex Riverstone',
    freelancerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    freelancerNation: 'Ojibwe',
    category: 'tech',
    skills: ['Web Development', 'E-commerce', 'Accessibility', 'SEO'],
    pricingTiers: [
      { name: 'Landing Page', price: 350, deliveryDays: 7, features: ['Single page', 'Mobile responsive', 'Contact form', 'SEO basics'] },
      { name: 'Business Site', price: 1200, deliveryDays: 21, features: ['5-7 pages', 'CMS setup', 'Analytics', 'Training'] },
      { name: 'E-commerce', price: 3000, deliveryDays: 45, features: ['Full store', 'Payment setup', 'Inventory', 'Support'] }
    ],
    portfolio: [
      { title: 'Tribal Council Portal', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop', description: 'Government website' },
      { title: 'Artist Portfolio', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop', description: 'Artist showcase site' }
    ],
    rating: 4.7,
    reviewCount: 112,
    completedProjects: 78,
    responseTime: '< 3 hours',
    verification: 'Silver' as const,
    isVerified: true,
    languages: ['English'],
    location: 'Minneapolis, MN',
    available: true,
    featured: false
  },
  {
    id: '7',
    title: 'Indigenous Marketing Strategy',
    description: 'Strategic marketing services tailored for Indigenous businesses and organizations. Authentic storytelling with modern marketing techniques.',
    freelancerId: 'f7',
    freelancerName: 'Jennifer Whitecloud',
    freelancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    freelancerNation: 'Diné',
    category: 'marketing',
    skills: ['Social Media', 'Content Strategy', 'Brand Storytelling', 'Community Engagement'],
    pricingTiers: [
      { name: 'Strategy Session', price: 200, deliveryDays: 3, features: ['1-hour consultation', 'Strategy outline', 'Action items'] },
      { name: 'Campaign Package', price: 800, deliveryDays: 14, features: ['Full campaign', 'Content calendar', 'Analytics setup'] },
      { name: 'Retainer', price: 2000, deliveryDays: 30, features: ['Monthly management', 'Content creation', 'Reports', 'Strategy calls'] }
    ],
    portfolio: [
      { title: 'Tourism Campaign', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop', description: 'Regional tourism push' },
      { title: 'Product Launch', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&h=200&fit=crop', description: 'Artisan product launch' }
    ],
    rating: 4.8,
    reviewCount: 56,
    completedProjects: 43,
    responseTime: '< 4 hours',
    verification: 'Gold' as const,
    isVerified: true,
    languages: ['English', 'Navajo'],
    location: 'Albuquerque, NM',
    available: true,
    featured: false
  },
  {
    id: '8',
    title: 'Traditional Storytelling & Performance',
    description: 'Traditional storytelling performances for events, schools, and organizations. Bringing Indigenous narratives to life with authenticity and respect.',
    freelancerId: 'f8',
    freelancerName: 'Joseph Firekeeper',
    freelancerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    freelancerNation: 'Cherokee',
    category: 'cultural-guidance',
    skills: ['Storytelling', 'Performance', 'Educational Programs', 'Cultural Events'],
    pricingTiers: [
      { name: 'Single Story', price: 150, deliveryDays: 1, features: ['30-minute session', 'Q&A included', 'Virtual or in-person'] },
      { name: 'Event Performance', price: 500, deliveryDays: 1, features: ['1-hour set', 'Multiple stories', 'Audience interaction'] },
      { name: 'Residency', price: 2000, deliveryDays: 5, features: ['Week-long program', 'Workshops included', 'Custom content'] }
    ],
    portfolio: [
      { title: 'Smithsonian Performance', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=200&fit=crop', description: 'Museum event' },
      { title: 'School Program', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop', description: 'Educational series' }
    ],
    rating: 4.9,
    reviewCount: 89,
    completedProjects: 234,
    responseTime: '< 8 hours',
    verification: 'Platinum' as const,
    isVerified: true,
    languages: ['English', 'Cherokee', 'Muskogee'],
    location: 'Tahlequah, OK',
    available: true,
    featured: true
  }
];

// Platform stats
const platformStats = {
  totalFreelancers: 1247,
  activeProjects: 892,
  completedProjects: 15420,
  totalEarnings: 2840000
};

function mapApiServiceToMarketplace(service: FreelancingMarketplaceService): MarketplaceService {
  const minPrice = Number(service.pricing?.fixedAmount ?? service.pricing?.min ?? 0);
  const maxPrice = Number(service.pricing?.max ?? service.pricing?.min ?? minPrice);
  const deliveryDays = parseInt((service.deliveryTime || '').match(/\d+/)?.[0] || '7', 10);

  return {
    id: service.serviceId,
    title: service.title || 'Untitled Service',
    description: service.description || '',
    freelancerId: service.freelancerAddress || '',
    freelancerName: service.freelancerName || 'Indigenous Professional',
    freelancerAvatar: service.freelancerAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    freelancerNation: service.freelancerNation || 'Indigenous',
    category: service.category || 'consulting',
    skills: service.skills?.length ? service.skills : ['Indigenous Expertise'],
    pricingTiers: [
      {
        name: 'Standard',
        price: minPrice,
        deliveryDays,
        features: ['Service delivery', 'Messaging', 'Revisions by agreement']
      },
      {
        name: 'Extended',
        price: maxPrice,
        deliveryDays: Math.max(deliveryDays, deliveryDays + 3),
        features: ['Expanded scope', 'Priority support', 'Detailed handoff']
      }
    ],
    portfolio: [
      {
        title: service.title || 'Portfolio Item',
        image: service.freelancerAvatar || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
        description: service.description || 'Professional service sample'
      }
    ],
    rating: Number(service.averageRating || 0),
    reviewCount: Number(service.reviewCount || 0),
    completedProjects: Number(service.completedProjects || 0),
    responseTime: service.responseTime || '< 24 hours',
    verification: (service.verificationStatus === 'premium' ? 'Platinum' : service.verificationStatus === 'elder_endorsed' ? 'Gold' : service.verificationStatus === 'verified' ? 'Silver' : 'Bronze') as ServiceVerification,
    isVerified: ['verified', 'elder_endorsed', 'premium'].includes(service.verificationStatus || ''),
    languages: service.languages?.length ? service.languages : ['English'],
    location: service.location || 'Remote',
    available: service.available !== false,
    featured: Boolean(service.featured)
  };
}

export default function FreelancingMarketplace() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<MarketplaceService | null>(null);
  const [likedServices, setLikedServices] = useState<Set<string>>(new Set());
  const [savedServices, setSavedServices] = useState<Set<string>>(new Set());
  const [showSaved, setShowSaved] = useState(false);
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const fetchSeq = useRef(0);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedServices(prev => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); } else { s.add(id); }
      return s;
    });
  };

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const wallet = getWalletAddress();
    if (wallet) shortlistFreelanceService(id, wallet).catch(() => undefined);
    trackFreelancingMarketplaceEvent({ event: 'shortlist', serviceId: id }).catch(() => undefined);
    setSavedServices(prev => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); } else { s.add(id); }
      return s;
    });
  };

  const filteredServices = useMemo(() => {
    let list = [...services];
    
    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter(s => s.category === activeCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.freelancerName.toLowerCase().includes(q) ||
        s.skills.some(skill => skill.toLowerCase().includes(q))
      );
    }
    
    // Sort
    if (sortBy === 'price-low') list.sort((a, b) => a.pricingTiers[0].price - b.pricingTiers[0].price);
    if (sortBy === 'price-high') list.sort((a, b) => b.pricingTiers[0].price - a.pricingTiers[0].price);
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'popular') list.sort((a, b) => b.completedProjects - a.completedProjects);
    
    return list;
  }, [activeCategory, searchQuery, sortBy, services]);

  const savedServicesList = services.filter(s => savedServices.has(s.id));

  useEffect(() => {
    fetchFreelancingDemandHeatmap().catch(() => undefined);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const seq = ++fetchSeq.current;
    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        setApiError(null);
        const page = await fetchFreelancingServices(
          {
            q: searchQuery || undefined,
            category: activeCategory !== 'all' ? activeCategory : undefined,
            sort: sortBy,
            page: 1,
            limit: 120
          },
          controller.signal
        );
        if (seq !== fetchSeq.current) return;

        if (Array.isArray(page.services) && page.services.length > 0) {
          setServices(page.services.map(mapApiServiceToMarketplace));
        } else if (ALLOW_MOCK_FALLBACK) {
          setServices(mockServices);
        } else {
          setServices([]);
          setApiError('No freelancing services available.');
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        if (seq !== fetchSeq.current) return;
        setApiError(ALLOW_MOCK_FALLBACK ? 'Using local data fallback' : 'Unable to load freelancing marketplace data.');
        setServices(ALLOW_MOCK_FALLBACK ? mockServices : []);
      } finally {
        if (seq === fetchSeq.current) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <div className="p-6">
      {/* Premium Placement #7 — Sticky Announcement Banner */}
      <FreelancingStickyBanner />

      {/* Premium Placement #1 — Featured Pro Banner ($300/week) */}
      <FeaturedProBanner />

      {/* Featured Banner */}
      <FeaturedBanner pillar="freelancing" />

      {/* Artist Spotlight */}
      <PillarArtistSpotlight pillar="freelancing" />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Verified Professionals', value: platformStats.totalFreelancers.toLocaleString() },
          { label: 'Active Projects', value: platformStats.activeProjects.toLocaleString() },
          { label: 'Completed Jobs', value: platformStats.completedProjects.toLocaleString() },
          { label: 'Total Earnings', value: `${(platformStats.totalEarnings / 1000000).toFixed(1)}M INDI` }
        ].map((stat) => (
          <div key={stat.label} className="bg-[#141414] rounded-xl p-4 border border-[#d4af37]/20">
            <p className="text-2xl font-bold text-[#d4af37]">{stat.value}</p>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Premium Placement #3 — Category Spotlight Strip ($200/week) */}
      <CategorySpotlightStrip />

      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Freelancing</h1>
          <p className="text-gray-400 text-sm">{filteredServices.length} services from Indigenous professionals</p>
          <Link href="/freelancing" className="text-[#d4af37] text-xs hover:underline mt-0.5 inline-block">
            View All Services &rarr;
          </Link>
          {loading && <p className="text-xs text-gray-500 mt-1">Updating services...</p>}
          {apiError && <p className="text-xs text-amber-400 mt-1">{apiError}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, skills..."
              className="bg-[#141414] border border-[#d4af37]/20 rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] w-52"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#141414] border border-[#d4af37]/20 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[#141414] rounded-lg border border-[#d4af37]/20 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Saved Services */}
          <button
            onClick={() => setShowSaved(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 bg-[#141414] border border-[#d4af37]/20 rounded-lg text-gray-300 hover:text-white hover:border-[#d4af37]/50 transition-colors"
          >
            <Heart size={16} />
            {savedServices.size > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#DC143C] text-white text-xs rounded-full flex items-center justify-center">{savedServices.size}</span>
            )}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <FreelancingCategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Premium Placement #5 — Service Launch Badge ($75/launch) */}
      <ServiceLaunchBadge />

      {/* Service Grid */}
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase size={48} className="text-gray-600 mb-4" />
          <p className="text-white font-semibold text-lg">No services found</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Try adjusting your filters</p>
          <button
            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
            className="px-4 py-2 bg-[#d4af37] text-black text-sm font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Main grid */}
          <div className="flex-1 min-w-0">
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredServices.map((service, idx) => (
                <div key={`service-row-${service.id}`} className="contents">
                  <ServiceCard
                    service={service}
                    viewMode={viewMode}
                    isLiked={likedServices.has(service.id)}
                    isSaved={savedServices.has(service.id)}
                    onToggleLike={(e) => toggleLike(service.id, e)}
                    onToggleSave={(e) => toggleSave(service.id, e)}
                    onSelect={() => {
                      setSelectedService(service);
                      trackFreelancingMarketplaceEvent({
                        event: 'view',
                        serviceId: service.id,
                        category: service.category
                      }).catch(() => undefined);
                    }}
                  />
                  {/* Premium Placement #2 — Sponsored Service Card (every 6th) */}
                  {(idx + 1) % 6 === 0 && idx < filteredServices.length - 1 && (
                    <SponsoredServiceCard key={`sponsored-${idx}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Premium Placement #4 — Top-Rated Pro Sidebar ($250/week) */}
          <div className="hidden xl:block w-72 flex-shrink-0">
            <TopRatedProSidebar />
          </div>
        </div>
      )}

      {/* Load More */}
      <div className="mt-10 text-center">
        <Link
          href="/freelancing"
          className="inline-block px-8 py-3 bg-[#141414] border border-[#d4af37]/30 rounded-full text-[#d4af37] font-medium hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all"
        >
          Browse All Services &rarr;</Link>
      </div>

      {/* Premium Placement #6 — Skill Hub Partners ($150/week) */}
      <SkillHubPartners />

      {/* Trending Services */}
      <div className="mt-10">
        <TrendingServices services={services} onServiceSelect={setSelectedService} />
      </div>

      {/* Freelancing Wallet */}
      <div className="mt-8">
        <FreelancingWallet compact />
      </div>

      {/* Become a Pro CTA */}
      <section className="mt-12 bg-gradient-to-r from-[#d4af37]/20 via-[#0a0a0a] to-[#DC143C]/20 rounded-2xl p-8 text-center">
        <Briefcase size={48} className="text-[#d4af37] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Offer Your Services</h2>
        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          Are you an Indigenous professional? Share your skills with a global community that values authentic expertise and cultural knowledge.
        </p>
        <a
          href="/creator-hub"
          className="inline-block px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
        >
          Create Your Service
        </a>
      </section>

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      {/* Saved Services Modal */}
      {showSaved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowSaved(false)}>
          <div className="bg-[#141414] border border-[#d4af37]/30 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Saved Services ({savedServicesList.length})</h2>
              <button onClick={() => setShowSaved(false)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <SavedServices
                services={savedServicesList}
                onRemove={(id) => setSavedServices(prev => { const s = new Set(prev); s.delete(id); return s; })}
                onView={(service) => { setShowSaved(false); setSelectedService(service); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





















