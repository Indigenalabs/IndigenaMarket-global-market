'use client';

import { useState, useEffect } from 'react';
import { Gavel, Clock, TrendingUp, Users, History, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface Bid {
  id: string;
  bidder: string;
  amount: number;
  currency: string;
  timestamp: string;
  isCurrent: boolean;
}

interface AuctionSystemProps {
  artworkId: string;
  startingPrice: number;
  currentBid: number;
  currency: string;
  auctionEndTime: Date;
  reservePrice?: number;
  bidHistory?: Bid[];
  onPlaceBid: (amount: number) => void;
  onSetAutoBid?: (maxAmount: number) => void;
}

export default function AuctionSystem({
  artworkId,
  startingPrice,
  currentBid,
  currency,
  auctionEndTime,
  reservePrice,
  bidHistory = [],
  onPlaceBid,
  onSetAutoBid
}: AuctionSystemProps) {
  const [bidAmount, setBidAmount] = useState(currentBid + 10);
  const [autoBidMax, setAutoBidMax] = useState(0);
  const [showAutoBid, setShowAutoBid] = useState(false);
  const calculateInitialTimeLeft = () => {
    const diff = auctionEndTime.getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateInitialTimeLeft);
  const [activeTab, setActiveTab] = useState<'bid' | 'history'>('bid');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = auctionEndTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionEndTime]);

  const minBidIncrement = currentBid * 0.05; // 5% minimum increment
  const minBid = currentBid + minBidIncrement;

  const handleBid = () => {
    if (bidAmount < minBid) {
      alert(`Minimum bid is ${minBid.toFixed(2)} ${currency}`);
      return;
    }
    onPlaceBid(bidAmount);
  };

  const quickBidAmounts = [
    currentBid + minBidIncrement,
    currentBid + (minBidIncrement * 2),
    currentBid + (minBidIncrement * 5)
  ];

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#DC143C]/20 to-[#d4af37]/10 border-b border-[#d4af37]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel size={20} className="text-[#DC143C]" />
            <span className="text-white font-semibold">Live Auction</span>
          </div>
          <div className="flex items-center gap-2 text-[#DC143C]">
            <Clock size={16} />
            <span className="font-mono font-bold">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Current Bid Display */}
      <div className="p-6 text-center border-b border-[#d4af37]/10">
        <p className="text-gray-400 text-sm mb-1">Current Bid</p>
        <p className="text-4xl font-bold text-[#d4af37]">{currentBid} {currency}</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-sm">
          <span className="text-gray-400">Starting: {startingPrice} {currency}</span>
          {reservePrice && (
            <span className="text-gray-400">Reserve: {reservePrice} {currency}</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#d4af37]/10">
        <button
          onClick={() => setActiveTab('bid')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'bid' 
              ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Place Bid
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history' 
              ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Bid History ({bidHistory.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'bid' && (
          <div className="space-y-4">
            {/* Quick Bid Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {quickBidAmounts.map((amount, idx) => (
                <button
                  key={idx}
                  onClick={() => setBidAmount(Math.round(amount))}
                  className="py-2 bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-sm font-medium hover:bg-[#d4af37]/10 transition-colors"
                >
                  +{((amount - currentBid) / currentBid * 100).toFixed(0)}%
                  <br />
                  <span className="text-xs">{Math.round(amount)} {currency}</span>
                </button>
              ))}
            </div>

            {/* Bid Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                  placeholder="Enter bid amount"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {currency}
                </span>
              </div>
              <div className="flex flex-col">
                <button 
                  onClick={() => setBidAmount(bidAmount + minBidIncrement)}
                  className="px-3 py-1 bg-[#0a0a0a] border border-[#d4af37]/30 rounded-t-lg text-[#d4af37] hover:bg-[#d4af37]/10"
                >
                  <ChevronUp size={16} />
                </button>
                <button 
                  onClick={() => setBidAmount(Math.max(minBid, bidAmount - minBidIncrement))}
                  className="px-3 py-1 bg-[#0a0a0a] border border-t-0 border-[#d4af37]/30 rounded-b-lg text-[#d4af37] hover:bg-[#d4af37]/10"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            <p className="text-gray-500 text-xs text-center">
              Minimum bid: {minBid.toFixed(2)} {currency} ({(minBidIncrement / currentBid * 100).toFixed(0)}% increment)
            </p>

            {/* Place Bid Button */}
            <button 
              onClick={handleBid}
              className="w-full py-3 bg-[#DC143C] text-white font-semibold rounded-lg hover:bg-[#ff1a1a] transition-colors flex items-center justify-center gap-2"
            >
              <Gavel size={18} />
              Place Bid
            </button>

            {/* Auto-bid Toggle */}
            <button 
              onClick={() => setShowAutoBid(!showAutoBid)}
              className="w-full py-2 text-[#d4af37] text-sm hover:underline"
            >
              {showAutoBid ? 'Hide' : 'Set'} Auto-Bid
            </button>

            {showAutoBid && (
              <div className="p-3 bg-[#0a0a0a] rounded-lg space-y-2">
                <p className="text-gray-400 text-xs">Set maximum auto-bid amount</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={autoBidMax}
                    onChange={(e) => setAutoBidMax(Number(e.target.value))}
                    className="flex-1 bg-[#141414] border border-[#d4af37]/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                    placeholder="Max bid amount"
                  />
                  <button 
                    onClick={() => onSetAutoBid?.(autoBidMax)}
                    className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] text-sm font-medium rounded-lg hover:bg-[#d4af37]/20"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-[#0a0a0a] rounded-lg">
              <AlertCircle size={16} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
              <p className="text-gray-400 text-xs">
                Your bid must be at least 5% higher than the current bid. 
                If outbid, funds are automatically returned to your wallet.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bidHistory.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No bids yet. Be the first!</p>
            ) : (
              bidHistory.map((bid, idx) => (
                <div 
                  key={bid.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    bid.isCurrent ? 'bg-[#d4af37]/10 border border-[#d4af37]/30' : 'bg-[#0a0a0a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#141414] rounded-full flex items-center justify-center text-gray-400 text-xs">
                      #{bidHistory.length - idx}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{bid.bidder}</p>
                      <p className="text-gray-500 text-xs">{bid.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${bid.isCurrent ? 'text-[#d4af37]' : 'text-white'}`}>
                      {bid.amount} {bid.currency}
                    </p>
                    {bid.isCurrent && (
                      <span className="text-[#d4af37] text-xs">Current Leader</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 bg-[#0a0a0a] border-t border-[#d4af37]/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
              <Users size={12} />
              Bidders
            </div>
            <p className="text-white font-semibold">{bidHistory.length}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
              <TrendingUp size={12} />
              Volume
            </div>
            <p className="text-white font-semibold">{currentBid} {currency}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
              <History size={12} />
              Bids
            </div>
            <p className="text-white font-semibold">{bidHistory.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
