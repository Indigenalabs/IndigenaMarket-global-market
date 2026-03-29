'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import {
  confirmMaterialsOrderPayment,
  fetchMaterialsToolsOrders,
  type MaterialsToolsOrdersResponse
} from '@/app/lib/materialsToolsApi';

export default function OrdersClient() {
  const [data, setData] = useState<MaterialsToolsOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workingId, setWorkingId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchMaterialsToolsOrders();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load purchase records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pay = async (orderId: string, paymentAction: 'deposit' | 'settle', amountPaid: number) => {
    setWorkingId(orderId);
    setSuccess('');
    try {
      await requireWalletAction(paymentAction === 'settle' ? 'settle a materials order' : 'pay an order deposit');
      await confirmMaterialsOrderPayment({ orderId, paymentAction, amountPaid });
      await load();
      setSuccess(
        paymentAction === 'settle'
          ? `Payment lane updated. Order ${orderId} is now settled and moving into packing.`
          : `Payment lane updated. Deposit captured for order ${orderId}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process payment.');
    } finally {
      setWorkingId('');
    }
  };

  return (
    <div className="space-y-4">
      {loading ? <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 text-sm text-[#d5cab8]">Loading purchase ledger...</div> : null}
      {!loading && error ? (
        <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
          <p className="text-sm text-rose-300">{error}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void requireWalletAction('view your materials order history').then(() => load())}
              className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]"
            >
              Connect wallet
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}
      {!loading && success ? (
        <section className="rounded-[28px] border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-200">
          {success}
        </section>
      ) : null}
      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            {[
              ['Open orders', String(data.items.filter((item) => item.fulfillmentStatus !== 'delivered').length)],
              ['Tool bookings', String(data.bookings.length)],
              ['Reorder ready', String(data.items.filter((item) => item.reorderReady).length)],
              ['Tracked records', String(data.items.length + data.bookings.length)]
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#bcae99]">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Purchase ledger</h3>
              <span className="text-xs text-[#9fe5ea]">{data.source === 'api' ? 'Live records' : 'Preview records'}</span>
            </div>
            <div className="mt-4 space-y-3">
              {data.items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">{item.productTitle}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.supplierName} • {item.shippingRegion}</p>
                      <p className="mt-3 text-sm leading-7 text-[#d5cab8]">{item.notes}</p>
                    </div>
                    <div className="grid gap-2 text-sm text-[#d5cab8] md:min-w-[260px]">
                      <div className="flex items-center justify-between"><span>Quantity</span><span className="text-white">{item.quantity}</span></div>
                      <div className="flex items-center justify-between"><span>Payment</span><span className="text-[#f4c766]">{item.paymentStatus}</span></div>
                      <div className="flex items-center justify-between"><span>Fulfillment</span><span className="text-white">{item.fulfillmentStatus}</span></div>
                      <div className="flex items-center justify-between"><span>Traceability</span><span className="text-[#9fe5ea]">{item.traceabilityStatus}</span></div>
                      <div className="flex items-center justify-between"><span>Estimated ship</span><span className="text-white">{item.estimatedShipDate}</span></div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/materials-tools/product/${item.productId}`} className="rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 px-4 py-2 text-sm text-[#f2cb7d] hover:bg-[#d4af37]/18">
                      View listing
                    </Link>
                    <Link href={`/materials-tools/origin/${item.productId}`} className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">
                      Origin story
                    </Link>
                    {item.receiptId ? (
                      <Link href={`/materials-tools/orders/${item.id}`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-[#ddd0be] hover:bg-white/5">
                        View receipt
                      </Link>
                    ) : null}
                    {item.paymentStatus === 'quoted' || item.paymentStatus === 'intent-created' ? (
                      <button
                        type="button"
                        onClick={() => void pay(item.id, 'deposit', item.unitPrice * item.quantity * 0.35)}
                        disabled={workingId === item.id}
                        className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f] disabled:opacity-60"
                      >
                        {workingId === item.id ? 'Processing...' : 'Pay deposit'}
                      </button>
                    ) : null}
                    {item.paymentStatus === 'deposit-captured' ? (
                      <button
                        type="button"
                        onClick={() => void pay(item.id, 'settle', item.unitPrice * item.quantity)}
                        disabled={workingId === item.id}
                        className="rounded-full bg-[#1d6b74] px-4 py-2 text-sm font-semibold text-white hover:bg-[#267f89] disabled:opacity-60"
                      >
                        {workingId === item.id ? 'Processing...' : 'Settle balance'}
                      </button>
                    ) : null}
                    {item.paymentStatus === 'processing' ? (
                      <span className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea]">
                        Processor reconciliation in progress
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8fd7dc]">Tool-library bookings</h3>
            <div className="mt-4 space-y-3">
              {data.bookings.map((booking) => (
                <article key={booking.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">{booking.rentalTitle}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{booking.hubName} • {booking.bookingDate}</p>
                      <p className="mt-3 text-sm leading-7 text-[#d7f0f2]">{booking.returnProtocol}</p>
                    </div>
                    <div className="grid gap-2 text-sm text-[#d7f0f2] md:min-w-[240px]">
                      <div className="flex items-center justify-between"><span>Session</span><span className="text-white">{booking.sessionWindow}</span></div>
                      <div className="flex items-center justify-between"><span>Deposit</span><span className="text-[#f4c766]">{booking.depositLabel}</span></div>
                      <div className="flex items-center justify-between"><span>Status</span><span className="text-white">{booking.accessStatus}</span></div>
                      <div className="flex items-center justify-between"><span>Condition</span><span className="text-white">{booking.conditionStatus || 'not-started'}</span></div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
