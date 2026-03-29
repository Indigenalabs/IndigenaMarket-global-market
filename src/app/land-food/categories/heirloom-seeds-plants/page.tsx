import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodHero from '../../components/LandFoodHero';
import { ProductCard } from '../../components/LandFoodCards';
import { categoryMeta, productsByCategory } from '../../data/pillar8Data';

export default function HeirloomSeedsCategoryPage() {
  const meta = categoryMeta['heirloom-seeds-plants'];
  const items = productsByCategory('heirloom-seeds-plants');
  return (
    <LandFoodFrame title={meta.label} subtitle={meta.description}>
      <LandFoodHero eyebrow="Category" title="Heirloom Seeds & Native Starts" description={meta.description} image={meta.image} chips={['Seed sovereignty', 'Plant starts', 'Barter-ready']} actions={[{ href: '/land-food/seed-swap', label: 'Open Seed Swap' }]} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((x) => <ProductCard key={x.id} item={x} />)}</section>
    </LandFoodFrame>
  );
}
