import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodHero from '../../components/LandFoodHero';
import { ProductCard } from '../../components/LandFoodCards';
import { categoryMeta, productsByCategory } from '../../data/pillar8Data';

export default function TraditionalFoodsCategoryPage() {
  const meta = categoryMeta['traditional-foods'];
  const items = productsByCategory('traditional-foods');
  return (
    <LandFoodFrame title={meta.label} subtitle={meta.description}>
      <LandFoodHero eyebrow="Category" title="Traditional Foods Marketplace" description={meta.description} image={meta.image} chips={['Wild-harvested', 'Heritage crops', 'Seasonal supply']} actions={[{ href: '/land-food/marketplace', label: 'Back to Marketplace' }]} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((x) => <ProductCard key={x.id} item={x} />)}</section>
    </LandFoodFrame>
  );
}
