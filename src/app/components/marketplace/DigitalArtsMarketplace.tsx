'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Grid3X3, List, Filter, ChevronDown,
  Palette, Gavel, Crown, ShoppingCart
} from 'lucide-react';
import FeaturedBanner from './FeaturedBanner';
import DigitalArtsStickyBanner from './DigitalArtsStickyBanner';
import PillarArtistSpotlight from './PillarArtistSpotlight';
import ArtStyleFilter from './digital-arts/ArtStyleFilter';
import LiveAuctionsBar from './digital-arts/LiveAuctionsBar';
import TrendingCollections from './digital-arts/TrendingCollections';
import LimitedDrops from './digital-arts/LimitedDrops';
import ArtistStudioCTA from './digital-arts/ArtistStudioCTA';
import ArtDetailModal from './digital-arts/ArtDetailModal';
import ArtistMiniCard from './digital-arts/ArtistMiniCard';
import SearchDiscovery from './digital-arts/SearchDiscovery';
import SocialFeatures from './digital-arts/SocialFeatures';
import WalletIntegration from './digital-arts/WalletIntegration';
import OfferSystem from './digital-arts/OfferSystem';
import FavoritesWatchlist from './digital-arts/FavoritesWatchlist';
import ActivityFeed from './digital-arts/ActivityFeed';
import TransactionHistory from './digital-arts/TransactionHistory';
import SponsoredGridCard from './digital-arts/SponsoredGridCard';
import NewArrivalsPinnedCard from './digital-arts/NewArrivalsPinnedCard';
import CollectionLaunchBadge from './digital-arts/CollectionLaunchBadge';
import AuctionSystem from './digital-arts/AuctionSystem';
import CollectionManager from './digital-arts/CollectionManager';
import { getMarketplaceCardMerchandising } from './marketplaceCardMerchandising';
import { DIGITAL_ART_CATEGORIES, DIGITAL_ART_CATEGORY_MEDIUM_MAP } from '../../digital-arts/data/pillar1Catalog';
import { fetchDigitalArtPage, buyListing, bidListing, makeOffer, toggleWatchlist, shareListing, reportListing, trackMarketplaceEvent, type DigitalArtApiListing } from '@/app/lib/digitalArtApi';
import { isGlobalMockFallbackEnabled } from '@/app/lib/mockMode';

const ALLOW_MOCK_FALLBACK = isGlobalMockFallbackEnabled();

// Mock Digital Art NFTs with cultural metadata
const mockDigitalArts = [
  {
    id: '1',
    title: 'Sacred Buffalo Spirit',
    creator: 'LakotaDreams',
    price: 250,
    currency: 'INDI',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    likes: 128,
    views: 1045,
    isVerified: true,
    isAuction: true,
    currentBid: 275,
    auctionEnds: '2h 15m',
    nation: 'Lakota',
    style: 'Spiritual',
    medium: 'Digital Painting',
    edition: '1 of 1',
    hasOffers: true
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
    isVerified: true,
    isAuction: false,
    nation: 'Navajo',
    style: 'Geometric',
    medium: 'Generative Art',
    edition: '1 of 10',
    hasOffers: false
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
    isVerified: false,
    isAuction: true,
    currentBid: 485,
    auctionEnds: '45m',
    nation: 'Haida',
    style: 'Formline',
    medium: '3D Render',
    edition: '1 of 1',
    hasOffers: true
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
    isVerified: true,
    isAuction: false,
    nation: 'Cree',
    style: 'Symbolic',
    medium: 'Digital Collage',
    edition: '1 of 5',
    hasOffers: false
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
    isVerified: false,
    isAuction: false,
    nation: 'Ojibwe',
    style: 'Traditional',
    medium: 'Vector Art',
    edition: 'Open',
    hasOffers: true
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
    isVerified: true,
    isAuction: true,
    currentBid: 380,
    auctionEnds: '5h 30m',
    nation: 'Hopi',
    style: 'Ceremonial',
    medium: 'Digital Painting',
    edition: '1 of 1',
    hasOffers: true
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
    isVerified: false,
    isAuction: false,
    nation: 'Anishinaabe',
    style: 'Storytelling',
    medium: 'Illustration',
    edition: '1 of 25',
    hasOffers: false
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
    isVerified: true,
    isAuction: false,
    nation: 'Cherokee',
    style: 'Spiritual',
    medium: 'Digital Painting',
    edition: '1 of 1',
    hasOffers: true
  }
];

