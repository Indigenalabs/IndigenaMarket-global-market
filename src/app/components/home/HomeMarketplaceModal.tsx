'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { X, Gavel, ShoppingCart, HandCoins, CheckCircle2, ExternalLink } from 'lucide-react';

export interface HomeMarketplaceItem {
  id: string;
  title: string;
  creator: string;
  image: string;
  price: number;
  currency: string;
  description: string;
  artistHref?: string;
  detailHref?: string;
  collectionHref?: string;
  isAuction?: boolean;
  currentBid?: number;
  bidIncrement?: number;
  bidLabel?: string;
}

interface HomeMarketplaceModalProps {
  item: HomeMarketplaceItem | null;
  mode: 'details' | 'buy' | 'bid' | 'offer';
  isOpen: boolean;
  onClose: () => void;
}

export default function HomeMarketplaceModal({
  item,
  mode,
  isOpen,
  onClose
}: HomeMarketplaceModalProps) {
  const [submittedMessage, setSubmittedMessage] = useState('');
  const defaultBid = useMemo(() => {
    if (!item) return 0;
    return item.isAuction ? (item.currentBid || item.price) + (item.bidIncrement || 25) : item.price;
  }, [item]);
  const [offerAmount, setOfferAmount] = useState(defaultBid);

  useEffect(() => {
    setOfferAmount(defaultBid);
    setSubmittedMessage('');
  }, [defaultBid, item?.id, mode]);

  if (!isOpen || !item) return null;

  const actionMode = mode === 'details' ? (item.isAuction ? 'bid' : 'buy') : mode;
  const title =
    actionMode === 'offer'
      ? `Make an offer for ${item.title}`
      : actionMode === 'bid'
        ? `Place a bid on ${item.title}`
        : `Buy ${item.title}`;

  const handleSubmit = () => {
    if (actionMode === 'offer') {
      setSubmittedMessage(`Offer submitted for ${offerAmount} ${item.currency}. The creator will be notified.`);
      return;
    }
    if (actionMode === 'bid') {
      setSubmittedMessage(`Bid placed for ${offerAmount} ${item.currency}. You can continue to the auction page for live updates.`);
      return;
    }
    setSubmittedMessage(`${item.title} has been added to your purchase flow. Continue to the full listing when you're ready.`);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-[#111111] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white transition-colors hover:bg-black/70"
          aria-label="Close marketplace modal"
        >
          <X size={18} />
        </button>

        <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[320px] bg-[#0a0a0a]">
            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="mb-2 inline-flex rounded-full border border-[#d4af37]/30 bg-black/50 px-3 py-1 text-xs font-semibold text-[#d4af37] backdrop-blur-sm">
                {item.isAuction ? 'Live auction' : 'Featured on homepage'}
              </div>
              <h3 className="text-3xl font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-300">by {item.creator}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 md:p-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">Homepage action</p>
              <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
              <p className="mb-5 text-sm leading-relaxed text-gray-300">{item.description}</p>

              <div className="mb-5 grid gap-3 rounded-2xl border border-[#d4af37]/10 bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{item.isAuction ? 'Current bid' : 'Current price'}</span>
                  <span className="text-lg font-bold text-white">
                    {(item.isAuction ? item.currentBid || item.price : item.price).toFixed(2)} {item.currency}
                  </span>
                </div>
                {item.isAuction ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{item.bidLabel || 'Suggested increment'}</span>
                    <span className="text-sm font-medium text-[#d4af37]">+{item.bidIncrement || 25} {item.currency}</span>
                  </div>
                ) : null}
              </div>

              {(actionMode === 'offer' || actionMode === 'bid') && (
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {actionMode === 'offer' ? 'Offer amount' : 'Bid amount'}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={offerAmount}
                      onChange={(event) => setOfferAmount(Number(event.target.value))}
                      className="w-full rounded-2xl border border-[#d4af37]/20 bg-[#141414] px-4 py-3 text-white outline-none transition-colors focus:border-[#d4af37]"
                    />
                    <span className="rounded-xl border border-[#d4af37]/20 bg-[#141414] px-4 py-3 text-sm font-semibold text-[#d4af37]">
                      {item.currency}
                    </span>
                  </div>
                </div>
              )}

              {submittedMessage ? (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-100">
                  <CheckCircle2 size={18} className="mt-0.5 text-green-400" />
                  <span>{submittedMessage}</span>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold transition-colors ${
                    actionMode === 'offer'
                      ? 'bg-[#DC143C] text-white hover:bg-[#ef3158]'
                      : actionMode === 'bid'
                        ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
                        : 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
                  }`}
                >
                  {actionMode === 'offer' ? <HandCoins size={18} /> : actionMode === 'bid' ? <Gavel size={18} /> : <ShoppingCart size={18} />}
                  {actionMode === 'offer' ? 'Submit offer' : actionMode === 'bid' ? 'Place bid' : 'Start purchase'}
                </button>

                {actionMode !== 'offer' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedMessage('');
                      setOfferAmount(defaultBid);
                    }}
                    className="rounded-2xl border border-[#d4af37]/20 px-5 py-3 font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-[#d4af37]/10 pt-5">
              {item.detailHref ? (
                <Link
                  href={item.detailHref}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 px-4 py-2 text-sm text-white transition-colors hover:bg-[#d4af37]/10"
                >
                  View full listing
                  <ExternalLink size={14} />
                </Link>
              ) : null}
              {item.artistHref ? (
                <Link
                  href={item.artistHref}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 px-4 py-2 text-sm text-white transition-colors hover:bg-[#d4af37]/10"
                >
                  Visit artist
                  <ExternalLink size={14} />
                </Link>
              ) : null}
              {item.collectionHref ? (
                <Link
                  href={item.collectionHref}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 px-4 py-2 text-sm text-white transition-colors hover:bg-[#d4af37]/10"
                >
                  Open collection
                  <ExternalLink size={14} />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
