'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import {
  fetchMaterialsToolsSupplierDashboard,
  uploadMaterialsProofDocument,
  updateMaterialsListingStock,
  updateMaterialsOrderFulfillment,
  type MaterialsToolsSupplierDashboardResponse
} from '@/app/lib/materialsToolsApi';
import type { MaterialsToolsOrder } from '@/app/materials-tools/data/pillar10Data';

const FULFILLMENT_FLOW: MaterialsToolsOrder['fulfillmentStatus'][] = ['queued', 'packing', 'in-transit', 'delivered'];

function nextFulfillmentStatus(status: MaterialsToolsOrder['fulfillmentStatus']) {
  const currentIndex = FULFILLMENT_FLOW.indexOf(status);
  if (currentIndex === -1) return 'queued' as const;
  return FULFILLMENT_FLOW[Math.min(currentIndex + 1, FULFILLMENT_FLOW.length - 1)];
}

function stockUpdateConfig(stockLabel: string) {
  if (stockLabel === 'In Stock') {
    return {
      nextStockLabel: 'Low Stock',
      nextLeadTime: 'Replenishment in 10-14 days',
      buttonLabel: 'Mark low stock'
    };
  }
  return {
    nextStockLabel: 'In Stock',
    nextLeadTime: 'Ships in 4-7 days',
    buttonLabel: 'Restore in-stock'
  };
}

