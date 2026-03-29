'use client';

import Link from 'next/link';
import StickyBanner from './home/StickyBanner';
import HeroSection from './home/HeroSection';
import StatsBar from './home/StatsBar';
import RecentSalesTicker from './home/RecentSalesTicker';
import PillarQuickActions from './home/PillarQuickActions';
import FeaturedCollections from './home/FeaturedCollections';
import NewArrivals from './home/NewArrivals';
import LiveAuctions from './home/LiveAuctions';
import EndingSoon from './home/EndingSoon';
import TrendingSection from './home/TrendingSection';
import PriceDrops from './home/PriceDrops';
import BundleDeals from './home/BundleDeals';
import ArtistSpotlight from './home/ArtistSpotlight';
import CreatorOfTheMonth from './home/CreatorOfTheMonth';
import TopArtists from './home/TopArtists';
import EventPromotions from './home/EventPromotions';
import CommunityStories from './home/CommunityStories';
import Testimonials from './home/Testimonials';
import BlogNews from './home/BlogNews';
import MembershipCTA from './home/MembershipCTA';
import Newsletter from './home/Newsletter';

interface HomePageProps {
  onPillarSelect: (pillarId: string) => void;
}

export default function HomePage({ onPillarSelect }: HomePageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sticky Sponsor Banner */}
      <StickyBanner />

      {/* Hero Carousel */}
      <HeroSection />
      
      {/* Live Statistics */}
      <StatsBar />

      {/* Recent Sales Ticker */}
      <RecentSalesTicker />
      
      {/* 10 Pillars Quick Actions */}
      <PillarQuickActions onPillarClick={onPillarSelect} />

      {/* New Arrivals & Drops */}
      <NewArrivals />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* Live Auctions */}
      <LiveAuctions />

      {/* Ending Soon */}
      <EndingSoon />
      
      {/* Trending NFTs */}
      <TrendingSection />

      {/* Price Drops */}
      <PriceDrops />

      {/* Bundle Deals */}
      <BundleDeals />

      {/* Artist Spotlight */}
      <ArtistSpotlight />

      {/* Creator of the Month */}
      <CreatorOfTheMonth />
      
      {/* Top Artists */}
      <TopArtists />

      {/* Event Promotions */}
      <EventPromotions />

      {/* Community Stories */}
      <CommunityStories />

      {/* Testimonials */}
      <Testimonials />

      {/* Blog & News */}
      <BlogNews />

      {/* Membership CTA - Main Tiers */}
      <MembershipCTA />
      
      {/* Newsletter CTA */}
      <Newsletter />
      
      {/* Footer */}
      <footer className="py-8 px-6 bg-[#0a0a0a] border-t border-[#d4af37]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Indigena" 
              className="w-8 h-8 rounded-full"
            />
            <span className="text-white font-semibold">INDIGENA</span>
          </div>
          <p className="text-gray-500 text-sm">
            (c) 2026 Indigena Market. Preserving Indigenous culture through ethical commerce.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/help?section=terms" className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">Terms</Link>
            <Link href="/help?section=privacy" className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">Privacy</Link>
            <Link href="/help?section=contact" className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}



