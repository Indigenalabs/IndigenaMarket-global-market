'use client';

import { useState, useEffect } from 'react';
import { Gavel, Clock, TrendingUp, Users, CheckCircle, AlertTriangle, ChevronUp, Zap, Shield } from 'lucide-react';

interface BidEntry {
  id: string;
  bidder: string;
  amount: number;
  currency: string;
  timestamp: string;
  isYou?: boolean;
}

interface AuctionItem {
  id: string;
  title: string;
  maker: string;
  nation: string;
  image: string;
  startingPrice: number;
  currentBid: number;
  reservePrice: number;
  currency: string;
  endsAt: Date;
  isSacred: boolean;
  isVerified: boolean;
  bidHistory: BidEntry[];
  watchers: number;
}

const MOCK_AUCTIONS: AuctionItem[] = [
  {
    id: 'au1',
    title: 'Haida Bentwood Box — Ancestral Crest',
    maker: 'Thunderbird Crafts',
    nation: 'Haida',
    image: 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?w=600&q=80',
    startingPrice: 200,
    currentBid: 340,
    reservePrice: 300,
    currency: 'INDI',
    endsAt: new Date(Date.now() + 1 * 60 * 60 * 1000 + 23 * 60 * 1000),
    isSacred: false,
    isVerified: true,
    watchers: 28,
    bidHistory: [
      { id: 'b1', bidder: 'NightSky_Collector', amount: 340, currency: 'INDI', timestamp: '2 min ago', isYou: false },
      { id: 'b2', bidder: 'PrairieWind', amount: 310, currency: 'INDI', timestamp: '8 min ago' },
      { id: 'b3', bidder: 'EarthTones22', amount: 280, currency: 'INDI', timestamp: '15 min ago' },
      { id: 'b4', bidder: 'SkyDancer', amount: 250, currency: 'INDI', timestamp: '31 min ago' },
    ],
  },
  {
    id: 'au2',
    title: 'Navajo Two-Grey-Hills Rug — Master Weave',
    maker: 'WeavingWoman',
    nation: 'Navajo',
    image: 'https://images.unsplash.com/photo-1605218427368-35b0f996d2e6?w=600&q=80',
    startingPrice: 500,
    currentBid: 720,
    reservePrice: 650,
    currency: 'INDI',
    endsAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
    isSacred: false,
    isVerified: true,
    watchers: 44,
    bidHistory: [
      { id: 'b1', bidder: 'You', amount: 720, currency: 'INDI', timestamp: '5 min ago', isYou: true },
      { id: 'b2', bidder: 'TurquoiseRiver', amount: 690, currency: 'INDI', timestamp: '12 min ago' },
      { id: 'b3', bidder: 'CedarSmoke', amount: 650, currency: 'INDI', timestamp: '25 min ago' },
    ],
  },
];

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(() => Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  return {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    expired: diff === 0,
    urgent: diff < 30 * 60 * 1000,
  };
}

