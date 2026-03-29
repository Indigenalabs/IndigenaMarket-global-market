import LandFoodFrame from '../components/LandFoodFrame';
import LandFoodHero from '../components/LandFoodHero';
import { ProducerCard } from '../components/LandFoodCards';
import { producers } from '../data/pillar8Data';

export default function ViewAllCommunitiesPage() {
  return (
    <LandFoodFrame title="View All Communities / Producers" subtitle="Discover Indigenous producers, cooperatives, and regional stewardship groups.">
      <LandFoodHero
        eyebrow="Producer Directory"
        title="Community-Led Production Networks"
        description="Each producer profile includes verification, specialties, seasonal capacity, and stewardship commitments."
        image="https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1800&h=900&fit=crop"
        chips={['Community Verified', 'Regional Profiles', 'Seasonal Capacity']}
        actions={[{ href: '/land-food/marketplace', label: 'Back to Marketplace' }]}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {producers.map((item) => <ProducerCard key={item.id} item={item} />)}
      </section>
    </LandFoodFrame>
  );
}