// Sponsored / premium placement artwork objects (used by modal)
const SPONSORED_ARTWORK = {
  id: 'sp-1',
  title: 'Celestial Dreamcatcher Series',
  creator: 'NightSkyWeaver',
  price: 195,
  currency: 'INDI',
  image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=600&fit=crop',
  likes: 312,
  views: 4820,
  isVerified: true,
  isAuction: false,
  nation: 'Ojibwe',
  style: 'Mystic',
  medium: 'Digital Painting',
  edition: '1 of 1',
  hasOffers: true,
  description: 'A mystical series blending celestial imagery with traditional Ojibwe dreamcatcher motifs.',
};

const PINNED_ARTWORK = {
  id: 'pin-1',
  title: 'Morning Prayer Digital Print',
  creator: 'CoastalElder',
  price: 140,
  currency: 'INDI',
  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
  likes: 198,
  views: 2340,
  isVerified: true,
  isAuction: false,
  nation: 'Coast Salish',
  style: 'Spiritual',
  medium: 'Digital Painting',
  edition: '1 of 5',
  hasOffers: false,
  description: 'A serene mountain sunrise captured through the lens of Coast Salish spiritual tradition.',
};

function getCategoryForMedium(medium: string): string {
  const match = Object.entries(DIGITAL_ART_CATEGORY_MEDIUM_MAP).find(([, mediums]) => mediums.includes(medium));
  return match?.[0] ?? '';
}

interface UiArt {
  id: string;
  title: string;
  creator: string;
  price: number;
  currency: string;
  image: string;
  likes: number;
  views: number;
  isVerified: boolean;
  isAuction: boolean;
  currentBid?: number;
  auctionEnds?: string;
  nation: string;
  style: string;
  medium: string;
  edition: string;
  hasOffers: boolean;
  description?: string;
  compliance?: {
    provenanceLevel?: 'none' | 'basic' | 'verified';
    moderationStatus?: 'pending' | 'approved' | 'rejected';
  };
}

function mapApiListingToUi(listing: DigitalArtApiListing): UiArt {
  const isAuction = listing.listingType === 'auction';
  const basePrice = listing.pricing?.basePrice?.amount ?? 0;
  const totalEditions = listing.nftDetails?.totalEditions;
  let edition = 'Open';
  if (totalEditions === 1) edition = '1 of 1';
  else if (totalEditions && totalEditions > 1) edition = '1 of ' + totalEditions;

  return {
    id: listing.listingId || listing._id || Math.random().toString(36).slice(2),
    title: listing.title || 'Untitled Artwork',
    creator: listing.creatorAddress || 'Unknown Creator',
    price: listing.pricing?.buyNowPrice ?? basePrice,
    currency: listing.pricing?.basePrice?.currency || 'INDI',
    image: listing.content?.previewUrl || listing.content?.images?.[0] || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    likes: listing.stats?.favorites ?? 0,
    views: listing.stats?.views ?? 0,
    isVerified: listing.compliance?.creatorVerificationStatus === 'verified',
    isAuction,
    currentBid: isAuction ? (listing.pricing?.startingBid ?? basePrice) : undefined,
    auctionEnds: isAuction ? 'Live' : undefined,
    nation: listing.culturalMetadata?.nation || 'Indigenous',
    style: listing.subcategory || 'Traditional',
    medium: listing.subcategory || 'Digital Art',
    edition,
    hasOffers: !!listing.pricing?.buyNowPrice,
    compliance: {
      provenanceLevel: listing.compliance?.provenanceLevel || 'none',
      moderationStatus: listing.compliance?.moderationStatus || 'pending'
    }
  };
}