function AuctionCard({ auction }: { auction: AuctionItem }) {
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 10);
  const [autoBidMax, setAutoBidMax] = useState('');
  const [bids, setBids] = useState<BidEntry[]>(auction.bidHistory);
  const [currentBid, setCurrentBid] = useState(auction.currentBid);
  const [showHistory, setShowHistory] = useState(false);
  const [bidStatus, setBidStatus] = useState<'idle' | 'placed' | 'outbid'>('idle');
  const [showAutoBid, setShowAutoBid] = useState(false);
  const time = useCountdown(auction.endsAt);

  const minBid = currentBid + 10;
  const reserveMet = currentBid >= auction.reservePrice;

  const placeBid = () => {
    if (bidAmount < minBid) return;
    const newBid: BidEntry = {
      id: `b${Date.now()}`,
      bidder: 'You',
      amount: bidAmount,
      currency: auction.currency,
      timestamp: 'just now',
      isYou: true,
    };
    setBids((prev) => [newBid, ...prev]);
    setCurrentBid(bidAmount);
    setBidAmount(bidAmount + 10);
    setBidStatus('placed');
    setTimeout(() => setBidStatus('idle'), 3000);
  };

  return (
    <div className={`bg-[#141414] rounded-2xl border overflow-hidden ${time.urgent ? 'border-[#DC143C]/40' : 'border-[#d4af37]/20'}`}>
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-64 flex-shrink-0 relative bg-[#0a0a0a]">
          <div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
            <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          {/* Live badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-[#DC143C] rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white text-xs font-bold">LIVE</span>
          </div>
          {auction.isSacred && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-[#DC143C]/80 rounded-full">
              <AlertTriangle size={10} className="text-white" />
              <span className="text-white text-[10px]">Sacred</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs">
            <Users size={12} />
            <span>{auction.watchers} watching</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full">{auction.nation}</span>
                {auction.isVerified && <CheckCircle size={13} className="text-[#d4af37]" />}
              </div>
              <h3 className="text-white font-bold text-base leading-snug">{auction.title}</h3>
              <p className="text-gray-400 text-sm">by {auction.maker}</p>
            </div>
            {/* Countdown */}
            <div className={`text-right flex-shrink-0 ml-4 px-3 py-2 rounded-xl ${time.urgent ? 'bg-[#DC143C]/10 border border-[#DC143C]/30' : 'bg-[#d4af37]/5 border border-[#d4af37]/20'}`}>
              <div className={`flex items-center gap-1 font-mono font-bold text-lg ${time.urgent ? 'text-[#DC143C]' : 'text-[#d4af37]'}`}>
                <Clock size={14} />
                {time.expired ? 'Ended' : `${time.h}h ${time.m}m ${time.s}s`}
              </div>
              <p className="text-gray-500 text-[10px] mt-0.5">remaining</p>
            </div>
          </div>

          {/* Bid info row */}
          <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-[#0a0a0a] rounded-xl">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Current Bid</p>
              <p className="text-[#d4af37] font-bold text-lg">{currentBid}</p>
              <p className="text-[#d4af37] text-xs">{auction.currency}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Starting</p>
              <p className="text-white font-semibold">{auction.startingPrice}</p>
              <p className="text-gray-500 text-xs">{auction.currency}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Reserve</p>
              <div className="flex items-center gap-1">
                {reserveMet ? <CheckCircle size={12} className="text-green-400" /> : <Shield size={12} className="text-gray-500" />}
                <span className={`font-semibold text-sm ${reserveMet ? 'text-green-400' : 'text-gray-400'}`}>
                  {reserveMet ? 'Met' : 'Not met'}
                </span>
              </div>
            </div>
          </div>

          {/* Bid input */}
          {!time.expired && (
            <div className="space-y-2 mb-3">
              {bidStatus === 'placed' && (
                <div className="flex items-center gap-2 p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                  <CheckCircle size={13} />
                  Bid placed! You&apos;re the highest bidder.
                </div>
              )}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-[#0a0a0a] border border-[#d4af37]/20 rounded-xl overflow-hidden focus-within:border-[#d4af37] transition-colors">
                  <button onClick={() => setBidAmount((v) => Math.max(minBid, v - 10))} className="px-3 py-2.5 text-gray-400 hover:text-white transition-colors">−</button>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    min={minBid}
                    className="flex-1 bg-transparent text-white text-sm text-center focus:outline-none"
                  />
                  <button onClick={() => setBidAmount((v) => v + 10)} className="px-3 py-2.5 text-gray-400 hover:text-white transition-colors">+</button>
                </div>
                <button
                  onClick={placeBid}
                  disabled={bidAmount < minBid}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#f4e4a6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Gavel size={14} />
                  Bid
                </button>
              </div>
              <p className="text-gray-600 text-xs">Min bid: {minBid} {auction.currency} · {bids.length} bids placed</p>

              {/* Quick bid suggestions */}
              <div className="flex gap-2">
                {[minBid, minBid + 20, minBid + 50].map((amt) => (
                  <button key={amt} onClick={() => setBidAmount(amt)}
                    className="px-2.5 py-1 bg-[#0a0a0a] border border-[#d4af37]/20 text-gray-400 text-xs rounded-lg hover:text-[#d4af37] hover:border-[#d4af37] transition-colors">
                    {amt}
                  </button>
                ))}
              </div>

              {/* Auto-bid toggle */}
              <div>
                <button onClick={() => setShowAutoBid((s) => !s)}
                  className="flex items-center gap-1.5 text-gray-500 text-xs hover:text-[#d4af37] transition-colors">
                  <Zap size={11} />
                  {showAutoBid ? 'Hide' : 'Set'} auto-bid
                  <TrendingUp size={11} />
                </button>
                {showAutoBid && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      value={autoBidMax}
                      onChange={(e) => setAutoBidMax(e.target.value)}
                      placeholder={`Max bid (e.g. ${currentBid + 100})`}
                      className="flex-1 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                    <button className="px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-medium rounded-lg hover:bg-[#d4af37]/20 transition-colors">
                      Enable
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bid history toggle */}
          <button onClick={() => setShowHistory((s) => !s)}
            className="flex items-center gap-1.5 text-gray-500 text-xs hover:text-gray-300 transition-colors">
            {showHistory ? <ChevronUp size={12} /> : <TrendingUp size={12} />}
            {showHistory ? 'Hide' : 'Show'} bid history ({bids.length})
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,55,0.2) transparent' }}>
              {bids.map((bid) => (
                <div key={bid.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${bid.isYou ? 'bg-[#d4af37]/10 border border-[#d4af37]/20' : 'bg-[#0a0a0a]'}`}>
                  <span className={`text-sm font-medium ${bid.isYou ? 'text-[#d4af37]' : 'text-white'}`}>{bid.bidder}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#d4af37] font-bold text-sm">{bid.amount} {bid.currency}</span>
                    <span className="text-gray-600 text-xs">{bid.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PhysicalAuctionSystem() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#DC143C]/10 flex items-center justify-center">
            <Gavel size={16} className="text-[#DC143C]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Live Auctions</h3>
            <p className="text-gray-500 text-xs">{MOCK_AUCTIONS.length} auctions ending soon · bid with INDI</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DC143C]/10 border border-[#DC143C]/20 text-[#DC143C] text-xs rounded-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C] animate-pulse" />
          Live Bidding Open
        </span>
      </div>

      {/* Auction cards */}
      {MOCK_AUCTIONS.map((auction) => (
        <AuctionCard key={auction.id} auction={auction} />
      ))}

      {/* Note */}
      <p className="text-gray-600 text-xs text-center">
        All bids are binding. Sacred items require cultural protocol confirmation. Winning bidder has 24h to complete payment.
      </p>
    </div>
  );
}
