import LandFoodFrame from '../../components/LandFoodFrame';
import LandFoodHero from '../../components/LandFoodHero';
import { ProductCard } from '../../components/LandFoodCards';
import { categoryMeta, productsByCategory } from '../../data/pillar8Data';

export default function GiftBundlesCategoryPage() {
  const meta = categoryMeta['gift-bundle-boxes'];
  const items = productsByCategory('gift-bundle-boxes');
  return (
    <LandFoodFrame title={meta.label} subtitle={meta.description}>
      <LandFoodHero eyebrow="Category" title="Gift & Bundle Boxes" description={meta.description} image={meta.image} chips={['Seasonal bundles', 'Community stories', 'Corporate gifting']} actions={[{ href: '/land-food/wholesale-inquiry', label: 'Bulk Bundle Inquiry' }]} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((x) => <ProductCard key={x.id} item={x} />)}</section>
    </LandFoodFrame>
  );
}
