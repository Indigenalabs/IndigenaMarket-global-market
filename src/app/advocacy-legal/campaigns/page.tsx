import AdvocacyFrame from '../components/AdvocacyFrame';
import { CampaignCard } from '../components/AdvocacyCards';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function ViewAllCampaignsPage() {
  const { campaigns } = await getAdvocacyPublicData();
  const urgentCount = campaigns.filter((item) => item.urgent).length;
  const totalRaised = campaigns.reduce((sum, item) => sum + item.raised, 0);

  return (
    <AdvocacyFrame title="View All Campaigns" subtitle="Legal defense, sacred site protection, and policy mobilization campaigns.">
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Donor Discovery</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Support campaigns that show urgency, structure, and accountability</h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-gray-300">
            These campaigns are meant to feel less like generic fundraising cards and more like real legal and advocacy efforts. Look for urgency, campaign type, visible supporter momentum, and whether the trust signal matches the kind of issue you want to back.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/15 bg-[#101112] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Campaign Snapshot</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Urgent Campaigns</p>
              <p className="mt-2 text-sm text-gray-200">{urgentCount} of {campaigns.length} campaigns are marked urgent.</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Visible Raised</p>
              <p className="mt-2 text-sm text-gray-200">${totalRaised.toLocaleString()} shown across current public campaigns.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((item) => <CampaignCard key={item.id} item={item} />)}
      </section>
    </AdvocacyFrame>
  );
}
