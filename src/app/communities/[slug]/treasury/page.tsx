import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';
import { getTreasuryByCommunitySlug } from '@/app/lib/platformTreasury';
import { getCommunityEntityPresentation } from '@/app/lib/communityEntityPresentation';
import { getCommunityTreasuryRollups } from '@/app/lib/communityMarketplace';

export default async function CommunityTreasuryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [entity, treasuryData] = await Promise.all([getPlatformAccountBySlug(slug), getTreasuryByCommunitySlug(slug)]);
  if (!entity || !treasuryData) notFound();
  const presentation = await getCommunityEntityPresentation(entity.account, entity.members, entity.splitRules);
  const treasuryRollups = await getCommunityTreasuryRollups(slug);
  const storefrontGroups = presentation.storefrontItems.reduce<Record<string, typeof presentation.storefrontItems>>((acc, item) => {
    const key = item.splitRuleId || item.splitLabel || 'Unrouted community offers';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

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
            {treasuryRollups ? (
              <div className="rounded-[32px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.08),rgba(17,17,17,0.92))] p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Treasury rollups</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Live intent matched against real treasury flow</h2>
                <p className="mt-3 text-sm leading-7 text-white/66">
                  These rollups combine current storefront routing intent with actual split-distribution activity already recorded for this treasury.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'Live routed offers', value: treasuryRollups.summary.liveOfferCount.toString() },
                    { label: 'Projected gross intent', value: `$${treasuryRollups.summary.projectedGrossValue.toLocaleString()}` },
                    { label: 'Realized gross flow', value: `$${treasuryRollups.summary.realizedGrossValue.toLocaleString()}` },
                    { label: 'Realized treasury share', value: `$${treasuryRollups.summary.realizedTreasuryValue.toLocaleString()}` }
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4af37]">{metric.label}</p>
                      <p className="mt-2 text-xl font-semibold text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {treasuryRollups.rollups.map((rollup) => (
                    <div key={rollup.routingKey} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{rollup.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                            {rollup.liveOfferCount} live offers | {rollup.realizedOrderCount} realized orders | {rollup.ledgerEntries} ledger matches
                          </p>
                        </div>
                        <div className="grid gap-2 text-right text-xs text-white/62 sm:grid-cols-5 sm:text-left">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d4af37]">Projected</p>
                            <p className="mt-1 text-sm font-semibold text-white">${rollup.projectedGrossValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d4af37]">Realized gross</p>
                            <p className="mt-1 text-sm font-semibold text-white">${rollup.realizedGrossValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d4af37]">Treasury share</p>
                            <p className="mt-1 text-sm font-semibold text-white">${rollup.realizedTreasuryValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d4af37]">Sell-through</p>
                            <p className="mt-1 text-sm font-semibold text-white">{rollup.sellThroughRate}%</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d4af37]">Treasury capture</p>
                            <p className="mt-1 text-sm font-semibold text-white">{rollup.treasuryCaptureRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-[18px] border border-white/10 bg-[#111111] p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4af37]">Avg listed value</p>
                          <p className="mt-2 text-sm font-semibold text-white">${rollup.averageProjectedValue.toLocaleString()}</p>
                        </div>
                        <div className="rounded-[18px] border border-white/10 bg-[#111111] p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4af37]">Avg realized order</p>
                          <p className="mt-2 text-sm font-semibold text-white">${rollup.averageRealizedOrderValue.toLocaleString()}</p>
                        </div>
                        <div className="rounded-[18px] border border-white/10 bg-[#111111] p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4af37]">Routing quality</p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {rollup.sellThroughRate >= 100 ? 'High demand route' : rollup.sellThroughRate >= 50 ? 'Active route' : 'Build demand'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {treasuryRollups ? (
              <div className="rounded-[32px] border border-white/10 bg-[#111111] p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Storefront performance</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Which pillars are converting into treasury flow</h2>
                <p className="mt-3 text-sm leading-7 text-white/66">
                  This view keeps Phase 5 grounded in actual storefront behavior. We can see which community-owned pillars have listing depth, which ones are converting into sales activity, and where treasury capture is strongest.
                </p>
                <div className="mt-5 space-y-3">
                  {treasuryRollups.pillarPerformance.map((pillar) => (
                    <article key={pillar.pillarLabel} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{pillar.pillarLabel}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                            {pillar.liveOfferCount} live offers | {pillar.realizedOrderCount} realized orders
                          </p>
                        </div>
                        <div className="grid gap-2 text-right text-xs text-white/62 sm:grid-cols-4 sm:text-left">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d4af37]">Projected</p>
                            <p className="mt-1 text-sm font-semibold text-white">${pillar.projectedGrossValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d4af37]">Realized</p>
                            <p className="mt-1 text-sm font-semibold text-white">${pillar.realizedGrossValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d4af37]">Sell-through</p>
                            <p className="mt-1 text-sm font-semibold text-white">{pillar.sellThroughRate}%</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d4af37]">Treasury capture</p>
                            <p className="mt-1 text-sm font-semibold text-white">{pillar.treasuryCaptureRate}%</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[32px] border border-white/10 bg-[#111111] p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Routing preview</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Live storefront offers grouped by split rule</h2>
              <p className="mt-3 text-sm leading-7 text-white/66">
                This shows how published community offers are currently routed before any new sales land. It gives ops a treasury-first view of storefront intent, not just past ledger events.
              </p>
              <div className="mt-5 space-y-4">
                {Object.entries(storefrontGroups).map(([group, items]) => (
                  <div key={group} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{group}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d4af37]">{items.length} live storefront offers</p>
                      </div>
                      <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-xs text-[#f3ddb1]">
                        Routing preview
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="rounded-[18px] border border-white/10 bg-[#111111] p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">{item.title}</p>
                              <p className="mt-1 text-xs text-white/60">{item.pillarLabel} | {item.priceLabel}</p>
                            </div>
                            <Link href={item.href} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white hover:border-[#d4af37]/35">
                              Open offer detail
                            </Link>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/65">
                            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{item.status || 'Active'}</span>
                            {item.availabilityLabel ? <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{item.availabilityLabel}</span> : null}
                            {item.ownerProfileSlug ? <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">Owner: {item.ownerProfileSlug}</span> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
