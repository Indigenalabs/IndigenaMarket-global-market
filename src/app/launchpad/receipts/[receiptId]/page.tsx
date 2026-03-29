import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLaunchpadCampaignBySlug } from '@/app/lib/launchpad';
import { getLaunchpadReceiptById } from '@/app/lib/launchpadSupport';

export async function generateMetadata({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  return {
    title: `Launchpad Receipt ${receiptId} | Indigena Global Market`
  };
}

export default async function LaunchpadReceiptPage({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  const receipt = await getLaunchpadReceiptById(receiptId);
  if (!receipt) notFound();
  const campaign = getLaunchpadCampaignBySlug(receipt.campaignSlug);
  if (!campaign) notFound();

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="overflow-hidden rounded-[36px] border border-[#d4af37]/20 bg-[#111111] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
          <div className="grid lg:grid-cols-[1.05fr,0.95fr]">
            <div className="relative min-h-[320px] overflow-hidden">
              <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.76))]" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#f3dfb1]">Campaign receipt</p>
                <h1 className="mt-3 text-3xl font-semibold">{campaign.title}</h1>
                <p className="mt-2 text-sm text-white/70">{receipt.supporterName} backed this campaign as a {receipt.visibility} backer.</p>
              </div>
            </div>
            <div className="space-y-5 p-6 md:p-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Receipt id</p>
                <p className="mt-2 text-lg font-semibold text-white">{receipt.id}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-black/24 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Cadence</p>
                  <p className="mt-2 text-lg font-semibold text-white">{receipt.cadence === 'monthly' ? 'Monthly' : 'One-time'}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/24 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Tier</p>
                  <p className="mt-2 text-lg font-semibold text-white">{receipt.tierLabel}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/24 p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-white/72"><span>Sponsorship amount</span><span>${receipt.quote.subtotal.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between text-white/72"><span>Launchpad platform fee</span><span>${receipt.quote.platformFee.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between text-white/72"><span>Processor fee</span><span>${receipt.quote.processorFee.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 font-semibold text-white"><span>Total charged</span><span>${receipt.totalPaid.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between font-medium text-[#d4af37]"><span>Estimated beneficiary net</span><span>${receipt.quote.beneficiaryNet.toFixed(2)}</span></div>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/24 p-5 text-sm leading-7 text-white/70">
                <p>Your receipt has been recorded for {receipt.beneficiaryName}. {receipt.cadence === 'monthly' ? 'This support is marked as a recurring backing commitment in the Launchpad ledger.' : 'This support is marked as a one-time contribution in the Launchpad ledger.'}</p>
                {receipt.note ? <p className="mt-3 text-white/86">Note: “{receipt.note}”</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/launchpad/${receipt.campaignSlug}`} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370]">Back to campaign</Link>
                <Link href="/launchpad" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:border-[#d4af37]/35">Browse Launchpad</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
