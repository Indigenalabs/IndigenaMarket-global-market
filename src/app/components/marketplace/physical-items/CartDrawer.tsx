'use client';

import { useMemo, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Package, Shield } from 'lucide-react';
import { PhysicalItem } from './ItemDetailModal';
import { calculateTransactionQuote, formatMoney } from '@/app/lib/monetization';
import { confirmPhysicalCheckoutOrder, createPhysicalCheckoutOrder } from '@/app/lib/physicalItemsApi';

export interface CartEntry {
  item: PhysicalItem;
  quantity: number;
  variant?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: CartEntry[];
  onUpdateQty: (itemId: string, qty: number) => void;
  onRemove: (itemId: string) => void;
}

export default function CartDrawer({ isOpen, onClose, entries, onUpdateQty, onRemove }: CartDrawerProps) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const quote = useMemo(() => {
    const subtotal = entries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
    return calculateTransactionQuote({
      pillar: 'physical-items',
      subtotal,
      includePhysicalProtection: entries.length > 0
    });
  }, [entries]);

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError('');
    try {
      const payload = {
        entries: entries.map((entry) => ({
          itemId: entry.item.id,
          title: entry.item.title,
          quantity: entry.quantity,
          price: entry.item.price,
          image: entry.item.images[0],
          maker: entry.item.maker,
          nation: entry.item.nation,
          variant: entry.variant
        })),
        currency: 'INDI'
      };
      const checkout = await createPhysicalCheckoutOrder(payload);
      const orderId = String(checkout?.order?.orderId || checkout?.order?.id || '').trim();
      if (orderId) {
        await confirmPhysicalCheckoutOrder({
          orderId,
          amountPaid: quote.buyerTotal,
          paymentBreakdown: checkout?.feeBreakdown || quote
        });
      }
      setCheckingOut(false);
      setCheckedOut(true);
    } catch (error) {
      setCheckingOut(false);
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm animate-in slide-in-from-right flex-col border-l border-[#d4af37]/20 bg-[#0a0a0a] shadow-2xl shadow-black/50 duration-300">
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#d4af37]" />
            <h2 className="text-lg font-bold text-white">Your Cart</h2>
            {entries.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-black">
                {entries.reduce((sum, entry) => sum + entry.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {checkedOut ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
              <Package size={28} className="text-green-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Order placed</h3>
            <p className="mb-2 text-sm text-gray-400">Your order has been submitted for fulfillment.</p>
            <p className="mb-6 text-xs text-gray-500">The buyer total shows protection and handling. The Firekeeper fee comes out of the seller payout separately.</p>
            <button onClick={() => { setCheckedOut(false); onClose(); }} className="rounded-xl bg-[#d4af37] px-6 py-2.5 font-semibold text-black transition-colors hover:bg-[#f4e4a6]">
              Continue Shopping
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <ShoppingBag size={48} className="mb-4 text-gray-700" />
            <p className="mb-1 font-semibold text-white">Your cart is empty</p>
            <p className="text-sm text-gray-500">Add handcrafted items from the marketplace</p>
          </div>
        ) : (
          <>
            <div className="scrollbar-thumb-[#d4af37]/30 flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-track-transparent p-3">
              {entries.map((entry) => (
                <div key={entry.item.id} className="flex gap-2 rounded-lg border border-[#d4af37]/10 bg-[#141414] p-2">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <img src={entry.item.images[0]} alt={entry.item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-white">{entry.item.title}</p>
                    <p className="mb-1 text-xs text-gray-500">by {entry.item.maker} · {entry.item.nation}</p>
                    {entry.variant && <span className="rounded bg-[#d4af37]/10 px-1.5 py-0.5 text-[10px] text-[#d4af37]">{entry.variant}</span>}
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => entry.quantity > 1 ? onUpdateQty(entry.item.id, entry.quantity - 1) : onRemove(entry.item.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#0a0a0a] text-gray-400 transition-colors hover:border-[#d4af37] hover:text-white"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-5 text-center text-sm text-white">{entry.quantity}</span>
                        <button
                          onClick={() => entry.quantity < entry.item.stockCount ? onUpdateQty(entry.item.id, entry.quantity + 1) : undefined}
                          disabled={entry.quantity >= entry.item.stockCount}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#0a0a0a] text-gray-400 transition-colors hover:border-[#d4af37] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#d4af37]">{formatMoney(entry.item.price * entry.quantity, 'INDI')}</span>
                    </div>
                  </div>
                  <button onClick={() => onRemove(entry.item.id)} className="mt-1 flex-shrink-0 text-gray-600 transition-colors hover:text-[#DC143C]">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-[#d4af37]/20 p-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({entries.reduce((sum, entry) => sum + entry.quantity, 0)} items)</span>
                  <span>{formatMoney(quote.subtotal, 'INDI')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Protection + handling</span>
                  <span>{formatMoney(quote.buyerServiceFee, 'INDI')}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Firekeeper fee (seller-funded)</span>
                  <span>{formatMoney(quote.platformFee, 'INDI')}</span>
                </div>
                <div className="flex justify-between border-t border-[#d4af37]/10 pt-1 text-base font-bold text-white">
                  <span>Buyer total</span>
                  <span className="text-[#d4af37]">{formatMoney(quote.buyerTotal, 'INDI')}</span>
                </div>
              </div>

              <div className="rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 p-2">
                <div className="flex items-start gap-2">
                  <Shield size={12} className="mt-0.5 flex-shrink-0 text-[#d4af37]" />
                  <p className="text-[10px] leading-relaxed text-gray-400">
                    Maker payout estimate: {formatMoney(quote.creatorNet, 'INDI')} after the {Math.round(quote.effectiveCreatorRate * 100)}% Firekeeper fee. Buyer service covers handling and protection.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941f] py-2.5 text-sm font-bold text-black transition-all hover:shadow-lg hover:shadow-[#d4af37]/30 disabled:opacity-70"
              >
                {checkingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Proceed to checkout
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>

              {checkoutError ? <p className="text-center text-[11px] text-red-400">{checkoutError}</p> : null}

              <p className="text-center text-[10px] text-gray-600">Secured by XRPL · Fee breakdown shown before payout</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

