import Link from 'next/link';
import { listPlatformAccounts, getPlatformAccountBySlug } from '@/app/lib/platformAccounts';
import { getCommunityEntityPresentation } from '@/app/lib/communityEntityPresentation';
import CommunityMarketplaceExplorer from '@/app/components/community/CommunityMarketplaceExplorer';

export const metadata = {
  title: 'Nations & Communities | Indigena Global Market'
};

export default async function CommunitiesPage() {
  const accounts = await listPlatformAccounts({ accountTypes: ['community', 'tribe', 'collective'] });
  const featuredAccount = accounts[0];
  const featuredDetail = featuredAccount ? await getPlatformAccountBySlug(featuredAccount.slug) : null;
  const featuredPresentation = featuredDetail
    ? await getCommunityEntityPresentation(featuredDetail.account, featuredDetail.members, featuredDetail.splitRules)
    : null;

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="overflow-hidden rounded-[38px] border border-white/10 bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
          <div className="relative h-[390px] overflow-hidden">
            <img src={featuredPresentation?.banner || '/communities/nations-hero.svg'} alt="Nations and communities" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.84))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="inline-flex rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#d4af37]">
                Nations & Communities
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">
                Nation storefronts that behave like artist storefronts, just with treasury-aware control.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#e7e0d6]">
                This is not the social Community feed. These pages are the collective version of a storefront: cross-pillar selling, named representatives, support goals, and treasury-aware selling from the same Creator Hub.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/communities/create" className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370]">
                  Create a nation/community page
                </Link>
                <Link href="/community" className="rounded-full border border-white/15 bg-black/25 px-5 py-3 text-sm text-white hover:border-[#d4af37]/35">
                  Go to Community feed
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Entity pages', value: String(accounts.length) },
            { label: 'Approved', value: String(accounts.filter((account) => account.verificationStatus === 'approved').length) },
            { label: 'Pending review', value: String(accounts.filter((account) => account.verificationStatus === 'pending').length) },
            { label: 'Treasury-linked', value: String(accounts.filter((account) => account.treasuryLabel).length) }
          ].map((stat) => (
            <div key={stat.label} className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
              <p className="text-2xl font-semibold text-[#d4af37]">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <CommunityMarketplaceExplorer
          title="Cross-pillar community storefront listings"
          subtitle="Search across the community-owned marketplace by title, trust, and treasury routing before drilling into a specific nation storefront."
          emptyLabel="No community-owned listings match the current marketplace facets."
        />

        <section>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Directory</p>
              <h2 className="mt-2 text-3xl font-semibold">Featured nation storefronts</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-gray-400">
              The strongest pages carry real products, direct support goals, and visible representatives instead of behaving like static registry entries.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {await Promise.all(
              accounts.map(async (account) => {
                const detail = await getPlatformAccountBySlug(account.slug);
                if (!detail) return null;
                const presentation = await getCommunityEntityPresentation(detail.account, detail.members, detail.splitRules);
                return (
                  <article key={account.id} className="overflow-hidden rounded-[32px] border border-white/10 bg-[#101010] shadow-[0_20px_70px_rgba(0,0,0,0.30)]">
                    <div className="relative h-56 overflow-hidden">
                      <img src={presentation.banner} alt={account.displayName} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.82))]" />
                      <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs text-white backdrop-blur">
                        {account.accountType.replace('-', ' ')} | {account.verificationStatus}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/20 bg-black/30">
                          <img src={presentation.avatar} alt={account.displayName} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-white">{account.displayName}</h3>
                          <p className="text-sm text-[#ebe4d7]">
                            {account.nation}
                            {account.location ? ` | ${account.location}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-5 p-5">
                      <p className="text-sm leading-7 text-gray-300">{account.storefrontHeadline || account.description}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {presentation.storefrontItems.slice(0, 2).map((item) => (
                          <div key={item.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">{item.pillarLabel}</p>
                            <p className="mt-2 text-base font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-sm text-white/60">{item.priceLabel}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gray-300">{account.treasuryLabel}</span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gray-300">
                          {presentation.supportGoals.length} featured support goals
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/communities/${account.slug}`} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                          Open storefront
                        </Link>
                        <Link href={`/communities/${account.slug}/store`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35">
                          Storefront
                        </Link>
                        <Link href={`/communities/${account.slug}/treasury`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35">
                          Treasury
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
