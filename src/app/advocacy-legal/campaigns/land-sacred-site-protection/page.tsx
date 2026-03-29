import AdvocacyFrame from '../../components/AdvocacyFrame';
import { CampaignCard, usePillar9Data } from '../../components/AdvocacyCards';

export default function LandSacredSiteProtectionCampaignsPage() {
  const { campaigns } = usePillar9Data();
  const filtered = campaigns.filter((x) => x.type === 'land-defense');
  return (
    <AdvocacyFrame title="Land & Sacred Site Protection Campaigns" subtitle="Campaigns focused on defending lands, waters, and sacred places.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => <CampaignCard key={item.id} item={item} />)}
      </section>
    </AdvocacyFrame>
  );
}

