import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHybridFundingReceiptById } from '@/app/lib/phase8HybridFunding';

export async function generateMetadata({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  return {
    title: `Seva Receipt ${receiptId} | Indigena Global Market`
  };
}

export default async function SevaReceiptPage({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  const receipt = await getHybridFundingReceiptById(receiptId);
  if (!receipt || receipt.source !== 'seva') notFound();

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[36px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(220,20,60,0.10),rgba(16,16,16,0.96)_35%,rgba(212,175,55,0.10))] p-8 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Seva donor receipt</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{receipt.sevaProjectTitle || receipt.beneficiaryLabel}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
            This contribution has been recorded in the Phase 8 hybrid funding layer so Seva, finance ops, and storefront reporting stay aligned.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Receipt id</p>
              <p className="mt-2 text-sm font-semibold text-white">{receipt.id}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Sacred fund lane</p>
              <p className="mt-2 text-base font-semibold text-white">{receipt.laneLabel}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Donor</p>
              <p className="mt-2 text-base font-semibold text-white">{receipt.supporterName}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,1fr]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Funding breakdown</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between text-white/72"><span>Donation amount</span><span>${receipt.amountGross.toFixed(2)}</span></div>
                <div className="flex items-center justify-between text-white/72"><span>Processor fee</span><span>${receipt.processorFee.toFixed(2)}</span></div>
                <div className="flex items-center justify-between text-white/72"><span>Service layer</span><span>${receipt.serviceFee.toFixed(2)}</span></div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 font-semibold text-white"><span>Net to project lane</span><span>${receipt.beneficiaryNet.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#d4af37]/18 bg-[linear-gradient(180deg,rgba(212,175,55,0.12),rgba(0,0,0,0.18))] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">What happens next</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/74">
                <p>The donation lands in the <span className="font-medium text-white">{receipt.laneLabel}</span> reporting lane.</p>
                <p>Operations can now reconcile the donation alongside Seva project admin, donor tools, and impact reporting work.</p>
                <p>The receipt stays visible for finance and impact review even before the first payout cycle closes.</p>
              </div>
            </div>
          </div>

          {receipt.note ? (
            <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-white/78">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Donor note</p>
              <p className="mt-2 leading-7">"{receipt.note}"</p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/seva" className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370]">Back to Seva</Link>
            {receipt.sevaProjectId ? (
              <Link href="/seva/requests" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:border-[#d4af37]/35">View requester updates</Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
