'use client';

import { useState } from 'react';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

export default function LandFoodQuickPurchasePanel({
  productId,
  productTitle,
  price,
  currency,
}: {
  productId: string;
  productTitle: string;
  price: number;
  currency: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState('');

  const handleAddToCart = async () => {
    setBusy('cart');
    setStatus('');
    try {
      await requireWalletAction('add this land and food product to cart');
      setStatus(`Added ${quantity} x ${productTitle} to cart. Checkout lane is ready.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to add this product to cart.');
    } finally {
      setBusy('');
    }
  };

  const handleBuyNow = async () => {
    setBusy('buy');
    setStatus('');
    try {
      await requireWalletAction('buy this land and food product');
      setStatus(`Order created for ${quantity} x ${productTitle}. Checkout total starts at $${(price * quantity).toFixed(2)} ${currency}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to start checkout for this product.');
    } finally {
      setBusy('');
    }
  };

  return (
    <section className="rounded-2xl border border-[#d4af37]/20 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-wide text-[#d4af37]">Quick Purchase</p>
      <p className="mt-2 text-sm text-gray-300">
        Start with a cart action or open the direct checkout lane for product {productId}.
      </p>
      <div className="mt-3 max-w-36">
        <label className="text-xs text-gray-400">Quantity</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))}
          className="mt-1 w-full rounded-xl border border-[#d4af37]/20 bg-black/20 px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={busy === 'cart'}
          className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60"
        >
          {busy === 'cart' ? 'Adding...' : 'Add to Cart'}
        </button>
        <button
          type="button"
          onClick={() => void handleBuyNow()}
          disabled={busy === 'buy'}
          className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10 disabled:opacity-60"
        >
          {busy === 'buy' ? 'Opening Checkout...' : 'Buy Now'}
        </button>
      </div>
      {status ? <p className="mt-3 text-sm text-emerald-300">{status}</p> : null}
    </section>
  );
}
