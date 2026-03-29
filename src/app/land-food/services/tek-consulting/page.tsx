import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodHero from '../../components/LandFoodHero';
import { ServiceCard } from '../../components/LandFoodCards';
import { services } from '../../data/pillar8Data';

export default function TekConsultingDirectoryPage() {
  return (
    <LandFoodFrame title="TEK Consulting Directory" subtitle="Traditional ecological knowledge consulting for policy, planning, and operations.">
      <LandFoodHero
        eyebrow="Knowledge Services"
        title="Traditional Ecological Knowledge Advisory"
        description="Connect with verified practitioners for land management strategy, governance design, and cultural protocol guidance."
        image="https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&h=900&fit=crop"
        chips={['Policy advisory', 'Land planning', 'Cultural protocol']}
        actions={[{ href: '/land-food/wholesale-inquiry', label: 'Institution Inquiry' }]}
      />
      <section className="grid gap-4 md:grid-cols-2">{services.map((x) => <ServiceCard key={x.id} item={x} />)}</section>
    </LandFoodFrame>
  );
}
