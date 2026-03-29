import AdvocacyFrame from '../../components/AdvocacyFrame';
import { CampaignCard, usePillar9Data } from '../../components/AdvocacyCards';

export default function ActiveLegalDefenseCampaignsPage() {
  const { campaigns } = usePillar9Data();
  const filtered = campaigns.filter((x) => x.type === 'legal-defense');
  return (
    <AdvocacyFrame title="Active Legal Defense Campaigns" subtitle="Crowdfunded legal defense for urgent Indigenous rights cases.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => <CampaignCard key={item.id} item={item} />)}
      </section>
    </AdvocacyFrame>
  );
}

