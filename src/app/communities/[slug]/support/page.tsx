import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';
import { getCommunityEntityPresentation } from '@/app/lib/communityEntityPresentation';

export default async function CommunitySupportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPlatformAccountBySlug(slug);
  if (!data) notFound();
  const presentation = await getCommunityEntityPresentation(data.account, data.members, data.splitRules);

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[38px] border border-white/10 bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
          <div className="grid lg:grid-cols-[1.03fr,0.97fr]">
            <div className="relative min-h-[320px] overflow-hidden">
              <img src={presentation.banner} alt={data.account.displayName} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.84))]" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#f3dfb1]">Support this entity</p>
                <h1 className="mt-3 text-4xl font-semibold">{data.account.displayName}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                  Support should feel like backing a living institution with visible goals, named representatives, and a treasury route that belongs to the entity.
                </p>
              </div>
            </div>
            <div className="space-y-4 p-6 md:p-8">
              <div className="rounded-[24px] border border-white/10 bg-black/24 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Treasury destination</p>
                <p className="mt-3 text-xl font-semibold text-white">{data.account.treasuryLabel}</p>
                <p className="mt-2 text-sm leading-7 text-white/68">{data.account.payoutWallet || 'Pending treasury wallet review'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href={`/communities/${slug}/treasury`} className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white hover:border-[#d4af37]/35">
                  View treasury
                </Link>
                <Link href={`/communities/${slug}/store`} className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white hover:border-[#d4af37]/35">
                  Open storefront
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {presentation.supportGoals.map((goal) => (
            <article key={goal.id} className="overflow-hidden rounded-[30px] border border-white/10 bg-[#111111]">
              <div className="h-52 overflow-hidden">
                <img src={goal.image} alt={goal.title} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{goal.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/64">{goal.summary}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-white/62">
                  <span>${goal.currentAmount.toLocaleString()} raised</span>
                  <span>${goal.targetAmount.toLocaleString()} target</span>
                </div>
                <Link href={goal.ctaHref} className="inline-flex rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370]">
                  {goal.ctaLabel}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