export default function DigitalArtsMarketplace() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    nation: '',
    style: '',
    medium: '',
    priceRange: '',
    saleType: 'all',
    editionType: 'all',
    verifiedOnly: false
  });
  const [selectedArtwork, setSelectedArtwork] = useState<UiArt | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletBalance] = useState({ indi: 1250, xrp: 45.5 });
  const [searchQuery, setSearchQuery] = useState('');
  const [apiArts, setApiArts] = useState<UiArt[]>([]);
  const [serverReachable, setServerReachable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(ALLOW_MOCK_FALLBACK ? mockDigitalArts.length : 0);
  const abortRef = useRef<AbortController | null>(null);
  const auctionEndTime = useMemo(() => new Date(Date.now() + 2 * 60 * 60 * 1000), []);

  const sourceArts = useMemo(() => {
    if (serverReachable) return apiArts;
    return ALLOW_MOCK_FALLBACK ? mockDigitalArts : [];
  }, [serverReachable, apiArts]);

  const filteredArts = useMemo(() => {
    let list = sourceArts.filter(art => {
      if (activeFilters.category && getCategoryForMedium(art.medium) !== activeFilters.category) return false;
      if (activeFilters.nation && art.nation !== activeFilters.nation) return false;
      if (activeFilters.style && art.style !== activeFilters.style) return false;
      if (activeFilters.medium && art.medium !== activeFilters.medium) return false;
      if (activeFilters.verifiedOnly && !art.isVerified) return false;
      if (activeFilters.saleType === 'auction' && !art.isAuction) return false;
      if (activeFilters.saleType === 'buy_now' && art.isAuction) return false;
      if (activeFilters.saleType === 'has_offers' && !art.hasOffers) return false;
      if (activeFilters.editionType === 'unique' && art.edition !== '1 of 1') return false;
      if (activeFilters.editionType === 'limited' && !/^1 of (?!1$)\d+$/i.test(art.edition)) return false;
      if (activeFilters.editionType === 'open' && art.edition.toLowerCase() !== 'open') return false;

      const [minText, maxText] = activeFilters.priceRange.split('-');
      const min = minText ? Number(minText) : NaN;
      const max = maxText ? Number(maxText) : NaN;
      const price = art.isAuction ? (art.currentBid ?? art.price) : art.price;
      if (!Number.isNaN(min) && price < min) return false;
      if (!Number.isNaN(max) && price > max) return false;
      return true;
    });

    if (!serverReachable && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(art => art.title.toLowerCase().includes(q) || art.creator.toLowerCase().includes(q) || art.nation.toLowerCase().includes(q) || art.style.toLowerCase().includes(q) || art.medium.toLowerCase().includes(q));
    }

    if (!serverReachable) {
      if (sortBy === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
      if (sortBy === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
      if (sortBy === 'most-liked') list = [...list].sort((a, b) => b.likes - a.likes);
      if (sortBy === 'auction') list = [...list].sort((a, b) => (a.isAuction ? 0 : 1) - (b.isAuction ? 0 : 1));
    }

    return list;
  }, [sourceArts, activeFilters, searchQuery, sortBy, serverReachable]);

  interface FilterState {
    nation: string;
    style: string;
    medium: string;
    sortBy: string;
    priceRange: { min: string; max: string };
  }

  const runFetch = React.useCallback(async (targetPage: number, append: boolean) => {
    const [minText, maxText] = activeFilters.priceRange.split('-');
    const minPrice = minText ? Number(minText) : undefined;
    const maxPrice = maxText ? Number(maxText) : undefined;
    const sortMap: Record<string, string> = {
      recent: 'createdAt',
      'price-low': 'pricing.basePrice.amount',
      'price-high': 'pricing.basePrice.amount',
      'most-liked': 'stats.favorites',
      auction: 'createdAt'
    };
    const listingType = activeFilters.saleType === 'auction' ? 'auction' : activeFilters.saleType === 'buy_now' ? 'instant' : undefined;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (append) setIsLoadingMore(true); else setIsLoading(true);
      const response = await fetchDigitalArtPage({
        q: searchQuery.trim() || undefined,
        category: activeFilters.category || undefined,
        nation: activeFilters.nation || undefined,
        listingType,
        minPrice,
        maxPrice,
        sort: sortMap[sortBy] ?? 'createdAt',
        page: targetPage,
        limit: 24
      }, controller.signal);
      const next = response.listings.map(mapApiListingToUi);
      setApiArts(prev => append ? [...prev, ...next] : next);
      setTotalCount(response.total);
      setTotalPages(response.pages);
      setPage(response.page);
      setFetchError('');
      setServerReachable(true);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setFetchError(ALLOW_MOCK_FALLBACK ? 'Using offline fallback data' : 'Unable to load digital art listings.');
      if (!append) {
        setApiArts([]);
        setTotalCount(mockDigitalArts.length);
      }
      setServerReachable(false);
    } finally {
      if (append) setIsLoadingMore(false); else setIsLoading(false);
    }
  }, [activeFilters.category, activeFilters.nation, activeFilters.priceRange, activeFilters.saleType, searchQuery, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => { void runFetch(1, false); }, 350);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [runFetch]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    void trackMarketplaceEvent({ event: 'search', metadata: { q: query } }).catch(() => undefined);
  };

  const handleFilterChange = React.useCallback((filters: FilterState) => {
    const sortMap: Record<string, string> = {
      trending: 'recent',
      recent: 'recent',
      'price-low': 'price-low',
      'price-high': 'price-high',
      popular: 'most-liked',
      auctions: 'auction'
    };

    setSortBy(sortMap[filters.sortBy] ?? 'recent');
    setActiveFilters((prev) => ({
      ...prev,
      nation: filters.nation !== 'All Nations' ? filters.nation : '',
      style: filters.style !== 'All Styles' ? filters.style : '',
      medium: filters.medium !== 'All Mediums' ? filters.medium : '',
      priceRange: filters.priceRange.min || filters.priceRange.max ? `${filters.priceRange.min}-${filters.priceRange.max}` : ''
    }));
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages || !serverReachable) return;
    await runFetch(page + 1, true);
  };

  const handleBuy = async (id: string) => {
    try {
      await buyListing(id);
      await trackMarketplaceEvent({ event: 'buy', listingId: id, category: activeFilters.category || undefined }).catch(() => undefined);
      setFetchError('');
    } catch {
      setFetchError('Transaction service is temporarily unavailable. Please try again.');
    }
  };

  const handleBid = async (id: string, amount: number) => {
    try {
      await bidListing(id, amount);
      await trackMarketplaceEvent({ event: 'bid', listingId: id, metadata: { amount }, category: activeFilters.category || undefined }).catch(() => undefined);
      setFetchError('');
    } catch {
      setFetchError('Bidding is temporarily unavailable. Please try again.');
    }
  };

  const handleMakeOffer = async (amount: number, msg: string) => {
    const target = selectedArtwork ?? filteredArts[0];
    if (!target) return;
    try {
      await makeOffer(target.id, amount, 'demo-wallet', msg);
      await trackMarketplaceEvent({ event: 'offer', listingId: target.id, metadata: { amount } }).catch(() => undefined);
      setFetchError('');
    } catch {
      setFetchError('Offer service is temporarily unavailable. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Wallet Integration */}
      <WalletIntegration
        isConnected={isWalletConnected}
        walletAddress={isWalletConnected ? 'rN7n7otQDd6FczFgLdlqtyMVrn3HMfHgFj' : undefined}
        balance={walletBalance}
        onConnect={() => setIsWalletConnected(true)}
        onDisconnect={() => setIsWalletConnected(false)}
        onRefresh={() => void runFetch(1, false)}
      />

      {/* Search & Discovery */}
      <SearchDiscovery
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Featured Banner */}
      <FeaturedBanner pillar="digital-arts" />

      {/* Premium Placement #7 â€” Sticky Announcement Banner */}
      <DigitalArtsStickyBanner />

      {/* Live Auctions Bar */}
      <LiveAuctionsBar auctions={filteredArts.filter(a => a.isAuction && a.currentBid !== undefined && a.auctionEnds !== undefined).map(a => ({ id: a.id, title: a.title, creator: a.creator, image: a.image, currentBid: a.currentBid as number, currency: a.currency, auctionEnds: a.auctionEnds as string, bids: 5 }))} />

      {/* Artist Spotlight */}
      <PillarArtistSpotlight pillar="digital-arts" />

      {/* Trending Collections */}
      <TrendingCollections />

      {/* Limited Drops */}
      <LimitedDrops />

      {/* Collection Launch Badge â€” Premium Placement ($50/launch) */}
      <CollectionLaunchBadge
        collectionName="River Canyon Spirits"
        artist="CanyonPainter"
        image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop"
        totalItems={20}
        floorPrice={180}
        daysRemaining={7}
        onViewCollection={() => setSelectedArtwork(PINNED_ARTWORK)}
      />

      {/* Cultural Filters */}
      <ArtStyleFilter 
        activeFilters={activeFilters}
        onFilterChange={(next) => setActiveFilters(prev => ({ ...prev, ...next }))}
      />

      {/* New Arrivals Pinned Card â€” Premium Placement ($75/wk) */}
      <NewArrivalsPinnedCard
        onViewArtwork={() => setSelectedArtwork(PINNED_ARTWORK)}
      />

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="text-[#d4af37]" size={20} />
            Explore Digital Arts
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {serverReachable ? `${totalCount} listings` : `${filteredArts.length} artworks`} from Indigenous artists worldwide
          </p>
        </div>

        {/* View All link + Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/digital-arts"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-sm font-medium rounded-lg hover:bg-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all"
          >
View All 1M+ Artworks ?
          </Link>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#141414] border border-[#DC143C]/30 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-[#DC143C] cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="most-liked">Most Liked</option>
              <option value="auction">Ending Soon (Auctions)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

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


      {/* Category Pills (Synced with /digital-arts view-all categories) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DIGITAL_ART_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() =>
              setActiveFilters((prev) => ({
                ...prev,
                category: category.id === 'all' ? '' : category.id
              }))
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              (category.id === 'all' && !activeFilters.category) || activeFilters.category === category.id
                ? 'bg-[#d4af37] text-black border-[#d4af37]'
                : 'bg-[#141414] border-white/10 text-gray-400 hover:border-[#d4af37]/40 hover:text-white'
            }`}
          >
            <span>{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>
      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-[#141414] rounded-xl border border-[#DC143C]/20">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Price Range (INDI)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min"
                  value={activeFilters.priceRange?.split('-')[0] ?? ''}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, priceRange: `${e.target.value}-${prev.priceRange?.split('-')[1] ?? ''}` }))}
                  className="w-full bg-[#0a0a0a] border border-[#DC143C]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DC143C]"
                />
                <span className="text-gray-500">-</span>
                <input 
                  type="number" 
                  placeholder="Max"
                  value={activeFilters.priceRange?.split('-')[1] ?? ''}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, priceRange: `${prev.priceRange?.split('-')[0] ?? ''}-${e.target.value}` }))}
                  className="w-full bg-[#0a0a0a] border border-[#DC143C]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Edition Type</label>
              <select
                value={activeFilters.editionType}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, editionType: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#DC143C]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DC143C]"
              >
                <option value="all">All Editions</option>
                <option value="unique">1 of 1 (Unique)</option>
                <option value="limited">Limited Edition</option>
                <option value="open">Open Edition</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Sale Type</label>
              <select
                value={activeFilters.saleType}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, saleType: e.target.value }))}
                className="w-full bg-[#0a0a0a] border border-[#DC143C]/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#DC143C]"
              >
                <option value="all">All Listings</option>
                <option value="buy_now">Buy Now</option>
                <option value="auction">On Auction</option>
                <option value="has_offers">Has Offers</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Verified Artists</label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={activeFilters.verifiedOnly}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#DC143C]/30 bg-[#0a0a0a] text-[#DC143C] focus:ring-[#DC143C]"
                />
                <span className="text-sm text-gray-300">Show verified only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* NFT Grid â€” SponsoredGridCard injected every 8 items ($100/wk) */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {filteredArts.reduce<React.ReactNode[]>((acc, art, idx) => {
          acc.push(
            <DigitalArtCard
              key={art.id}
              art={art}
              onClick={() => { setSelectedArtwork(art); void trackMarketplaceEvent({ event: 'view', listingId: art.id, category: activeFilters.category || undefined }).catch(() => undefined); }}
            />
          );
          // Insert sponsored card after every 8th item
          if ((idx + 1) % 8 === 0) {
            acc.push(
              <SponsoredGridCard
                key={`sponsored-${idx}`}
                onViewArtwork={() => setSelectedArtwork(SPONSORED_ARTWORK)}
              />
            );
          }
          return acc;
        }, [])}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-8 py-3 bg-[#141414] border border-[#d4af37]/30 rounded-full text-[#d4af37] font-medium hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all">
          Load More Artworks
        </button>
      </div>

      {/* Artist Studio CTA */}
      <ArtistStudioCTA />

      {/* ===== Feature Panels (2-col layout) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offers Panel */}
        <OfferSystem
          currentPrice={250}
          currency="INDI"
          isOwner={false}
          onMakeOffer={(amount, msg) => void handleMakeOffer(amount, msg)}
          onAcceptOffer={(id) => console.log('Accept:', id)}
          onRejectOffer={(id) => console.log('Reject:', id)}
          onCounterOffer={(id, amt) => console.log('Counter:', id, amt)}
        />

        {/* Favorites & Watchlist */}
        <FavoritesWatchlist
          items={[]}
          onRemoveFavorite={(id) => {
          void toggleWatchlist(id).catch(() => undefined);
          void trackMarketplaceEvent({ event: 'favorite_remove', listingId: id }).catch(() => undefined);
        }}
          onToggleWatch={(id) => {
          void toggleWatchlist(id).catch(() => undefined);
          void trackMarketplaceEvent({ event: 'watch_toggle', listingId: id }).catch(() => undefined);
        }}
          onViewArtwork={(id) => {
          const art = filteredArts.find((entry) => entry.id === id);
          if (art) setSelectedArtwork(art);
        }}
        />
      </div>

      {/* ===== Social Features ===== */}
      <SocialFeatures
        artworkId="featured"
        likes={128}
        isLiked={false}
        onLike={() => void trackMarketplaceEvent({ event: 'like', listingId: selectedArtwork?.id }).catch(() => undefined)}
        onUnlike={() => void trackMarketplaceEvent({ event: 'unlike', listingId: selectedArtwork?.id }).catch(() => undefined)}
        onShare={(platform) => { const target = selectedArtwork ?? filteredArts[0]; if (!target) return; void shareListing(target.id, platform).catch(() => undefined); void trackMarketplaceEvent({ event: 'share', listingId: target.id, metadata: { platform } }).catch(() => undefined); }}
        onComment={(content) => console.log('Comment:', content)}
        onReport={() => { const target = selectedArtwork ?? filteredArts[0]; if (!target) return; void reportListing(target.id, 'community_report').catch(() => undefined); void trackMarketplaceEvent({ event: 'report', listingId: target.id }).catch(() => undefined); }}
      />

      {/* ===== Collection Manager ===== */}
      <CollectionManager
        collections={[
          {
            id: 'col-1',
            name: 'Sacred Spirits',
            description: 'A collection exploring spiritual themes from Lakota tradition',
            itemCount: 12,
            floorPrice: 180,
            volume: 2400,
            isPublished: true,
            createdAt: '2024-01-15',
            coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&h=300&fit=crop',
          },
          {
            id: 'col-2',
            name: 'Digital Weavings',
            description: 'Modern interpretations of traditional textile patterns',
            itemCount: 8,
            floorPrice: 95,
            volume: 850,
            isPublished: true,
            createdAt: '2024-02-20',
            coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop',
          },
        ]}
        onCreateCollection={(data) => console.log('Create collection:', data)}
        onEditCollection={(id, data) => console.log('Edit collection:', id, data)}
        onDeleteCollection={(id) => console.log('Delete collection:', id)}
        onPublishCollection={(id) => console.log('Publish collection:', id)}
        onViewCollection={(id) => console.log('View collection:', id)}
      />

      {/* ===== Live Auction System ===== */}
      <AuctionSystem
        artworkId="auction-1"
        startingPrice={200}
        currentBid={275}
        currency="INDI"
        auctionEndTime={auctionEndTime}
        reservePrice={250}
        bidHistory={[
          { id: 'b1', bidder: 'Collector_A', amount: 275, currency: 'INDI', timestamp: '2 min ago', isCurrent: true },
          { id: 'b2', bidder: 'ArtLover_42', amount: 260, currency: 'INDI', timestamp: '5 min ago', isCurrent: false },
          { id: 'b3', bidder: 'NativeNFT', amount: 250, currency: 'INDI', timestamp: '12 min ago', isCurrent: false },
          { id: 'b4', bidder: 'IndigenaFan', amount: 225, currency: 'INDI', timestamp: '20 min ago', isCurrent: false },
        ]}
        onPlaceBid={(amount) => { const target = selectedArtwork ?? filteredArts[0]; if (!target) return; void handleBid(target.id, amount); }}
        onSetAutoBid={(max) => console.log('Auto-bid set:', max)}
      />

      {/* Activity Feed + Transaction History (2-col layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed
          onRefresh={() => void runFetch(1, false)}
          onViewArtwork={(id) => {
            const art = filteredArts.find(a => a.id === id);
            if (art) setSelectedArtwork(art);
          }}
        />
        <TransactionHistory
          onViewArtwork={(id) => {
            const art = filteredArts.find(a => a.id === id);
            if (art) setSelectedArtwork(art);
          }}
          onViewTx={(hash) => window.open(`https://bithomp.com/explorer/${hash}`, '_blank')}
        />
      </div>

      {/* Art Detail Modal */}
      {selectedArtwork && (
        <ArtDetailModal
          artwork={selectedArtwork}
          isOpen={!!selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onLike={(id) => void trackMarketplaceEvent({ event: 'like_modal', listingId: id }).catch(() => undefined)}
          onShare={(id) => { void shareListing(id, 'link').catch(() => undefined); void trackMarketplaceEvent({ event: 'share_modal', listingId: id }).catch(() => undefined); }}
          onBuy={(id) => void handleBuy(id)}
          onBid={(id, amount) => void handleBid(id, amount)}
        />
      )}
    </div>
  );
}

// Enhanced Digital Art Card with cultural metadata
function DigitalArtCard({ art, onClick }: { art: UiArt; onClick: () => void }) {
  const [showArtist, setShowArtist] = React.useState(false);
  const merch = getMarketplaceCardMerchandising({
    title: art.title,
    pillarLabel: 'Digital Arts',
    image: art.image,
    coverImage: art.image,
    galleryOrder: [art.image],
    ctaMode: art.isAuction ? 'message' : 'buy',
    ctaPreset: art.isAuction ? 'message-first' : 'collect-now',
    availabilityLabel: art.isAuction ? 'Auction live' : 'Available now',
    availabilityTone: art.isAuction ? 'warning' : 'success',
    featured: art.isVerified,
    merchandisingRank: art.views > 2000 ? 1 : 8,
    status: art.isAuction ? 'Auction' : 'Active',
    priceLabel: `${art.isAuction ? art.currentBid ?? art.price : art.price} ${art.currency}`,
    blurb: `${art.nation} · ${art.style} · ${art.medium}`,
  });
  const primaryLabel = art.isAuction ? 'Place bid' : merch.ctaLabel;

  return (
    <>
    <div
      className="group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all hover:shadow-lg hover:shadow-[#d4af37]/5 cursor-pointer"
    >
      {/* Image â€” click to open detail modal */}
      <div className="relative aspect-square overflow-hidden" onClick={onClick}>
        <Image
          src={merch.image}
          alt={art.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {art.isAuction && (
            <div className="flex items-center gap-1 px-2 py-1 bg-[#DC143C] rounded-full">
              <Gavel size={12} className="text-white" />
              <span className="text-white text-xs font-medium">Live Auction</span>
            </div>
          )}
          {art.edition === '1 of 1' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-[#d4af37] rounded-full">
              <Crown size={12} className="text-black" />
              <span className="text-black text-xs font-medium">Unique</span>
            </div>
          )}
          {merch.launchBadge && (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/90 rounded-full">
              <span className="text-white text-xs font-medium">{merch.launchBadge}</span>
            </div>
          )}
        </div>

        {/* Hover Overlay â€” quick actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center gap-3 p-4">
          {art.isAuction ? (
            <button
              onClick={e => { e.stopPropagation(); onClick(); }}
              className="flex-1 py-2.5 bg-[#DC143C] text-white text-sm font-semibold rounded-xl hover:bg-[#DC143C]/80 transition-colors flex items-center justify-center gap-2"
            >
              <Gavel size={15} />
              {primaryLabel}
            </button>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onClick(); }}
              className="flex-1 py-2.5 bg-[#d4af37] text-black text-sm font-semibold rounded-xl hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={15} />
              {primaryLabel}
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onClick(); }}
            className="py-2.5 px-3 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-colors"
          >
            View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Cultural Tags */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full">{art.nation}</span>
          <span className="px-2 py-0.5 bg-[#DC143C]/10 text-[#DC143C] text-xs rounded-full">{art.style}</span>
          <span className="text-gray-500 text-xs">{art.medium}</span>
        </div>

        {/* Title & Creator */}
        <h3 className="text-white font-semibold mb-1 truncate" onClick={onClick}>{art.title}</h3>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={e => { e.stopPropagation(); setShowArtist(true); }}
            className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
          >
            by {art.creator}
          </button>
          {art.isVerified && (
            <div className="w-4 h-4 bg-[#d4af37] rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-xs mb-3">{art.edition}</p>

        {/* Price / Bid + Buy button */}
        <div className="flex items-center justify-between pt-3 border-t border-[#d4af37]/10">
          <div>
            {art.isAuction ? (
              <>
                <p className="text-gray-500 text-xs">Current Bid</p>
                <p className="text-[#d4af37] font-bold">{art.currentBid} {art.currency}</p>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-xs">Price</p>
                <p className="text-white font-bold">{art.price} {art.currency}</p>
              </>
            )}
          </div>
          {art.isAuction ? (
            <button
              onClick={e => { e.stopPropagation(); onClick(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DC143C] text-white text-xs font-semibold rounded-lg hover:bg-[#DC143C]/80 transition-colors"
          >
            <Gavel size={12} />
            Bid â€” {art.auctionEnds}
            </button>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onClick(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37] text-black text-xs font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
          >
            <ShoppingCart size={12} />
            {primaryLabel}
          </button>
        )}
        </div>
      </div>
    </div>
    {showArtist && (
      <ArtistMiniCard
        name={art.creator}
        isVerified={art.isVerified}
        onClose={() => setShowArtist(false)}
      />
    )}
    </>
  );
}








