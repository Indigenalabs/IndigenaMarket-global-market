import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodHero from '../../components/LandFoodHero';
import { ServiceCard } from '../../components/LandFoodCards';
import { services } from '../../data/pillar8Data';

export default function EcosystemRestorationServicesPage() {
  return (
    <LandFoodFrame title="Ecosystem Restoration Services" subtitle="Native planting, soil recovery, and long-term restoration operations.">
      <LandFoodHero
        eyebrow="Stewardship Services"
        title="Restoration Teams for Land Rehabilitation"
        description="Book community-led teams for native planting plans, invasive control, and biodiversity restoration roadmaps."
        image="https://images.unsplash.com/photo-1470246973918-29a93221c455?w=1800&h=900&fit=crop"
        chips={['Native species recovery', 'Protocol-based methods', 'Multi-year contracts']}
        actions={[{ href: '/land-food/stewardship-application', label: 'Request Restoration Proposal' }]}
      />
      <section className="grid gap-4 md:grid-cols-2">{services.map((x) => <ServiceCard key={x.id} item={x} />)}</section>
    </LandFoodFrame>
  );
}
