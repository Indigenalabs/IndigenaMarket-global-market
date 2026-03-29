'use client';

import { useState } from 'react';
import NFTCard from './NFTCard';
import FeaturedBanner from './marketplace/FeaturedBanner';
import PillarArtistSpotlight from './marketplace/PillarArtistSpotlight';
import PromotedListings from './marketplace/PromotedListings';
import CoursesMarketplace from './marketplace/CoursesMarketplace';
import DigitalArtsMarketplace from './marketplace/DigitalArtsMarketplace';
import PhysicalItemsMarketplace from './marketplace/PhysicalItemsMarketplace';
import FreelancingMarketplace from './marketplace/FreelancingMarketplace';
import CulturalTourismMarketplace from './marketplace/CulturalTourismMarketplace';
import LanguageHeritageMarketplace from './marketplace/LanguageHeritageMarketplace';
import LandFoodMarketplace from './marketplace/LandFoodMarketplace';
import AdvocacyLegalMarketplace from './marketplace/AdvocacyLegalMarketplace';
import MaterialsToolsMarketplace from './marketplace/MaterialsToolsMarketplace';
import { Grid3X3, List, Filter, ChevronDown } from 'lucide-react';

// Mock NFT data
const mockNFTs = [
  {
    id: '1',
    title: 'Sacred Buffalo Spirit',
    creator: 'LakotaDreams',
    price: 250,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    likes: 128,
    views: 1045,
    isVerified: true
  },
  {
    id: '2',
    title: 'Navajo Weaving Pattern #4',
    creator: 'WeavingWoman',
    price: 180,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    likes: 89,
    views: 723,
    isVerified: true
  },
  {
    id: '3',
    title: 'Thunderbird Rising',
    creator: 'CoastalArtist',
    price: 420,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    likes: 256,
    views: 2103,
    isVerified: false
  },
  {
    id: '4',
    title: 'Medicine Wheel',
    creator: 'PlainsElder',
    price: 500,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop',
    likes: 312,
    views: 2890,
    isVerified: true
  },
  {
    id: '5',
    title: 'Dreamcatcher Collection',
    creator: 'OjibweArt',
    price: 95,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=400&fit=crop',
    likes: 67,
    views: 534,
    isVerified: false
  },
  {
    id: '6',
    title: 'Eagle Feather Ceremony',
    creator: 'HopiVision',
    price: 350,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop',
    likes: 178,
    views: 1456,
    isVerified: true
  },
  {
    id: '7',
    title: 'Grandmother Moon',
    creator: 'LunarTales',
    price: 275,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=400&h=400&fit=crop',
    likes: 145,
    views: 1123,
    isVerified: false
  },
  {
    id: '8',
    title: 'Four Directions',
    creator: 'SacredEarth',
    price: 600,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    likes: 423,
    views: 3456,
    isVerified: true
  }
];

interface MarketplaceProps {
  activePillar: string;
}

export default function Marketplace({ activePillar }: MarketplaceProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  const pillarNames: Record<string, string> = {
    'digital-arts': 'Digital Arts',
    'physical-items': 'Physical Items',
    'courses': 'Courses',
    'freelancing': 'Freelancing',
    'seva': 'Seva',
    'cultural-tourism': 'Cultural Tourism',
    'language-heritage': 'Language & Heritage',
    'land-food': 'Land & Food',
    'advocacy-legal': 'Advocacy & Legal',
    'materials-tools': 'Materials & Tools'
  };

  // Render specialized marketplace for specific pillars
  if (activePillar === 'courses') {
    return <CoursesMarketplace />;
  }
  
  if (activePillar === 'digital-arts') {
    return <DigitalArtsMarketplace />;
  }

  if (activePillar === 'physical-items') {
    return <PhysicalItemsMarketplace />;
  }

  if (activePillar === 'freelancing') {
    return <FreelancingMarketplace />;
  }
  if (activePillar === 'cultural-tourism') {
    return <CulturalTourismMarketplace />;
  }
  if (activePillar === 'language-heritage') {
    return <LanguageHeritageMarketplace />;
  }
  if (activePillar === 'land-food') {
    return <LandFoodMarketplace />;
  }
  if (activePillar === 'advocacy-legal') {
    return <AdvocacyLegalMarketplace />;
  }
  if (activePillar === 'materials-tools') {
    return <MaterialsToolsMarketplace />;
  }


  return (
    <div className="p-6">
      {/* Featured Banner - Premium Placement */}
      <FeaturedBanner pillar={activePillar} />

      {/* Pillar Artist Spotlight - Premium Placement */}
      <PillarArtistSpotlight pillar={activePillar} />

      {/* Promoted Listings - Premium Placement */}
      <PromotedListings pillar={activePillar} />

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-[#d4af37]/20" />
        <span className="text-gray-500 text-sm">All Listings</span>
        <div className="flex-1 h-px bg-[#d4af37]/20" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {pillarNames[activePillar] || 'Digital Arts'}
          </h1>
          <p className="text-gray-400 text-sm">
            {mockNFTs.length} items available
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#141414] border border-[#DC143C]/30 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-[#DC143C] cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* Filter Toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-[#DC143C]/20 border-[#DC143C] text-[#DC143C]' 
                : 'bg-[#141414] border-[#DC143C]/30 text-gray-300 hover:border-[#DC143C]'
            }`}
          >
            <Filter size={16} />
            <span className="text-sm">Filters</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-[#141414] rounded-lg border border-[#DC143C]/30 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#DC143C]/20 text-[#DC143C]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-[#DC143C]/20 text-[#DC143C]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-[#141414] rounded-xl border border-[#DC143C]/20">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Price Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min"
                  className="w-full bg-[#0a0a0a] border border-[#DC143C]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DC143C]"
                />
                <span className="text-gray-500">-</span>
                <input 
                  type="number" 
                  placeholder="Max"
                  className="w-full bg-[#0a0a0a] border border-[#DC143C]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
              <select className="w-full bg-[#0a0a0a] border border-[#DC143C]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DC143C]">
                <option>All Categories</option>
                <option>Paintings</option>
                <option>Photography</option>
                <option>Digital Art</option>
                <option>3D Models</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
              <select className="w-full bg-[#0a0a0a] border border-[#DC143C]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DC143C]">
                <option>All Items</option>
                <option>Buy Now</option>
                <option>On Auction</option>
                <option>New Listings</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Verified Only</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#DC143C]/30 bg-[#0a0a0a] text-[#DC143C] focus:ring-[#DC143C]" />
                <span className="text-sm text-gray-300">Show verified artists only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* NFT Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {mockNFTs.map((nft) => (
          <NFTCard key={nft.id} {...nft} />
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button className="px-8 py-3 bg-[#141414] border border-[#d4af37]/30 rounded-full text-[#d4af37] font-medium hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all">
          Load More
        </button>
      </div>
    </div>
  );
}

