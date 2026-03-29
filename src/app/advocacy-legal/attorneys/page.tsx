import AdvocacyFrame from '../components/AdvocacyFrame';
import { AttorneyCard, LegalStatsStrip } from '../components/AdvocacyCards';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function ViewAllAttorneysPage() {
  const { attorneys, stats } = await getAdvocacyPublicData();

  const verificationMix = [
    `${attorneys.filter((item) => item.verified === 'verified').length} verified`,
    `${attorneys.filter((item) => item.verified === 'elder-council').length} elder-council`,
    `${attorneys.filter((item) => item.verified === 'pro-bono-network').length} pro-bono network`
  ];

  return (
    <AdvocacyFrame title="View All Attorneys & Advocates" subtitle="Verified legal professionals across rights, ICIP, repatriation, and land defense.">
      <LegalStatsStrip stats={stats} />

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">How To Choose</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Find the right legal fit, not just a directory card</h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-gray-300">
            These profiles are built to help communities, artists, and organizers understand the kind of support each legal professional is best suited for. Look at specialty, verification path, pro bono access, and whether the profile aligns with the matter you are actually carrying.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/15 bg-[#101112] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Directory Snapshot</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Verification Mix</p>
              <p className="mt-2 text-sm text-gray-200">{verificationMix.join(' - ')}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Pro Bono Path</p>
              <p className="mt-2 text-sm text-gray-200">{attorneys.filter((item) => item.proBono).length} profiles currently signal lower-access intake support.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {attorneys.map((item) => <AttorneyCard key={item.id} item={item} />)}
      </section>
    </AdvocacyFrame>
  );
}
