'use client';

import { useState } from 'react';
import { Send, Check, X, RotateCcw, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface OfferEntry {
  id: string;
  buyer: string;
  amount: number;
  currency: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  createdAt: string;
  counterOffer?: number;
}

interface OfferNegotiationProps {
  itemId: string;
  itemTitle: string;
  currentPrice: number;
  currency: string;
  makerName: string;
  isOwner?: boolean;
}

const STATUS_STYLES: Record<OfferEntry['status'], string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  countered: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  expired: 'bg-gray-600/20 text-gray-500 border-gray-600/30',
};

const mockOffers: OfferEntry[] = [
  { id: 'o1', buyer: 'NightSky_Collector', amount: 160, currency: 'INDI', message: 'Huge fan of your work. Would love to add this to my collection.', status: 'pending', createdAt: '2h ago' },
  { id: 'o2', buyer: 'EarthTones22', amount: 140, currency: 'INDI', status: 'countered', createdAt: '1d ago', counterOffer: 170 },
  { id: 'o3', buyer: 'PrairieWind', amount: 120, currency: 'INDI', status: 'rejected', createdAt: '3d ago' },
];

export default function OfferNegotiation({ currentPrice, currency, makerName, isOwner = false }: OfferNegotiationProps) {
  const [offers, setOffers] = useState<OfferEntry[]>(mockOffers);
  const [showMakeOffer, setShowMakeOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState(Math.floor(currentPrice * 0.9));
  const [offerMessage, setOfferMessage] = useState('');
  const [counteringId, setCounteringId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleMakeOffer = () => {
    if (offerAmount <= 0) return;
    const newOffer: OfferEntry = {
      id: `o${Date.now()}`,
      buyer: 'You',
      amount: offerAmount,
      currency,
      message: offerMessage || undefined,
      status: 'pending',
      createdAt: 'just now',
    };
    setOffers((prev) => [newOffer, ...prev]);
    setShowMakeOffer(false);
    setOfferMessage('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleAccept = (id: string) =>
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: 'accepted' } : o));

  const handleReject = (id: string) =>
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: 'rejected' } : o));

  const handleCounter = (id: string) => {
    if (counterAmount <= 0) return;
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: 'countered', counterOffer: counterAmount } : o));
    setCounteringId(null);
    setCounterAmount(0);
  };

  const pendingOffers = offers.filter((o) => o.status === 'pending');
  const historyOffers = offers.filter((o) => o.status !== 'pending');

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/10">
        <div>
          <h3 className="text-white font-semibold text-sm">Make an Offer</h3>
          <p className="text-gray-500 text-xs">Listed at <span className="text-[#d4af37] font-medium">{currentPrice} {currency}</span> · Offer directly to {makerName}</p>
        </div>
        {pendingOffers.length > 0 && (
          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
            {pendingOffers.length} pending
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Submitted feedback */}
        {submitted && (
          <div className="flex items-center gap-2 p-3 bg-green-600/10 border border-green-600/20 rounded-lg text-green-400 text-sm">
            <Check size={14} />
            Offer sent! The maker will respond within 24 hours.
          </div>
        )}

        {/* Make Offer toggle */}
        {!isOwner && !showMakeOffer && (
          <button
            onClick={() => setShowMakeOffer(true)}
            className="w-full py-2.5 border border-[#d4af37]/40 text-[#d4af37] font-medium rounded-xl text-sm hover:bg-[#d4af37]/10 transition-colors"
          >
            + Make an Offer
          </button>
        )}

        {/* Make Offer form */}
        {!isOwner && showMakeOffer && (
          <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#d4af37]/20 space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Your Offer ({currency})</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(Number(e.target.value))}
                  className="flex-1 bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                  min={1}
                  max={currentPrice}
                />
                <span className="text-gray-400 text-sm">{currency}</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[0.75, 0.85, 0.90, 0.95].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setOfferAmount(Math.floor(currentPrice * pct))}
                    className="text-xs px-2 py-1 bg-[#141414] border border-[#d4af37]/20 text-gray-400 rounded-lg hover:text-[#d4af37] hover:border-[#d4af37] transition-colors"
                  >
                    {Math.round(pct * 100)}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Message to Maker (optional)</label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Why this piece speaks to you, intended use..."
                rows={2}
                className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37] resize-none placeholder-gray-600"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowMakeOffer(false)} className="flex-1 py-2 text-gray-400 border border-white/10 rounded-lg text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleMakeOffer}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#d4af37] text-black font-semibold rounded-lg text-sm hover:bg-[#f4e4a6] transition-colors"
              >
                <Send size={13} />
                Send Offer
              </button>
            </div>
          </div>
        )}

        {/* Owner: pending offers */}
        {isOwner && pendingOffers.length > 0 && (
          <div className="space-y-2">
            {pendingOffers.map((offer) => (
              <div key={offer.id} className="bg-[#0a0a0a] rounded-xl p-3 border border-yellow-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-sm font-semibold">{offer.buyer}</span>
                  <span className="text-[#d4af37] font-bold">{offer.amount} {offer.currency}</span>
                </div>
                {offer.message && <p className="text-gray-400 text-xs mb-2 italic">&ldquo;{offer.message}&rdquo;</p>}
                <div className="flex items-center gap-1 mb-2">
                  <Clock size={10} className="text-gray-600" />
                  <span className="text-gray-600 text-xs">{offer.createdAt}</span>
                </div>
                {counteringId === offer.id ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(Number(e.target.value))}
                      placeholder="Counter amount"
                      className="flex-1 bg-[#141414] border border-[#d4af37]/20 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                    />
                    <button onClick={() => handleCounter(offer.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-colors">Send</button>
                    <button onClick={() => setCounteringId(null)} className="px-2 py-1.5 text-gray-500 hover:text-white transition-colors"><X size={12} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(offer.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600/80 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"><Check size={11} />Accept</button>
                    <button onClick={() => { setCounteringId(offer.id); setCounterAmount(Math.ceil(offer.amount * 1.05)); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600/80 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"><RotateCcw size={11} />Counter</button>
                    <button onClick={() => handleReject(offer.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-600/80 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"><X size={11} />Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* History toggle */}
        {historyOffers.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showHistory ? 'Hide' : 'Show'} offer history ({historyOffers.length})
          </button>
        )}

        {showHistory && (
          <div className="space-y-2">
            {historyOffers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-2.5 bg-[#0a0a0a] rounded-lg border border-white/5">
                <div>
                  <span className="text-gray-400 text-xs">{offer.buyer}</span>
                  {offer.counterOffer && <span className="text-gray-600 text-xs"> → counter: {offer.counterOffer} {offer.currency}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs font-medium">{offer.amount} {offer.currency}</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] ${STATUS_STYLES[offer.status]}`}>{offer.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
