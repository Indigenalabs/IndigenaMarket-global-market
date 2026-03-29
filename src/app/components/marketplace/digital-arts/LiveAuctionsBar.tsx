'use client';

import Link from 'next/link';
import { Gavel, Clock, TrendingUp, ChevronRight } from 'lucide-react';

interface Auction {
  id: string;
  title: string;
  creator: string;
  image: string;
  currentBid: number;
  currency: string;
  auctionEnds: string;
  bids: number;
}

interface LiveAuctionsBarProps {
  auctions: Auction[];
}

export default function LiveAuctionsBar({ auctions }: LiveAuctionsBarProps) {
  if (auctions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#DC143C]/20 via-[#141414] to-[#d4af37]/10 rounded-xl border border-[#DC143C]/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#DC143C] rounded-full flex items-center justify-center animate-pulse">
            <Gavel size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              Live Auctions
              <span className="px-2 py-0.5 bg-[#DC143C] text-white text-xs rounded-full">
                {auctions.length} Active
              </span>
            </h3>
            <p className="text-gray-400 text-sm">Bid on exclusive Indigenous digital art</p>
          </div>
        </div>
        <Link
          href="/digital-arts?saleType=auction"
          className="flex items-center gap-1 text-[#d4af37] hover:text-[#f4e4a6] transition-colors text-sm"
        >
          View All Auctions
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {auctions.slice(0, 3).map((auction) => (
          <div 
            key={auction.id}
            className="bg-[#0a0a0a] rounded-lg p-3 border border-[#DC143C]/20 hover:border-[#DC143C]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <img 
                src={auction.image}
                alt={auction.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate group-hover:text-[#d4af37] transition-colors">
                  {auction.title}
                </h4>
                <p className="text-gray-400 text-xs">by {auction.creator}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[#d4af37] font-bold">{auction.currentBid} {auction.currency}</span>
                  <span className="text-gray-500 text-xs">{auction.bids || 5} bids</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-[#DC143C] text-sm">
                  <Clock size={14} />
                  <span className="font-medium">{auction.auctionEnds}</span>
                </div>
                <button className="mt-2 px-3 py-1 bg-[#DC143C] text-white text-xs rounded-full hover:bg-[#ff1a1a] transition-colors">
                  Bid Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
