'use client';

import { useMemo, useState } from 'react';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import { saveMaterialsPurchasePlan, submitMaterialsOrder } from '@/app/lib/materialsToolsApi';
import { calculateTransactionQuote, formatMoney } from '@/app/lib/monetization';

export default function ProductOrderPanel({
  productId,
  leadTime,
  unitPrice
}: {
  productId: string;
  leadTime: string;
  unitPrice: number;
}) {
  const [quantity, setQuantity] = useState(3);
  const [shippingRegion, setShippingRegion] = useState('Regional studio delivery lane');
  const [deliveryMode, setDeliveryMode] = useState<'freight-consolidated' | 'studio-direct' | 'tool-hub-pickup'>('freight-consolidated');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const shippingFee = useMemo(() => {
    if (deliveryMode === 'studio-direct') return 32;
    if (deliveryMode === 'tool-hub-pickup') return 18;
    return 24;
  }, [deliveryMode]);
  const subtotal = useMemo(() => Math.max(1, quantity) * unitPrice, [quantity, unitPrice]);
  const quote = useMemo(
    () => calculateTransactionQuote({ pillar: 'materials-tools', subtotal, shippingFee }),
    [shippingFee, subtotal]
  );

  const submit = async () => {
    setSubmitting(true);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('place a materials order');
      const result = await submitMaterialsOrder({
        productId,
        quantity: Math.max(1, quantity),
        shippingRegion,
        deliveryMode,
        notes
      });
      const orderId = String(result?.order?.id || '').trim();
      setStatus({
        type: 'success',
        message: `Purchase plan converted into order ${orderId || 'request'}. Quote lane is now active and the first payment step can move in My Orders.`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to create the materials order.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const savePlan = async () => {
    try {
      await requireWalletAction('save a materials purchase plan');
      await saveMaterialsPurchasePlan({
        productId,
        quantity: Math.max(1, quantity),
        shippingRegion,
        deliveryMode,
        notes,
        quoteTotal: quote.buyerTotal
      });
      setStatus({
        type: 'success',
        message: 'Purchase plan saved locally so the studio can revisit the quote before checkout.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save the purchase plan.'
      });
    }
  };

  return (
    <section id="order-panel" className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Checkout lane</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">Turn this listing into a real order</h3>
      <p className="mt-3 text-sm leading-7 text-[#d5cab8]">
        Choose quantity, freight lane, and delivery mode so the supplier can price, batch-link, and queue fulfillment properly.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm text-[#d9c9b3]">
          <span>Quantity</span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value || 1))}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/45"
          />
        </label>
        <label className="space-y-2 text-sm text-[#d9c9b3]">
          <span>Delivery mode</span>
          <select
            value={deliveryMode}
            onChange={(event) => setDeliveryMode(event.target.value as typeof deliveryMode)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/45"
          >
            <option value="freight-consolidated">Freight consolidated</option>
            <option value="studio-direct">Studio direct</option>
            <option value="tool-hub-pickup">Tool hub pickup</option>
          </select>
        </label>
      </div>
      <label className="mt-3 block space-y-2 text-sm text-[#d9c9b3]">
        <span>Shipping or receiving lane</span>
        <input
          value={shippingRegion}
          onChange={(event) => setShippingRegion(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/45"
        />
      </label>
      <label className="mt-3 block space-y-2 text-sm text-[#d9c9b3]">
        <span>Batch notes or substitutions</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="Note any studio constraints, substitute-safe requests, or packing needs."
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/45"
        />
      </label>
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d9c9b3]">
        <div className="flex items-center justify-between">
          <span>Material subtotal</span>
          <span className="text-white">{formatMoney(quote.subtotal)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span>Freight and handling quote</span>
          <span className="text-white">{formatMoney(quote.shippingFee)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[#d9c9b3]">
          <span>Firekeeper fee (seller-funded)</span>
          <span className="text-white">{formatMoney(quote.platformFee)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="uppercase tracking-[0.22em] text-[#f4c766]">Estimated buyer total</span>
          <span className="text-lg font-semibold text-[#f4c766]">{formatMoney(quote.buyerTotal)}</span>
        </div>
        <p className="mt-3 text-xs leading-6 text-[#b8a893]">
          Supplier payout estimate: {formatMoney(quote.creatorNet)} after the {Math.round(quote.effectiveCreatorRate * 100)}% Firekeeper fee.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          className="rounded-full bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f0c96f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Building quote...' : 'Request Quote and Create Order'}
        </button>
        <button
          type="button"
          onClick={() => void savePlan()}
          className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          Save purchase plan
        </button>
        <div className="rounded-full border border-[#1d6b74]/30 bg-[#1d6b74]/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#9fe5ea]">
          Lead time: {leadTime}
        </div>
      </div>
      {status.type !== 'idle' ? (
        <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>{status.message}</p>
      ) : null}
    </section>
  );
}

