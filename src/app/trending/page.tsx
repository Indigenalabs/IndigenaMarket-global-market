'use client';

import { useEffect, useMemo, useState } from 'react';
import { Flame, TrendingUp, Clock, Eye, Heart, ArrowUpRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import TrendingTakeover from '@/app/components/trending/TrendingTakeover';
import FeaturedTrending from '@/app/components/trending/FeaturedTrending';
import MarketTrendsChart from '@/app/components/trending/MarketTrendsChart';
import TopGainersLosers from '@/app/components/trending/TopGainersLosers';
import NewlyListed from '@/app/components/trending/NewlyListed';
import RisingStars from '@/app/components/trending/RisingStars';
import UnderpricedGems from '@/app/components/trending/UnderpricedGems';
import CollectionSpotlights from '@/app/components/trending/CollectionSpotlights';
import PromotedCreators from '@/app/components/trending/PromotedCreators';
import ActivityFeed from '@/app/components/trending/ActivityFeed';
import { fetchDigitalArtPage, type DigitalArtApiListing } from '@/app/lib/digitalArtApi';

// Mock trending data
const mockTrendingItems = [
  {
    id: '1',
    rank: 1,
    title: 'Sacred Buffalo Spirit',
    creator: 'LakotaDreams',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    price: 250,
    currency: 'INDI',
    likes: 1250,
    views: 8900,
    sales: 45,
    change24h: +23.5,
    isVerified: true,
    hot: true
  },
  {
    id: '2',
    rank: 2,
    title: 'Thunderbird Rising',
    creator: 'CoastalArtist',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    price: 420,
    currency: 'INDI',
    likes: 980,
    views: 6700,
    sales: 32,
    change24h: +18.2,
    isVerified: true,
    hot: true
  },
  {
    id: '3',
    rank: 3,
    title: 'Medicine Wheel',
    creator: 'PlainsElder',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop',
    price: 500,
    currency: 'INDI',
    likes: 856,
    views: 5400,
    sales: 28,
    change24h: +15.7,
    isVerified: true,
    hot: false
  },
  {
    id: '4',
    rank: 4,
    title: 'Dreamcatcher Collection',
    creator: 'OjibweArt',
    image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=400&fit=crop',
    price: 95,
    currency: 'INDI',
    likes: 723,
    views: 4800,
    sales: 67,
    change24h: +12.4,
    isVerified: false,
    hot: false
  },
  {
    id: '5',
    rank: 5,
    title: 'Eagle Feather Ceremony',
    creator: 'HopiVision',
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop',
    price: 350,
    currency: 'INDI',
    likes: 654,
    views: 4200,
    sales: 21,
    change24h: +9.8,
    isVerified: true,
    hot: false
  },
  {
    id: '6',
    rank: 6,
    title: 'Four Directions',
    creator: 'SacredEarth',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    price: 600,
    currency: 'INDI',
    likes: 598,
    views: 3800,
    sales: 15,
    change24h: +8.3,
    isVerified: true,
    hot: false
  }
];

const mockTrendingCreators = [
  { id: '1', name: 'LakotaDreams', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', sales: 234, followers: '12.5K', change: '+45%' },
  { id: '2', name: 'CoastalArtist', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', sales: 189, followers: '9.8K', change: '+38%' },
  { id: '3', name: 'PlainsElder', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', sales: 156, followers: '8.2K', change: '+32%' },
  { id: '4', name: 'HopiVision', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', sales: 134, followers: '7.1K', change: '+28%' },
  { id: '5', name: 'OjibweArt', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', sales: 112, followers: '6.5K', change: '+24%' }
];

export default function TrendingPage() {
  const [timeFilter, setTimeFilter] = useState('24h');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activePillar, setActivePillar] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [trendingItems, setTrendingItems] = useState(mockTrendingItems);
  const [trendingCreators, setTrendingCreators] = useState(mockTrendingCreators);
  const [usingMockFallback, setUsingMockFallback] = useState(true);
  const [loadingLive, setLoadingLive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const loadTrending = async () => {
      setLoadingLive(true);
      try {
        const result = await fetchDigitalArtPage({ sort: 'popular', page: 1, limit: 12 });
        if (!active) return;
        const rows = result.listings || [];
        if (rows.length === 0) {
          setTrendingItems(mockTrendingItems);
          setTrendingCreators(mockTrendingCreators);
          setUsingMockFallback(true);
          return;
        }
        const mappedItems = rows.slice(0, 12).map((row: DigitalArtApiListing, idx) => ({
          id: String(row.listingId || row._id || `live-${idx + 1}`),
          rank: idx + 1,
          title: String(row.title || 'Untitled Artwork'),
          creator: row.creatorAddress ? `Creator ${row.creatorAddress.slice(-4).toUpperCase()}` : 'Indigenous Creator',
          image: String(row.content?.previewUrl || row.content?.images?.[0] || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop'),
          price: Number(row.pricing?.buyNowPrice || row.pricing?.basePrice?.amount || row.pricing?.startingBid || 0),
          currency: String(row.pricing?.basePrice?.currency || 'INDI'),
          likes: Number(row.stats?.favorites || 0),
          views: Number(row.stats?.views || 0),
          sales: Number(row.stats?.sales || 0),
          change24h: Number((Math.max(0, Number(row.stats?.sales || 0)) * 1.8).toFixed(1)),
          isVerified: row.compliance?.creatorVerificationStatus === 'verified',
          hot: idx < 2
        }));
        const creatorAggregate = new Map<string, { sales: number; views: number }>();
        mappedItems.forEach((item) => {
          const key = item.creator;
          const found = creatorAggregate.get(key) || { sales: 0, views: 0 };
          found.sales += Number(item.sales || 0);
          found.views += Number(item.views || 0);
          creatorAggregate.set(key, found);
        });
        const mappedCreators = Array.from(creatorAggregate.entries())
          .map(([name, metrics], idx) => ({
            id: `creator-${idx + 1}`,
            name,
            avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
            sales: metrics.sales,
            followers: `${Math.max(1, Math.round(metrics.views / 100))}K`,
            change: `+${Math.max(1, Math.round(metrics.sales * 1.4))}%`
          }))
          .slice(0, 5);

        setTrendingItems(mappedItems);
        setTrendingCreators(mappedCreators.length > 0 ? mappedCreators : mockTrendingCreators);
        setUsingMockFallback(false);
      } catch {
        if (!active) return;
        setTrendingItems(mockTrendingItems);
        setTrendingCreators(mockTrendingCreators);
        setUsingMockFallback(true);
      } finally {
        if (active) setLoadingLive(false);
      }
    };
    void loadTrending();
    return () => {
      active = false;
    };
  }, [timeFilter]);

  const filteredTrendingItems = useMemo(() => {
    if (categoryFilter === 'all' || categoryFilter === 'digital') return trendingItems;
    return [];
  }, [categoryFilter]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <Sidebar 
        activePillar={activePillar} 
        onPillarChange={setActivePillar}
        isCollapsed={isCollapsed}
        onCollapseChange={setIsCollapsed}
      />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 p-6 transition-all duration-300">
      {/* Trending Takeover - Premium Revenue Spot */}
      <TrendingTakeover />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DC143C] to-[#8B0000] flex items-center justify-center">
            <Flame size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Trending Now</h1>
            <p className="text-gray-400">
              Discover what&apos;s hot in the Indigenous art world {loadingLive ? '- syncing live data...' : usingMockFallback ? '- preview data' : '- live'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {/* Time Filter */}
        <div className="flex items-center bg-[#141414] rounded-lg p-1 border border-[#d4af37]/20">
          {['24h', '7d', '30d', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeFilter === period
                  ? 'bg-[#d4af37] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {period === 'all' ? 'All Time' : period}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#d4af37]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#141414] border border-[#d4af37]/20 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">All Categories</option>
            <option value="digital">Digital Art</option>
            <option value="physical">Physical Items</option>
            <option value="music">Music</option>
            <option value="photography">Photography</option>
          </select>
        </div>
      </div>

      {/* Market Trends Chart */}
      <MarketTrendsChart timeRange={timeFilter} />

      {/* Top Gainers & Losers */}
      <TopGainersLosers />

      {/* Featured Trending - Revenue Spot */}
      <FeaturedTrending timeFilter={timeFilter} />

      {/* Newly Listed */}
      <NewlyListed />

      {/* Rising Stars */}
      <RisingStars />

      {/* Underpriced Gems */}
      <UnderpricedGems />

      {/* Collection Spotlights - Revenue Spot */}
      <CollectionSpotlights />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Trending Items */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-[#d4af37]" />
              Top Trending Items
            </h2>
            <span className="text-sm text-gray-400">Ranked by popularity</span>
          </div>

          {/* Trending Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTrendingItems.map((item) => (
              <div
                key={item.id}
                className="group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all hover:shadow-lg hover:shadow-[#d4af37]/5"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Rank Badge */}
                  <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    item.rank <= 3 
                      ? 'bg-[#d4af37] text-black' 
                      : 'bg-[#141414] text-white border border-[#d4af37]/30'
                  }`}>
                    #{item.rank}
                  </div>

                  {/* Hot Badge */}
                  {item.hot && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-[#DC143C] rounded-full">
                      <Flame size={12} className="text-white" />
                      <span className="text-white text-xs font-bold">HOT</span>
                    </div>
                  )}

                  {/* Verified Badge */}
                  {item.isVerified && (
                    <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1 truncate">{item.title}</h3>
                  <p className="text-[#d4af37] text-sm mb-3">by {item.creator}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {(item.views / 1000).toFixed(1)}K
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={14} />
                        {item.likes}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <ArrowUpRight size={14} />
                      {item.change24h}%
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Current Price</p>
                      <p className="text-lg font-bold text-[#d4af37]">{item.price} {item.currency}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/digital-arts?id=${item.id}`, { scroll: false })}
                      className="px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-sm hover:bg-[#d4af37] hover:text-black transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredTrendingItems.length === 0 && (
            <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#141414] p-6 text-center">
              <p className="text-white font-medium">No trending items for this category yet.</p>
              <p className="mt-1 text-sm text-gray-400">Try All Categories or Digital Art to see live results.</p>
              <button
                onClick={() => setCategoryFilter('all')}
                className="mt-4 px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-sm hover:bg-[#d4af37] hover:text-black transition-all"
              >
                Reset Category Filter
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Promoted Creators - Revenue Spot */}
          <PromotedCreators />

          {/* Activity Feed */}
          <ActivityFeed />

          {/* Original Trending Creators */}
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-[#d4af37]" />
              Trending Creators
            </h2>

            <div className="space-y-4">
              {trendingCreators.map((creator, index) => (
                <div
                  key={creator.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                >
                  <span className="text-[#d4af37] font-bold w-6">{index + 1}</span>
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{creator.name}</p>
                    <p className="text-gray-400 text-xs">{creator.followers} followers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-sm font-medium">{creator.change}</p>
                    <p className="text-gray-500 text-xs">{creator.sales} sales</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/digital-arts"
              className="block w-full mt-4 py-2 border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-sm text-center hover:bg-[#d4af37]/10 transition-all"
            >
              View All Creators
            </Link>
          </div>

          {/* Trending Topics */}
          <div className="mt-6 bg-[#141414] rounded-xl border border-[#d4af37]/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['#SacredGeometry', '#Beadwork', '#NativeAmerican', '#IndigenousArt', '#Traditional', '#Contemporary', '#Spiritual', '#Nature'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => router.push(`/community?tag=${encodeURIComponent(tag)}`, { scroll: false })}
                  className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/30 border border-transparent cursor-pointer transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}




