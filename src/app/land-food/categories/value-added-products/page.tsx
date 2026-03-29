import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodHero from '../../components/LandFoodHero';
import { ProductCard } from '../../components/LandFoodCards';
import { categoryMeta, productsByCategory } from '../../data/pillar8Data';

export default function ValueAddedCategoryPage() {
  const meta = categoryMeta['value-added-products'];
  const items = productsByCategory('value-added-products');
  return (
    <LandFoodFrame title={meta.label} subtitle={meta.description}>
      <LandFoodHero eyebrow="Category" title="Value-Added Product Shelf" description={meta.description} image={meta.image} chips={['Flours', 'Preserves', 'Blends']} actions={[{ href: '/land-food/marketplace', label: 'Browse Marketplace' }]} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((x) => <ProductCard key={x.id} item={x} />)}</section>
    </LandFoodFrame>
  );
}
