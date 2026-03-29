import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodHero from '../../components/LandFoodHero';
import { ProductCard } from '../../components/LandFoodCards';
import { categoryMeta, productsByCategory } from '../../data/pillar8Data';

export default function NaturalMaterialsCategoryPage() {
  const meta = categoryMeta['natural-materials-dyes'];
  const items = productsByCategory('natural-materials-dyes');
  return (
    <LandFoodFrame title={meta.label} subtitle={meta.description}>
      <LandFoodHero eyebrow="Category" title="Natural Materials & Dyes" description={meta.description} image={meta.image} chips={['Plant dyes', 'Fibers', 'Craft materials']} actions={[{ href: '/land-food/wholesale-inquiry', label: 'Wholesale Request' }]} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((x) => <ProductCard key={x.id} item={x} />)}</section>
    </LandFoodFrame>
  );
}
