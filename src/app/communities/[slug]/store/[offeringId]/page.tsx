import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';
import { getCommunityEntityPresentation } from '@/app/lib/communityEntityPresentation';

export default async function CommunityStoreOfferingDetailPage({
  params
}: {
  params: Promise<{ slug: string; offeringId: string }>;
}) {
  const { slug, offeringId } = await params;
  const data = await getPlatformAccountBySlug(slug);
  if (!data) notFound();

  const presentation = await getCommunityEntityPresentation(data.account, data.members, data.splitRules);
  const item = presentation.storefrontItems.find((entry) => entry.id === offeringId);
  if (!item) notFound();
  const ctaHref = item.sourceHref || `/communities/${slug}/store`;

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link href={`/communities/${slug}/store`} className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:border-[#d4af37]/35">
            Back to storefront
          </Link>
          <Link href={`/communities/${slug}/treasury`} className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:border-[#d4af37]/35">
            Treasury routing
          </Link>
        </div>

        <section className="overflow-hidden rounded-[38px] border border-white/10 bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
          <div className="grid lg:grid-cols-[1.05fr,0.95fr]">
            <div className="relative min-h-[360px] overflow-hidden">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.86))]" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#f3dfb1]">{item.pillarLabel}</p>
                <h1 className="mt-3 text-4xl font-semibold">{item.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">{item.description}</p>
              </div>
            </div>
            <div className="space-y-4 p-6 md:p-8">
              <div className="rounded-[24px] border border-white/10 bg-black/24 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Community-owned offer</p>
                <p className="mt-3 text-xl font-semibold text-white">{data.account.displayName}</p>
                <p className="mt-2 text-sm leading-7 text-white/68">
                  This offer is published in community storefront mode. Routing and reporting follow the community treasury path, not just an individual creator surface.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Price</p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.priceLabel}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Split rule</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.splitLabel}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.10),rgba(0,0,0,0.24))] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Next step</p>
                <p className="mt-3 text-sm leading-7 text-[#ddd6c8]">
                  This detail page lets buyers understand community ownership first. The next button continues into the native pillar flow for purchase, booking, or enrollment.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={ctaHref} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370]">
                    {item.ctaLabel}
                  </Link>
                  <Link href={`/communities/${slug}`} className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:border-[#d4af37]/35">
                    Open entity page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
