import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodHero from '../../components/LandFoodHero';
import { ServiceCard } from '../../components/LandFoodCards';
import { services } from '../../data/pillar8Data';

export default function LandBasedEducationPage() {
  return (
    <LandFoodFrame title="Land-Based Education & Workshops" subtitle="Hands-on education in regenerative agriculture and cultural stewardship.">
      <LandFoodHero
        eyebrow="Learning Services"
        title="Land-Based Education Pathways"
        description="Book workshops, seasonal field sessions, and youth-focused training tied to traditional harvesting cycles."
        image="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1800&h=900&fit=crop"
        chips={['Field workshops', 'Youth training', 'Seasonal curriculum']}
        actions={[{ href: '/land-food/harvest-calendar', label: 'See Seasonal Calendar' }]}
      />
      <section className="grid gap-4 md:grid-cols-2">{services.map((x) => <ServiceCard key={x.id} item={x} />)}</section>
    </LandFoodFrame>
  );
}
