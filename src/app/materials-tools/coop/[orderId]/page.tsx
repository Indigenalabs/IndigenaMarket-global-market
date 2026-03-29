import Link from 'next/link';
import { notFound } from 'next/navigation';
import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import { CoopOrderCard } from '@/app/materials-tools/components/MaterialsToolsCards';
import MaterialsToolsActionPanel from '@/app/materials-tools/components/MaterialsToolsActionPanel';
import { coopCommitments, coopOrders, getCoopOrderById } from '@/app/materials-tools/data/pillar10Data';

export default async function CoopOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = getCoopOrderById(orderId);
  if (!order) notFound();
  const percent = Math.min(100, Math.round((order.committedUnits / order.targetUnits) * 100));
  const memberLedger = coopCommitments.filter((item) => item.orderId === order.id);

  return (
    <MaterialsToolsFrame title={order.title} subtitle={`Bulk order closes ${order.closeDate}`}>
      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="overflow-hidden rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09]">
          <img src={order.image} alt={order.title} className="h-[420px] w-full object-cover" />
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Co-op bulk order</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{order.title}</h2>
          <p className="mt-4 text-sm leading-7 text-[#d7f0f2]">{order.summary}</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between text-sm text-[#d7f0f2]">
              <span>{order.committedUnits} committed</span>
              <span>{order.targetUnits} target</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#1d6b74]" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#f4c766]">{percent}% joined</span>
              <span className="text-white">Closes {order.closeDate}</span>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">Collective demand lowers supplier MOQ friction and freight fragmentation.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">Commitments roll into invoice release, pooled dispatch, and local hub pickup windows.</div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Run milestones</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ['Commitment close', order.closeDate, 'Final headcount locks and the pooled supplier quote is released.'],
              ['Payment window', 'Within 72 hours', 'Members confirm units and settle the consolidated purchase.'],
              ['Shared dispatch', '7 days after close', 'Materials move through the regional freight lane and local hubs.']
            ].map(([label, date, copy]) => (
              <article key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{date}</p>
                <p className="mt-2 text-base font-semibold text-white">{label}</p>
                <p className="mt-3 text-sm leading-6 text-[#d5cab8]">{copy}</p>
              </article>
            ))}
          </div>
        </article>
        <MaterialsToolsActionPanel variant="coop-commit" title="Co-op order commitment" />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Invoice release', 'Once the commitment window closes, members receive a pooled quote and a 72-hour settlement window.'],
          ['Dispatch closeout', 'Freight bundles close only after paid commitments are matched against supplier release counts.'],
          ['Hub arrival', 'Regional hubs sign off on receipt before units are released into local pickup or onward shipment.']
        ].map(([label, copy]) => (
          <article key={label} className="rounded-[28px] border border-white/10 bg-black/20 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{label}</p>
            <p className="mt-3 text-sm leading-7 text-[#d5cab8]">{copy}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Paid-member ledger</p>
          <div className="mt-4 space-y-3">
            {memberLedger.length ? memberLedger.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{item.walletAddress}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.units} units • {item.contributionStatus}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#d7f0f2]">{item.dispatchStatus || 'not-started'}</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-[#d5cab8] md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">Invoice: {item.invoiceId || 'Pending release'}</div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">Window: {item.paymentWindow}</div>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d5cab8]">
                Paid-member ledger will populate once commitments convert into invoice-issued and settled lanes.
              </div>
            )}
          </div>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Invoice artifacts + dispatch closeout</p>
          <div className="mt-4 space-y-3">
            {memberLedger.slice(0, 3).map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-base font-semibold text-white">{item.invoiceId || 'Invoice pending'}</p>
                <p className="mt-2 text-sm text-[#d7f0f2]">{item.invoiceArtifactUrl || 'Invoice artifact becomes available when counts lock and pooled freight is priced.'}</p>
                <p className="mt-2 text-sm text-[#9fe5ea]">Dispatch: {item.dispatchStatus || 'not-started'}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {coopOrders.filter((item) => item.id !== order.id).slice(0, 3).map((item) => <CoopOrderCard key={item.id} item={item} />)}
      </section>

      <section className="flex flex-wrap gap-2">
        <Link href="/materials-tools/coop-dashboard" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">Open co-op dashboard</Link>
        <Link href="/materials-tools/bulk-coop" className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">Back to co-op</Link>
      </section>
    </MaterialsToolsFrame>
  );
}