export default function SupplierDashboardClient({ supplierId = 'sup-1' }: { supplierId?: string }) {
  const [data, setData] = useState<MaterialsToolsSupplierDashboardResponse | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [proofDrafts, setProofDrafts] = useState<Record<string, string>>({});
  const [proofFiles, setProofFiles] = useState<Record<string, File | null>>({});
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const load = useCallback(async () => {
    const next = await fetchMaterialsToolsSupplierDashboard(supplierId);
    setData(next);
  }, [supplierId]);

  useEffect(() => {
    void load();
  }, [load]);

  const lowStockShare = useMemo(() => {
    if (!data || data.stats.activeListings === 0) return 0;
    return Math.round((data.stats.lowStock / data.stats.activeListings) * 100);
  }, [data]);

  const updateListing = async (productId: string, stockLabel: string, leadTime: string) => {
    setBusyKey(`listing:${productId}`);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('update supplier stock controls');
      await updateMaterialsListingStock({ productId, stockLabel, leadTime });
      await load();
      setStatus({
        type: 'success',
        message: `Listing ${productId} updated to ${stockLabel.toLowerCase()} with lead time "${leadTime}".`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update the listing state.'
      });
    } finally {
      setBusyKey(null);
    }
  };

  const updateOrder = async (orderId: string, fulfillmentStatus: MaterialsToolsOrder['fulfillmentStatus']) => {
    setBusyKey(`order:${orderId}`);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('advance supplier fulfillment');
      await updateMaterialsOrderFulfillment({ orderId, fulfillmentStatus });
      await load();
      setStatus({
        type: 'success',
        message: `Order ${orderId} moved into ${fulfillmentStatus.replace(/-/g, ' ')}.`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update the fulfillment lane.'
      });
    } finally {
      setBusyKey(null);
    }
  };

  const attachProof = async (productId: string) => {
    const label = (proofDrafts[productId] || '').trim();
    const file = proofFiles[productId];
    if (!label || !file) {
      setStatus({ type: 'error', message: 'Choose a file and add a proof-document label before attaching it to the listing.' });
      return;
    }
    setBusyKey(`proof:${productId}`);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('attach batch proof documents');
      await uploadMaterialsProofDocument({ productId, label, file });
      setProofDrafts((current) => ({ ...current, [productId]: '' }));
      setProofFiles((current) => ({ ...current, [productId]: null }));
      setStatus({
        type: 'success',
        message: `Proof document "${label}" uploaded and linked to listing ${productId}.`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to attach the proof document.'
      });
    } finally {
      setBusyKey(null);
    }
  };

  if (!data) {
    return <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 text-sm text-[#d5cab8]">Loading supplier control tower...</div>;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-5">
        {[
          ['Active listings', String(data.stats.activeListings)],
          ['Low stock lots', String(data.stats.lowStock)],
          ['Inbound orders', String(data.stats.inboundOrders)],
          ['Reorder-ready SKUs', String(data.stats.reorderReady)],
          ['Fulfillment score', String(data.stats.avgFulfillment)]
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#bcae99]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Listing health + lot readiness</h3>
            <span className="text-xs text-[#9fe5ea]">{data.source === 'api' ? 'Live inventory state' : 'Preview control tower'}</span>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">
            {lowStockShare}% of your active listings are in a replenishment state. Use the controls below to flip stock and lead-time messaging in the supply lane.
          </div>
          <div className="mt-4 space-y-3">
            {data.listingHealth.map((item) => {
              const config = stockUpdateConfig(item.stockLabel);
              const isBusy = busyKey === `listing:${item.id}`;
              return (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.stockLabel} • {item.leadTime}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#d5cab8]">{item.moqLabel || 'Flexible MOQ'}</span>
                      <span className="rounded-full border border-[#1d6b74]/35 px-3 py-1 text-xs text-[#9fe5ea]">{item.traceability.qrLabel}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void updateListing(item.id, config.nextStockLabel, config.nextLeadTime)}
                      className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f0c96f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? 'Saving...' : config.buttonLabel}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void updateListing(item.id, item.stockLabel, 'Ships in 14-21 days with permit review')}
                      className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] transition hover:bg-[#1d6b74]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Extend lead time
                    </button>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 md:flex-row">
                    <label className="rounded-full border border-white/10 px-4 py-2 text-sm text-[#d5cab8] hover:bg-white/5">
                      Choose proof file
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          setProofDrafts((current) => ({ ...current, [item.id]: file.name }));
                          setProofFiles((current) => ({ ...current, [item.id]: file }));
                        }}
                      />
                    </label>
                    <input
                      value={proofDrafts[item.id] || ''}
                      onChange={(event) => setProofDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                      placeholder="Attach permit note, QA card, harvest log, or chosen filename"
                      className="flex-1 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none focus:border-[#1d6b74]/45"
                    />
                    <button
                      type="button"
                      disabled={busyKey === `proof:${item.id}`}
                      onClick={() => void attachProof(item.id)}
                      className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#f4c766] transition hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyKey === `proof:${item.id}` ? 'Attaching...' : 'Attach proof doc'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8fd7dc]">Inbound commercial flow</h3>
          <div className="mt-4 space-y-3">
            {data.recentOrders.map((item) => {
              const nextStatus = nextFulfillmentStatus(item.fulfillmentStatus);
              const isBusy = busyKey === `order:${item.id}`;
              const isDelivered = item.fulfillmentStatus === 'delivered';
              return (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-base font-semibold text-white">{item.productTitle}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.quantity} units • {item.shippingRegion}</p>
                  <div className="mt-3 grid gap-2 text-sm text-[#d7f0f2]">
                    <div className="flex items-center justify-between"><span>Payment</span><span className="text-[#f4c766]">{item.paymentStatus}</span></div>
                    <div className="flex items-center justify-between"><span>Fulfillment</span><span className="text-white">{item.fulfillmentStatus}</span></div>
                    <div className="flex items-center justify-between"><span>Traceability</span><span className="text-[#9fe5ea]">{item.traceabilityStatus}</span></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy || isDelivered}
                      onClick={() => void updateOrder(item.id, nextStatus)}
                      className="rounded-full bg-[#8fd7dc] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#b9eef1] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? 'Updating...' : isDelivered ? 'Delivered' : `Move to ${nextStatus.replace(/-/g, ' ')}`}
                    </button>
                    <Link
                      href={`/materials-tools/orders/${item.id}`}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-[#d7f0f2] transition hover:bg-white/5"
                    >
                      Open receipt
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/materials-tools/orders" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">
              Review buyer lane
            </Link>
            <Link href={`/materials-tools/supplier/${data.supplier.id}`} className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">
              Open supplier profile
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Co-op demand entering your lane</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {data.inboundCoopDemand.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-base font-semibold text-white">{item.orderTitle}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.units} units • {item.freightLane}</p>
              <p className="mt-3 text-sm text-[#d5cab8]">{item.paymentWindow}</p>
            </article>
          ))}
        </div>
      </section>

      {status.type !== 'idle' ? (
        <div className={`rounded-2xl border p-4 text-sm ${status.type === 'success' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-400/30 bg-rose-500/10 text-rose-200'}`}>
          {status.message}
        </div>
      ) : null}
    </div>
  );
}
