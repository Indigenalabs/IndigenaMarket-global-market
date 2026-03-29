'use client';

import { useState } from 'react';
import { Send, Check, X, RotateCcw, Clock, History } from 'lucide-react';

interface Offer {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  buyer: string;
  amount: number;
  currency: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered';
  createdAt: string;
  expiresAt: string;
  counterOffer?: number;
}

interface OfferSystemProps {
  artworkId?: string;
  artworkTitle?: string;
  currentPrice: number;
  currency: string;
  isOwner: boolean;
  offers?: Offer[];
  onMakeOffer: (amount: number, message: string) => void;
  onAcceptOffer: (offerId: string) => void;
  onRejectOffer: (offerId: string) => void;
  onCounterOffer: (offerId: string, amount: number) => void;
}

export default function OfferSystem({
  currentPrice,
  currency,
  isOwner,
  offers = [],
  onMakeOffer,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer
}: OfferSystemProps) {
  const [showMakeOffer, setShowMakeOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState(Math.floor(currentPrice * 0.9));
  const [offerMessage, setOfferMessage] = useState('');
  const [counteringId, setCounteringId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const handleMakeOffer = () => {
    if (offerAmount > 0) {
      onMakeOffer(offerAmount, offerMessage);
      setShowMakeOffer(false);
      setOfferMessage('');
    }
  };

  const handleCounter = (offerId: string) => {
    if (counterAmount > 0) {
      onCounterOffer(offerId, counterAmount);
      setCounteringId(null);
      setCounterAmount(0);
    }
  };

  const getStatusColor = (status: Offer['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'accepted': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      case 'expired': return 'text-gray-400 bg-gray-400/10';
      case 'countered': return 'text-[#d4af37] bg-[#d4af37]/10';
    }
  };

  const pendingOffers = offers.filter(o => o.status === 'pending');
  const offerHistory = offers.filter(o => o.status !== 'pending');

  return (
    <div className="space-y-4">

      {/* Buyer: Make Offer */}
      {!isOwner && (
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-4">
          {!showMakeOffer ? (
            <button
              onClick={() => setShowMakeOffer(true)}
              className="w-full py-3 bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg text-[#d4af37] font-semibold hover:bg-[#d4af37]/10 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Make an Offer
            </button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Make an Offer</h3>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Offer Amount ({currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                    placeholder="Enter offer amount"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {currency}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Current price: {currentPrice} {currency}
                </p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] h-20 resize-none"
                  placeholder="Add a message to the seller..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMakeOffer(false)}
                  className="flex-1 py-2 bg-[#0a0a0a] text-gray-400 rounded-lg hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMakeOffer}
                  className="flex-1 py-2 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
                >
                  Submit Offer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Owner: Pending Offers */}
      {isOwner && pendingOffers.length > 0 && (
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
          <div className="p-4 border-b border-[#d4af37]/10">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Clock size={18} className="text-[#d4af37]" />
              Pending Offers ({pendingOffers.length})
            </h3>
          </div>
          <div className="divide-y divide-[#d4af37]/10">
            {pendingOffers.map((offer) => (
              <div key={offer.id} className="p-4 space-y-3">
                {/* Offer Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#d4af37] font-bold text-sm">
                      {offer.buyer.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{offer.buyer}</p>
                    <p className="text-xs text-gray-500">{offer.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#d4af37] font-bold">{offer.amount} {offer.currency}</p>
                    <p className="text-gray-500 text-xs">
                      {Math.round((offer.amount / currentPrice) * 100)}% of asking
                    </p>
                  </div>
                </div>

                {offer.message && (
                  <p className="text-gray-400 text-sm italic bg-[#0a0a0a] rounded-lg p-3">
                    &ldquo;{offer.message}&rdquo;
                  </p>
                )}

                {/* Offer Expiry */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>Expires: {offer.expiresAt}</span>
                </div>

                {/* Actions */}
                {counteringId === offer.id ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="number"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(Number(e.target.value))}
                        className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                        placeholder="Counter offer amount"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCounteringId(null)}
                        className="flex-1 py-2 bg-[#0a0a0a] text-gray-400 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCounter(offer.id)}
                        className="flex-1 py-2 bg-[#d4af37] text-black font-semibold rounded-lg text-sm"
                      >
                        Send Counter
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAcceptOffer(offer.id)}
                      className="flex-1 py-2 bg-green-500/20 text-green-400 font-medium rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                      <Check size={14} />
                      Accept
                    </button>
                    <button
                      onClick={() => { setCounteringId(offer.id); setCounterAmount(Math.ceil(offer.amount * 1.1)); }}
                      className="flex-1 py-2 bg-[#d4af37]/10 text-[#d4af37] font-medium rounded-lg hover:bg-[#d4af37]/20 transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                      <RotateCcw size={14} />
                      Counter
                    </button>
                    <button
                      onClick={() => onRejectOffer(offer.id)}
                      className="flex-1 py-2 bg-red-500/10 text-red-400 font-medium rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                      <X size={14} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Pending Offers for Owner */}
      {isOwner && pendingOffers.length === 0 && (
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-6 text-center">
          <Send size={28} className="text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No pending offers</p>
        </div>
      )}

      {/* Offer History */}
      {offerHistory.length > 0 && (
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
          >
            <h3 className="text-white font-semibold flex items-center gap-2">
              <History size={18} className="text-gray-400" />
              Offer History ({offerHistory.length})
            </h3>
            <span className="text-gray-400 text-sm">{showHistory ? 'Hide' : 'Show'}</span>
          </button>
          {showHistory && (
            <div className="divide-y divide-[#d4af37]/10">
              {offerHistory.map((offer) => (
                <div key={offer.id} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0a0a0a] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 font-bold text-xs">
                      {offer.buyer.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{offer.buyer}</p>
                    <p className="text-gray-500 text-xs">{offer.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{offer.amount} {offer.currency}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(offer.status)}`}>
                      {offer.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
