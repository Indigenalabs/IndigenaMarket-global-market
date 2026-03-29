'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchMaterialsToolsOrderDetail, type MaterialsToolsOrderDetailResponse } from '@/app/lib/materialsToolsApi';

export default function OrderReceiptClient({ orderId }: { orderId: string }) {
  const [data, setData] = useState<MaterialsToolsOrderDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMaterialsToolsOrderDetail(orderId)
      .then((result) => {
        if (cancelled) return;
        setData(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unable to load the order receipt.');
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const payoutLabel = useMemo(() => {
    if (!data) return '';
    const amount = data.order.quantity * data.order.unitPrice;
    return `$${amount.toLocaleString()} ${data.order.currency}`;
  }, [data]);

  if (error) {
    return (
      <div className="rounded-[28px] border border-rose-400/30 bg-rose-500/10 p-6 text-sm text-rose-100">
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-sm text-[#d5cab8]">Loading receipt lane...</div>;
  }

  const { order, source } = data;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[32px] border border-[#9b6b2b]/25 bg-[#100d09] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#d4af37]">Materials receipt</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{order.productTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-[#d5cab8]">
                Order {order.id} tracks payment, fulfillment, and traceability through the sourcing lane.
              </p>
            </div>
            <div className="rounded-full border border-[#1d6b74]/35 bg-[#1d6b74]/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#9fe5ea]">
              {source === 'api' ? 'Live receipt' : 'Preview receipt'}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#bcae99]">Receipt ID</p>
              <p className="mt-2 text-lg font-semibold text-white">{order.receiptId || `receipt-${order.id}`}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#bcae99]">Paid amount</p>
              <p className="mt-2 text-lg font-semibold text-[#f4c766]">${(order.amountPaid || order.quantity * order.unitPrice).toLocaleString()} {order.currency}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#bcae99]">Supplier</p>
              <p className="mt-2 text-lg font-semibold text-white">{order.supplierName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#bcae99]">Created</p>
              <p className="mt-2 text-lg font-semibold text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.22em] text-[#bcae99]">Payment reference</p>
              <p className="mt-2 text-lg font-semibold text-white">{order.paymentIntentId || 'manual-preview-payment'}</p>
              {order.reconciledAt ? <p className="mt-2 text-sm text-[#d5cab8]">Reconciled {new Date(order.reconciledAt).toLocaleString()}</p> : null}
            </div>
          </div>
        </article>

        <article className="rounded-[32px] border border-[#1d6b74]/25 bg-[#0d1314] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Lane status</p>
          <div className="mt-5 space-y-3 text-sm text-[#d7f0f2]">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <span>Payment</span>
              <span className="text-[#f4c766]">{order.paymentStatus}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <span>Fulfillment</span>
              <span className="text-white">{order.fulfillmentStatus}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <span>Traceability</span>
              <span className="text-[#9fe5ea]">{order.traceabilityStatus}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <span>Estimated ship date</span>
              <span className="text-white">{order.estimatedShipDate}</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f0c96f]"
            >
              Print receipt
            </button>
            <Link
              href={`/materials-tools/origin/${order.productId}`}
              className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] transition hover:bg-[#1d6b74]/10"
            >
              Open origin record
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Commercial details</p>
          <div className="mt-4 space-y-3 text-sm text-[#d5cab8]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Quantity: {order.quantity} units</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Unit rate: ${order.unitPrice} {order.currency}</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Delivery mode: {order.deliveryMode}</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Receiving lane: {order.shippingRegion}</div>
          </div>
        </article>

        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Batch and protocol notes</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7f0f2]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              Batch lane is linked to the product origin record so the buyer can verify stewardship and proof documents.
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              Supplier note: {order.notes || 'No custom notes were attached to this run.'}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
