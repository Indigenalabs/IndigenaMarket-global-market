import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';
import { getTreasuryByCommunitySlug } from '@/app/lib/platformTreasury';
import { getCommunityEntityPresentation } from '@/app/lib/communityEntityPresentation';

export default async function CommunityTreasuryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [entity, treasuryData] = await Promise.all([getPlatformAccountBySlug(slug), getTreasuryByCommunitySlug(slug)]);
  if (!entity || !treasuryData) notFound();
  const presentation = getCommunityEntityPresentation(entity.account, entity.members, entity.splitRules);

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[38px] border border-white/10 bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
          <div className="grid lg:grid-cols-[1.02fr,0.98fr]">
            <div className="relative min-h-[340px] overflow-hidden">
              <img src={presentation.banner} alt={entity.account.displayName} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.86))]" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#f3dfb1]">Treasury</p>
                <h1 className="mt-3 text-4xl font-semibold">{treasuryData.treasury.label}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                  Treasury is part of the entity surface, not a detached admin appendix. Support goals, merchandise, and split-aware sales all land here.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
              {[
                { label: 'Restricted balance', value: `$${treasuryData.treasury.restrictedBalance.toLocaleString()}` },
                { label: 'Unrestricted balance', value: `$${treasuryData.treasury.unrestrictedBalance.toLocaleString()}` },
                { label: 'Pending disbursement', value: `$${treasuryData.treasury.pendingDisbursementAmount.toLocaleString()}` },
                { label: 'Next disbursement', value: new Date(treasuryData.treasury.nextDisbursementDate).toLocaleDateString() }
              ].map((metric) => (
                <div key={metric.label} className="rounded-[24px] border border-white/10 bg-black/24 p-5">
                  <p className="text-sm text-white/58">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#d4af37]">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href={`/communities/${slug}`} className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:border-[#d4af37]/35">
            Entity page
          </Link>
          <Link href={`/communities/${slug}/store`} className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:border-[#d4af37]/35">
            Storefront
          </Link>
          <Link href={`/communities/${slug}/support`} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370]">
            Support goals
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-[#111111] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Ledger activity</p>
            <div className="mt-4 space-y-3">
              {treasuryData.ledger.map((entry) => (
                <article key={entry.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.counterparty}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d4af37]">{entry.type}</p>
                    </div>
                    <p className="text-lg font-semibold text-white">${entry.amount.toLocaleString()}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/64">{entry.note}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-[#111111] p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Featured support goals</p>
              <div className="mt-4 space-y-4">
                {presentation.supportGoals.map((goal) => (
                  <article key={goal.id} className="overflow-hidden rounded-[24px] border border-white/10 bg-black/22">
                    <div className="h-36 overflow-hidden">
                      <img src={goal.image} alt={goal.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-3 p-4">
                      <h3 className="text-xl font-semibold text-white">{goal.title}</h3>
                      <p className="text-sm leading-7 text-white/64">{goal.summary}</p>
                      <div className="flex items-center justify-between text-xs text-white/58">
                        <span>${goal.currentAmount.toLocaleString()} raised</span>
                        <span>${goal.targetAmount.toLocaleString()} target</span>
                      </div>
                      <Link href={goal.ctaHref} className="inline-flex rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                        {goal.ctaLabel}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#111111] p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Reporting note</p>
              <p className="mt-4 text-sm leading-7 text-white/66">{treasuryData.treasury.reportingNote}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
